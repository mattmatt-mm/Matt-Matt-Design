"use client";

import { ArrowLeft } from "@phosphor-icons/react/dist/ssr/ArrowLeft";
import { ChatCircle } from "@phosphor-icons/react/dist/ssr/ChatCircle";
import { Envelope } from "@phosphor-icons/react/dist/ssr/Envelope";
import { BorderBeam } from "border-beam";
import { SiteSquircle } from "@/components/SiteSquircle";
import { AiComposer } from "@/components/ai/AiComposer";
import {
  AiContactForm,
  type ContactStatus,
} from "@/components/ai/AiContactForm";
import { AiThinking } from "@/components/ai/AiThinking";
import { MAX_AI_TURNS } from "@/lib/ai/limits";
import { useLayoutEffect, useRef } from "react";

export type AIPhase =
  | "ask_primary"
  | "thinking_primary"
  | "answer_primary"
  | "ask_followup"
  | "thinking_followup"
  | "answer_final"
  | "contact";

export function AiOverlay({
  phase,
  question,
  answer,
  responseComplete,
  composerError,
  contactEmail,
  contactNote,
  contactStatus,
  contactStatusMessage,
  onQuestionChange,
  onQuestionSubmit,
  onFollowUpSubmit,
  onClose,
  onToggleContact,
  leaving,
  crossDirection,
  turnsLeft,
  onContactEmailChange,
  onContactNoteChange,
  onContactSubmit,
}: {
  phase: AIPhase;
  question: string;
  answer: string;
  responseComplete: boolean;
  composerError?: string;
  contactEmail: string;
  contactNote: string;
  contactStatus: ContactStatus;
  contactStatusMessage?: string;
  onQuestionChange: (value: string) => void;
  onQuestionSubmit: () => void;
  onFollowUpSubmit: () => void;
  onClose: () => void;
  onToggleContact: () => void;
  leaving: boolean;
  crossDirection: "to-email" | "to-chat" | null;
  turnsLeft: number;
  onContactEmailChange: (value: string) => void;
  onContactNoteChange: (value: string) => void;
  onContactSubmit: (company: string) => void;
}) {
  const asking = phase === "ask_primary" || phase === "ask_followup";
  const thinking = phase === "thinking_primary" || phase === "thinking_followup";
  const answering = phase === "answer_primary" || phase === "answer_final";
  // Nothing to swap between until an answer exists, and nothing worth
  // interrupting while one is still arriving.
  const canToggleContact =
    (phase === "contact" || answering) && responseComplete;
  // Once an answer has finished, both sides of the handoff render from the
  // single exchange surface below rather than from the morphing one.
  const settled = responseComplete && (answering || phase === "contact");

  // The answer keeps its place across the crossing by moving from where it
  // was to where it now is. Nothing else can do this: a torn-down element has
  // no previous position to come from.
  const answerRef = useRef<HTMLDivElement>(null);
  const lastAnswerTop = useRef<number | null>(null);

  useLayoutEffect(() => {
    const node = answerRef.current;
    if (!node) {
      lastAnswerTop.current = null;
      return;
    }
    const top = node.getBoundingClientRect().top;
    const previous = lastAnswerTop.current;
    lastAnswerTop.current = top;
    if (previous === null || Math.abs(previous - top) < 1) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    node.animate(
      [
        { transform: `translateY(${previous - top}px)` },
        { transform: "translateY(0)" },
      ],
      { duration: 300, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
    );
  }, [phase, answer, settled]);

  return (
    <div className="ai-layer" data-open="true">
      <div className="ai-gradient-mask" aria-hidden="true" />
      <div className="ai-viewport">
        {settled ? (
          // One surface for both sides of the handoff. The answer is mounted
          // once here and never torn down, so when the thing beneath it
          // changes size it travels to its new position rather than vanishing
          // and reappearing somewhere else.
          <div className="ai-exchange">
            <div ref={answerRef} className="ai-exchange-answer">
              <SiteSquircle className="ai-response-squircle elevated-surface">
                <BorderBeam
                  size="line"
                  colorVariant="sunset"
                  theme="dark"
                  borderRadius={16}
                  className="ai-response-beam"
                >
                  <div className="ai-response">
                    <p>{answer}</p>
                  </div>
                </BorderBeam>
              </SiteSquircle>
            </div>

            <div
              key={phase === "contact" ? "email" : "chat"}
              className="ai-exchange-swap"
              data-dir={crossDirection ?? undefined}
              data-leaving={leaving ? "true" : "false"}
            >
              {phase === "contact" ? (
                <AiContactForm
                  email={contactEmail}
                  note={contactNote}
                  status={contactStatus}
                  statusMessage={contactStatusMessage}
                  onEmailChange={onContactEmailChange}
                  onNoteChange={onContactNoteChange}
                  onSubmit={onContactSubmit}
                />
              ) : turnsLeft > 0 ? (
                <AiComposer
                  value={question}
                  compact
                  showDisclosure={false}
                  autoFocus={false}
                  placeholder="Follow Up?"
                  onChange={onQuestionChange}
                  onSubmit={onFollowUpSubmit}
                />
              ) : (
                // The conversation is spent. Say so where the next prompt
                // would have been, and make the sentence the way out rather
                // than a dead end beside one.
                <button
                  type="button"
                  className="ai-turns-spent"
                  onClick={onToggleContact}
                >
                  That is all {MAX_AI_TURNS} questions. Email Matt for more.
                </button>
              )}
            </div>
          </div>
        ) : (
          <div
            className="ai-morph-surface"
            data-leaving={leaving ? "true" : "false"}
            data-kind={
              asking
                ? "ask"
                : thinking
                  ? "thinking"
                  : phase === "answer_primary" && responseComplete
                    ? "answer-followup"
                    : "answer"
            }
          >
            <div key={phase} className="ai-content-enter">
              {asking ? (
                <AiComposer
                  value={question}
                  error={composerError}
                  onChange={onQuestionChange}
                  onSubmit={onQuestionSubmit}
                />
              ) : null}
              {thinking ? <AiThinking /> : null}
              {answering ? (
                <SiteSquircle asChild>
                  <div className="ai-response elevated-surface">
                    <p>{answer}</p>
                  </div>
                </SiteSquircle>
              ) : null}
            </div>
          </div>
        )}

        <div className="ai-control-row">
          <button
            type="button"
            className="ai-control"
            data-side="left"
            aria-label="Close Matt's AI"
            onClick={onClose}
          >
            <ArrowLeft size={24} weight="regular" />
          </button>

          {/* Handing someone a form used to end the conversation: the contact
              phase replaced the answer and its follow-up outright, with no way
              back. The two are now sides of one thing, and this crosses
              between them. The icon is the side you are not on. */}
          {canToggleContact ? (
            <button
              type="button"
              className="ai-control"
              data-side="right"
              aria-label={
                phase === "contact"
                  ? "Back to the conversation"
                  : "Leave an email for Matt instead"
              }
              onClick={onToggleContact}
            >
              <span key={phase === "contact" ? "chat" : "mail"} className="ai-control-icon">
                {phase === "contact" ? (
                  <ChatCircle size={24} weight="regular" />
                ) : (
                  <Envelope size={24} weight="regular" />
                )}
              </span>
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
