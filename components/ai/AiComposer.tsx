"use client";

import { Briefcase } from "@phosphor-icons/react/dist/ssr/Briefcase";
import { Info } from "@phosphor-icons/react/dist/ssr/Info";
import { KeyReturn } from "@phosphor-icons/react/dist/ssr/KeyReturn";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { SiteSquircle } from "@/components/SiteSquircle";
import { MAX_QUESTION_CHARS } from "@/lib/ai/limits";

const COMPACT_COMPOSER_MIN_HEIGHT = 40;
const COMPACT_COMPOSER_MAX_HEIGHT = 80;

export function AiComposer({
  value,
  onChange,
  onSubmit,
  error,
  autoFocus = true,
  placeholder = "Ask me anything",
  compact = false,
  showDisclosure = true,
  onHiring,
}: {
  /** Opens the recruiter walkthrough. */
  onHiring?: () => void;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  error?: string;
  autoFocus?: boolean;
  placeholder?: string;
  compact?: boolean;
  showDisclosure?: boolean;
}) {
  const input = useRef<HTMLTextAreaElement>(null);
  const composing = useRef(false);

  useEffect(() => {
    if (!autoFocus) return;
    // A touch device raises its on-screen keyboard the moment a field takes
    // focus, which covers the surface before anyone has decided to type. There
    // the field waits to be tapped; a pointer has no such cost, so it still
    // opens ready to type.
    if (window.matchMedia("(pointer: coarse)").matches) return;
    input.current?.focus({ preventScroll: true });
  }, [autoFocus]);

  useLayoutEffect(() => {
    const textarea = input.current;
    if (!textarea || !compact) return;

    const fitCompactComposer = () => {
      textarea.style.height = "0px";
      const contentHeight = textarea.scrollHeight;
      textarea.style.height = `${Math.min(
        COMPACT_COMPOSER_MAX_HEIGHT,
        Math.max(COMPACT_COMPOSER_MIN_HEIGHT, contentHeight),
      )}px`;
      textarea.style.overflowY =
        contentHeight > COMPACT_COMPOSER_MAX_HEIGHT ? "auto" : "hidden";
    };

    fitCompactComposer();
    window.addEventListener("resize", fitCompactComposer);
    return () => window.removeEventListener("resize", fitCompactComposer);
  }, [compact, value]);

  return (
    <div className="ai-composer" data-compact={compact ? "true" : "false"}>
      {/* The dock's lift: the drop shadow sits on this wrapper, because the
          squircle's clip path would cut it off the surface itself. The
          surface keeps the dock's 1px rim. */}
      <div className="ai-composer-shadow" aria-hidden="true">
        <SiteSquircle
          className="ai-composer-surface navigation-surface"
          aria-hidden="true"
        />
      </div>
      <textarea
        ref={input}
        value={value}
        maxLength={MAX_QUESTION_CHARS}
        rows={compact ? 1 : 3}
        aria-label="Ask Matt's AI a question"
        aria-describedby={
          error
            ? "ai-composer-error"
            : showDisclosure
              ? "ai-review-disclosure"
              : undefined
        }
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        onCompositionStart={() => {
          composing.current = true;
        }}
        onCompositionEnd={() => {
          composing.current = false;
        }}
        onKeyDown={(event) => {
          if (
            event.key === "Enter" &&
            !event.shiftKey &&
            !event.nativeEvent.isComposing &&
            !composing.current
          ) {
            event.preventDefault();
            onSubmit();
          }
        }}
      />
      <button
        type="button"
        className="ai-composer-submit"
        aria-label="Send question"
        disabled={!value.trim()}
        onClick={onSubmit}
      >
        <KeyReturn size={18} weight="regular" />
      </button>
      {error ? (
        <p id="ai-composer-error" className="ai-composer-error">
          {error}
        </p>
      ) : showDisclosure ? (
        <ComposerAside onHiring={onHiring} />
      ) : null}
    </div>
  );
}

/**
 * The row above the field: the way into the recruiter walkthrough on the left
 * (doc/hr-mode-plan.md), and the review notice folded into an info button on
 * the right, opening as a tooltip on hover, focus or tap. Floats over the
 * first question's composer; `inline` takes its place in the flow above a
 * follow-up, so it is still there once a conversation exists.
 */
export function ComposerAside({
  onHiring,
  inline = false,
}: {
  onHiring?: () => void;
  inline?: boolean;
}) {
  const [infoOpen, setInfoOpen] = useState(false);
  return (
    <div className="ai-composer-aside" data-inline={inline ? "true" : "false"}>
      {onHiring ? (
        <button type="button" className="ai-hiring" onClick={onHiring}>
          <Briefcase size={16} weight="regular" aria-hidden="true" />
          I&rsquo;m hiring
        </button>
      ) : (
        <span />
      )}
      <span
        className="ai-info"
        data-open={infoOpen ? "true" : "false"}
        onMouseEnter={() => setInfoOpen(true)}
        onMouseLeave={() => setInfoOpen(false)}
      >
        <button
          type="button"
          className="ai-info-button"
          aria-label="About privacy"
          aria-describedby="ai-review-disclosure"
          aria-expanded={infoOpen}
          onClick={() => setInfoOpen((open) => !open)}
          onFocus={() => setInfoOpen(true)}
          onBlur={() => setInfoOpen(false)}
        >
          <Info size={16} weight="regular" />
        </button>
        <SiteSquircle asChild>
          <span
            id="ai-review-disclosure"
            role="tooltip"
            className="ai-info-tooltip elevated-surface"
          >
            Questions and responses may be reviewed. Do not share personal
            information.
          </span>
        </SiteSquircle>
      </span>
    </div>
  );
}
