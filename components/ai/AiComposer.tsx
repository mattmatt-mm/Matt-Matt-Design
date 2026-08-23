"use client";

import { KeyReturn } from "@phosphor-icons/react/dist/ssr/KeyReturn";
import { useEffect, useLayoutEffect, useRef } from "react";
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
}: {
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
    if (autoFocus) input.current?.focus({ preventScroll: true });
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
      <SiteSquircle
        className="ai-composer-surface elevated-surface"
        aria-hidden="true"
      />
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
        <p id="ai-review-disclosure" className="ai-review-disclosure">
          Questions and responses may be reviewed. Do not share personal
          information.
        </p>
      ) : null}
    </div>
  );
}
