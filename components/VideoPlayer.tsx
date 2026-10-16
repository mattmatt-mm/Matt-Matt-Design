"use client";

import { CornersIn } from "@phosphor-icons/react/dist/ssr/CornersIn";
import { CornersOut } from "@phosphor-icons/react/dist/ssr/CornersOut";
import { Pause } from "@phosphor-icons/react/dist/ssr/Pause";
import { PictureInPicture } from "@phosphor-icons/react/dist/ssr/PictureInPicture";
import { Play } from "@phosphor-icons/react/dist/ssr/Play";
import { useCallback, useEffect, useRef, useState } from "react";
import { SiteSquircle } from "@/components/SiteSquircle";

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
 * frame. The recordings are silent, so there is no volume control to promise
 * sound that is not there.
 *
 * It plays muted and looped while it is on screen and pauses when it leaves.
 * Once the reader pauses it themselves, scrolling never restarts it.
 */
export function VideoPlayer({
  src,
  poster,
  title,
  width,
  height,
}: {
  src: string;
  poster?: string;
  title?: string;
  width?: number;
  height?: number;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const idleTimer = useRef<number>(0);
  const pausedByReader = useRef(false);
  const scrubbing = useRef(false);

  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [active, setActive] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [pipSupported, setPipSupported] = useState(false);

  // The bar is up while paused, and for a moment after any pointer movement.
  const wake = useCallback(() => {
    setActive(true);
    window.clearTimeout(idleTimer.current);
    idleTimer.current = window.setTimeout(() => {
      if (!scrubbing.current) setActive(false);
    }, IDLE_MS);
  }, []);

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

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!reduceMotion && !pausedByReader.current) {
            video.play().catch(() => {});
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
      document.removeEventListener("fullscreenchange", onFullscreen);
      window.clearTimeout(idleTimer.current);
    };
  }, []);

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
    wake();
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
  const shown = active || !playing;

  return (
    // SiteSquircle keeps its own ref for measuring, so the fullscreen target
    // and the pointer listeners live on a plain wrapper around it.
    <div
      ref={frameRef}
      className="video-player"
      data-controls={shown ? "shown" : "hidden"}
      onPointerMove={wake}
      onPointerDown={wake}
      onFocus={wake}
    >
      <SiteSquircle className="video-player-frame">
        <video
          ref={videoRef}
          className="video-player-media"
          src={src}
          poster={poster}
          width={width}
          height={height}
          title={title}
          muted
          loop
          playsInline
          preload="metadata"
          onClick={togglePlay}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onDurationChange={(e) => setDuration(e.currentTarget.duration)}
        />

        <SiteSquircle className="video-player-bar">
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
            onPointerUp={() => {
              scrubbing.current = false;
              wake();
            }}
            onPointerCancel={() => {
              scrubbing.current = false;
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
