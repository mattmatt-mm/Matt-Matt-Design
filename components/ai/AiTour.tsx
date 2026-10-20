"use client";

import { CheckSquare } from "@phosphor-icons/react/dist/ssr/CheckSquare";
import { Square } from "@phosphor-icons/react/dist/ssr/Square";
import { SiteSquircle } from "@/components/SiteSquircle";
import { AiLift } from "@/components/ai/AiLift";
import { DISCIPLINES, type Discipline } from "@/lib/disciplines";

export type TourStep = "cookies" | "offer" | "pick" | "ready";


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
        <AiLift>
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
        </AiLift>

        {step === "pick" ? (
          // A checklist on the email form's surface, not a row of chips: the
          // choices read as one question with three answers, and the only
          // buttons left are the ones that act. Matt, 2026-10-18.
          <AiLift>
            <SiteSquircle asChild>
              <fieldset className="ai-tour-checklist elevated-surface">
                <legend className="sr-only">Skills the role needs</legend>
                {DISCIPLINES.map((d) => {
                  const on = picks.includes(d.value);
                  return (
                    <label key={d.value} className="ai-tour-check">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={on}
                        onChange={() => onToggle(d.value)}
                      />
                      <span>{d.label}</span>
                      <span className="ai-tour-check-box" aria-hidden="true">
                        {on ? (
                          <CheckSquare size={20} weight="fill" />
                        ) : (
                          <Square size={20} weight="regular" />
                        )}
                      </span>
                    </label>
                  );
                })}
              </fieldset>
            </SiteSquircle>
          </AiLift>
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
 * button itself, so its clip path cannot clip the label's focus ring.
 */
function TourButton({
  tone,
  disabled,
  onClick,
  children,
}: {
  /**
   * primary: the action (Accept, Walk me through, Continue, Start
   * walkthrough). secondary: a way out — Decline, No thanks, Ask a question —
   * filled grey like the Notes copy button.
   */
  tone: "primary" | "secondary";
  disabled?: boolean;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="ai-tour-button" data-tone={tone}>
      <SiteSquircle className="ai-tour-button-surface" aria-hidden="true" />
      <button type="button" disabled={disabled} onClick={onClick}>
        {children}
      </button>
    </div>
  );
}
