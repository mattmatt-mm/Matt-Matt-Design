"use client";

import {
  SITE_SQUIRCLE_RADIUS,
  SiteSquircle,
} from "@/components/SiteSquircle";
import { DISCIPLINES, type Discipline } from "@/lib/disciplines";

export type TourStep = "cookies" | "offer" | "pick" | "ready";

/** The quiet button's ring, in px. Matches --tour-ring in globals.css. */
const TOUR_RING = 1.5;

/**
 * The guided tour the AI offers a first-time visitor: an offer, a choice of
 * the kinds of work to see, then the walkthrough itself. It sits where the
 * conversation would, built from the same surfaces — the black response and
 * squircle buttons 8px beneath it. See doc/hr-mode-plan.md.
 */
export function AiTour({
  step,
  picks,
  onAccept,
  onDecline,
  onToggle,
  onContinue,
  onStart,
  onAskInstead,
  onAcceptCookies,
  onDeclineCookies,
}: {
  onAcceptCookies: () => void;
  onDeclineCookies: () => void;
  /** Back to the conversation, when the picks were opened from the cloud. */
  onAskInstead?: () => void;
  step: TourStep;
  picks: Discipline[];
  onAccept: () => void;
  onDecline: () => void;
  onToggle: (value: Discipline) => void;
  onContinue: () => void;
  /** Gets the button, so the splash can carry it away. */
  onStart: (button: HTMLElement) => void;
}) {
  return (
    <div className="ai-exchange">
      {/* Remounted per step, so each one rises in as an answer would. */}
      <div key={step} className="ai-tour-step">
        <SiteSquircle className="ai-response-squircle elevated-surface">
          <div className="ai-response" role="status">
            {step === "cookies" ? (
              <>
                <p>
                  Hi, I&rsquo;m Matt&rsquo;s AI. Can Matt use cookies to see how
                  visitors use his site?
                </p>
                <p className="ai-tour-note">
                  He sees which pages are opened and what is clicked, and uses
                  it only to improve the site.
                </p>
              </>
            ) : step === "offer" ? (
              <p>
                Hiring? I can walk you through the case studies that match the
                role you&rsquo;re filling.
              </p>
            ) : step === "pick" ? (
              <p>Which skills does the role need? Pick as many as apply.</p>
            ) : (
              <p>
                Here is the customised case study walkthrough that may interest
                you.
              </p>
            )}
          </div>
        </SiteSquircle>

        {step === "pick" ? (
          <div className="ai-tour-chips" role="group" aria-label="Kinds of work">
            {DISCIPLINES.map((d) => {
              const on = picks.includes(d.value);
              return (
                <TourButton
                  key={d.value}
                  tone={on ? "primary" : "outline"}
                  pressed={on}
                  onClick={() => onToggle(d.value)}
                >
                  {d.label}
                </TourButton>
              );
            })}
          </div>
        ) : null}

        <div className="ai-tour-actions">
          {step === "cookies" ? (
            <>
              <TourButton tone="secondary" onClick={onDeclineCookies}>
                Decline
              </TourButton>
              <TourButton tone="primary" onClick={onAcceptCookies}>
                Accept
              </TourButton>
            </>
          ) : step === "offer" ? (
            <>
              <TourButton tone="secondary" onClick={onDecline}>
                No thanks
              </TourButton>
              <TourButton tone="primary" onClick={onAccept}>
                Walk me through
              </TourButton>
            </>
          ) : step === "pick" ? (
            <>
              {onAskInstead ? (
                <TourButton tone="secondary" onClick={onAskInstead}>
                  Ask a question
                </TourButton>
              ) : null}
              <TourButton
                tone="primary"
                disabled={!picks.length}
                onClick={onContinue}
              >
                Continue
              </TourButton>
            </>
          ) : (
            <TourButton tone="primary" onClick={(event) => onStart(event.currentTarget)}>
              Start walkthrough
            </TourButton>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * A squircle button. The surface is a sibling under the label rather than the
 * button itself, so its clip path cannot clip the elevation filter.
 */
function TourButton({
  tone,
  pressed,
  disabled,
  onClick,
  children,
}: {
  /**
   * primary: the action, and a chosen chip (filled). outline: a chip not yet
   * chosen. secondary: a way out — No thanks, Ask a question — filled grey
   * like the Notes copy button, so it never reads as an unchosen chip.
   */
  tone: "primary" | "secondary" | "outline";
  pressed?: boolean;
  disabled?: boolean;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="ai-tour-button" data-tone={tone}>
      {/* Two squircles, one inside the other: the outer one shows as a ring
          on an outline chip. A CSS border or inset shadow would follow
          border-radius, not the squircle, and part at the corners. */}
      <SiteSquircle className="ai-tour-button-surface" aria-hidden="true" />
      <SiteSquircle
        className="ai-tour-button-fill"
        cornerRadius={SITE_SQUIRCLE_RADIUS - TOUR_RING}
        aria-hidden="true"
      />
      <button
        type="button"
        aria-pressed={pressed}
        disabled={disabled}
        onClick={onClick}
      >
        {children}
      </button>
    </div>
  );
}
