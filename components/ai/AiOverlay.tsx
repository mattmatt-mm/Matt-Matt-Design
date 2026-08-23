"use client";

import { ArrowLeft } from "@phosphor-icons/react/dist/ssr/ArrowLeft";
import { BorderBeam } from "border-beam";
import { SiteSquircle } from "@/components/SiteSquircle";
import { AiComposer } from "@/components/ai/AiComposer";
import {
  AiContactForm,
  type ContactStatus,
} from "@/components/ai/AiContactForm";
import { AiThinking } from "@/components/ai/AiThinking";

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
  onContactEmailChange: (value: string) => void;
  onContactNoteChange: (value: string) => void;
  onContactSubmit: (company: string) => void;
}) {
  const asking = phase === "ask_primary" || phase === "ask_followup";
  const thinking = phase === "thinking_primary" || phase === "thinking_followup";
  const answering = phase === "answer_primary" || phase === "answer_final";

  return (
    <div className="ai-layer" data-open="true">
      <div className="ai-gradient-mask" aria-hidden="true" />
      <div className="ai-viewport">
        {phase === "contact" ? (
          <AiContactForm
            message={answer}
            email={contactEmail}
            note={contactNote}
            status={contactStatus}
            statusMessage={contactStatusMessage}
            onEmailChange={onContactEmailChange}
            onNoteChange={onContactNoteChange}
            onSubmit={onContactSubmit}
          />
        ) : (
          <div
            className="ai-morph-surface"
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
                responseComplete ? (
                  <div className="ai-answer-stack">
                    <SiteSquircle
                      className="ai-response-squircle elevated-surface"
                    >
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
                    {phase === "answer_primary" ? (
                      <AiComposer
                        value={question}
                        compact
                        showDisclosure={false}
                        autoFocus={false}
                        placeholder="Follow Up?"
                        onChange={onQuestionChange}
                        onSubmit={onFollowUpSubmit}
                      />
                    ) : null}
                  </div>
                ) : (
                  <SiteSquircle asChild>
                    <div className="ai-response elevated-surface">
                      <p>{answer}</p>
                    </div>
                  </SiteSquircle>
                )
              ) : null}
            </div>
          </div>
        )}

        <div className="ai-control-row">
          <button
            type="button"
            className="ai-back"
            aria-label="Close Matt's AI"
            onClick={onClose}
          >
            <ArrowLeft size={16} weight="regular" />
          </button>
        </div>
      </div>
    </div>
  );
}
