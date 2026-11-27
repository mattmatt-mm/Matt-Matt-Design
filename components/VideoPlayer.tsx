"use client";

import { CornersIn } from "@phosphor-icons/react/dist/ssr/CornersIn";
import { CornersOut } from "@phosphor-icons/react/dist/ssr/CornersOut";
import { Pause } from "@phosphor-icons/react/dist/ssr/Pause";
import { PictureInPicture } from "@phosphor-icons/react/dist/ssr/PictureInPicture";
import { Play } from "@phosphor-icons/react/dist/ssr/Play";
import { SpeakerSimpleHigh } from "@phosphor-icons/react/dist/ssr/SpeakerSimpleHigh";
import { SpeakerSimpleX } from "@phosphor-icons/react/dist/ssr/SpeakerSimpleX";
import { useCallback, useEffect, useRef, useState } from "react";
import { SiteSquircle, THUMBNAIL_SQUIRCLE_RADIUS } from "@/components/SiteSquircle";

/** How long the bar stays up after the pointer stops moving over a playing video. */
const IDLE_MS = 2000;
const SEEK_STEP = 5;

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) seconds = 0;
  const s = Math.floor(seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

type WebkitVideo = HTMLVideoElement & { webkitEnterFullscreen?: () => void };

/**
 * A case-study screen recording with a floating control bar, after the
 * Video.js v10 player: play, elapsed time, a scrubber, time remaining,
 * picture-in-picture, and fullscreen on one blurred strip inset from the
 * frame. Videos with a soundtrack can opt in to a mute control.
 *
 * It loops while on screen and pauses when it leaves. Autoplay is muted by
 * default. Fun detail pages can opt in to starting with sound.
 * Once the reader pauses it themselves, scrolling never restarts it.
 */
export function VideoPlayer({
  src,
  poster,
  title,
  width,
  height,
  flush = false,
  hasSound = false,
  autoPlayWithSound = false,
}: {
  src: string;
  poster?: string;
  title?: string;
  width?: number;
  height?: number;
  hasSound?: boolean;
  autoPlayWithSound?: boolean;
  /** Square corners when the surrounding media frame supplies the shape. */
  flush?: boolean;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const idleTimer = useRef<number>(0);
  const pausedByReader = useRef(false);
  const scrubbing = useRef(false);
  const soundOnEntry = hasSound && autoPlayWithSound;

  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(!soundOnEntry);
  const [needsPlay, setNeedsPlay] = useState(false);
  const [controlsShown, setControlsShown] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [pipSupported, setPipSupported] = useState(false);

  const scheduleControlsHide = useCallback(() => {
    window.clearTimeout(idleTimer.current);
    idleTimer.current = window.setTimeout(() => {
      if (
        videoRef.current?.paused === false &&
        !scrubbing.current &&
        !frameRef.current?.querySelector(":focus-visible")
      ) {
        setControlsShown(false);
      }
    }, IDLE_MS);
  }, []);

  const resetControlsTimer =
    controlsShown && playing ? scheduleControlsHide : undefined;

  useEffect(() => {
    if (!resetControlsTimer) return;
    resetControlsTimer();
    return () => window.clearTimeout(idleTimer.current);
  }, [resetControlsTimer]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    // The server-rendered element can load its metadata before hydration, in
    // which case the event has already fired and nobody heard it.
    if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
      setDuration(video.duration);
    }
    setPipSupported(
      "pictureInPictureEnabled" in document &&
        document.pictureInPictureEnabled &&
        !video.disablePictureInPicture,
    );

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion && soundOnEntry) setNeedsPlay(true);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!reduceMotion && !pausedByReader.current) {
            video.play().catch((error: unknown) => {
              if (soundOnEntry && video.isConnected && video.paused && error instanceof DOMException && error.name === "NotAllowedError") {
                setNeedsPlay(true);
              }
            });
          }
        } else if (
          !video.paused &&
          document.pictureInPictureElement !== video
        ) {
          video.pause();
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(video);

    const onFullscreen = () =>
      setFullscreen(document.fullscreenElement === frameRef.current);
    document.addEventListener("fullscreenchange", onFullscreen);

    return () => {
      observer.disconnect();
      if (soundOnEntry) video.pause();
      document.removeEventListener("fullscreenchange", onFullscreen);
    };
  }, [soundOnEntry]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      pausedByReader.current = false;
      video.play().catch(() => {});
    } else {
      pausedByReader.current = true;
      video.pause();
    }
  };

  const seekTo = (seconds: number) => {
    const video = videoRef.current;
    if (!video || !duration) return;
    video.currentTime = Math.min(Math.max(seconds, 0), duration);
    setTime(video.currentTime);
  };

  const seekFromPointer = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return;
    seekTo(((clientX - rect.left) / rect.width) * duration);
  };

  const togglePip = async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await video.requestPictureInPicture();
      }
    } catch {}
  };

  const toggleFullscreen = async () => {
    const frame = frameRef.current;
    const video = videoRef.current as WebkitVideo | null;
    if (!frame || !video) return;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else if (frame.requestFullscreen) {
        await frame.requestFullscreen();
      } else {
        // iOS Safari only lets the video element itself go fullscreen.
        video.webkitEnterFullscreen?.();
      }
    } catch {}
  };

  const progress = duration ? (time / duration) * 100 : 0;
  const playbackLabel = playing ? "Pause video" : "Play video";
  return (
    // SiteSquircle keeps its own ref for measuring, so the fullscreen target
    // and the pointer listeners live on a plain wrapper around it.
    <div
      ref={frameRef}
      className="video-player"
      data-controls={controlsShown ? "shown" : "hidden"}
      data-has-sound={hasSound || undefined}
      onPointerMove={resetControlsTimer}
      onPointerDown={resetControlsTimer}
      onBlur={resetControlsTimer}
    >
      <SiteSquircle
        className="video-player-frame"
        cornerRadius={flush ? 0 : THUMBNAIL_SQUIRCLE_RADIUS}
      >
        <video
          ref={videoRef}
          className="video-player-media"
          src={src}
          poster={poster}
          width={width}
          height={height}
          title={title}
          muted={muted}
          loop
          playsInline
          preload="metadata"
          onPlay={() => {
            setNeedsPlay(false);
            setPlaying(true);
          }}
          onPause={() => setPlaying(false)}
          onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onDurationChange={(e) => setDuration(e.currentTarget.duration)}
          onVolumeChange={hasSound ? (e) => setMuted(e.currentTarget.muted) : undefined}
        />

        <button
          type="button"
          className="video-player-trigger"
          aria-label={needsPlay ? "Play with sound" : controlsShown ? playbackLabel : "Show video controls"}
          onClick={() => {
            if (needsPlay || controlsShown) togglePlay();
            setControlsShown(true);
          }}
        >
          {needsPlay && (
            <span className="video-player-start">
              <Play weight="fill" aria-hidden />
              Play with sound
            </span>
          )}
        </button>

        <SiteSquircle className="video-player-bar" inert={!controlsShown}>
          <button
            type="button"
            className="video-player-button"
            onClick={togglePlay}
            aria-label={playing ? "Pause" : "Play"}
          >
            {playing ? (
              <Pause weight="fill" aria-hidden />
            ) : (
              <Play weight="fill" aria-hidden />
            )}
          </button>

          <span className="video-player-time">{formatTime(time)}</span>

          <div
            ref={trackRef}
            className="video-player-scrubber"
            role="slider"
            tabIndex={0}
            aria-label="Seek"
            aria-valuemin={0}
            aria-valuemax={Math.round(duration)}
            aria-valuenow={Math.round(time)}
            aria-valuetext={`${formatTime(time)} of ${formatTime(duration)}`}
            onPointerDown={(e) => {
              scrubbing.current = true;
              e.currentTarget.setPointerCapture(e.pointerId);
              seekFromPointer(e.clientX);
            }}
            onPointerMove={(e) => {
              if (scrubbing.current) seekFromPointer(e.clientX);
            }}
            onLostPointerCapture={() => {
              scrubbing.current = false;
              resetControlsTimer?.();
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") seekTo(time + SEEK_STEP);
              else if (e.key === "ArrowLeft") seekTo(time - SEEK_STEP);
              else if (e.key === "Home") seekTo(0);
              else if (e.key === "End") seekTo(duration);
              else return;
              e.preventDefault();
            }}
          >
            <div className="video-player-track">
              <div
                className="video-player-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div
              className="video-player-thumb"
              style={{ left: `${progress}%` }}
              aria-hidden
            />
          </div>

          <span className="video-player-time">
            -{formatTime(duration - time)}
          </span>

          {hasSound && (
            <button
              type="button"
              className="video-player-button"
              aria-label={muted ? "Turn on sound" : "Mute sound"}
              onClick={() => {
                const video = videoRef.current;
                if (video) video.muted = !video.muted;
              }}
            >
              {muted ? <SpeakerSimpleX aria-hidden /> : <SpeakerSimpleHigh aria-hidden />}
            </button>
          )}

          {pipSupported && (
            <button
              type="button"
              className="video-player-button"
              onClick={togglePip}
              aria-label="Picture in picture"
            >
              <PictureInPicture aria-hidden />
            </button>
          )}

          <button
            type="button"
            className="video-player-button"
            onClick={toggleFullscreen}
            aria-label={fullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            {fullscreen ? (
              <CornersIn aria-hidden />
            ) : (
              <CornersOut aria-hidden />
            )}
          </button>
        </SiteSquircle>
      </SiteSquircle>
    </div>
  );
}
