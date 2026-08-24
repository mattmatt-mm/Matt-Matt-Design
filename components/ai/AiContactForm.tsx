"use client";

import { BorderBeam } from "border-beam";
import type { FormEvent } from "react";
import { SiteSquircle } from "@/components/SiteSquircle";
import { MAX_EMAIL_CHARS, MAX_NOTE_CHARS } from "@/lib/ai/limits";

export type ContactStatus = "idle" | "sending" | "sent" | "error";

export function AiContactForm({
  leaving,
  message,
  email,
  note,
  status,
  statusMessage,
  onEmailChange,
  onNoteChange,
  onSubmit,
}: {
  leaving?: boolean;
  message: string;
  email: string;
  note: string;
  status: ContactStatus;
  statusMessage?: string;
  onEmailChange: (value: string) => void;
  onNoteChange: (value: string) => void;
  onSubmit: (company: string) => void;
}) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    onSubmit(String(data.get("company") ?? ""));
  }

  const buttonLabel =
    status === "sending"
      ? "Sending..."
      : status === "sent"
        ? "Sent to Matt"
        : status === "error"
          ? "Try again"
          : "Send to Matt";

  return (
    <div
      className="ai-contact-stack"
      data-leaving={leaving ? "true" : "false"}
    >
      <SiteSquircle className="ai-contact-response-squircle elevated-surface">
        <BorderBeam
          size="line"
          colorVariant="sunset"
          theme="dark"
          borderRadius={16}
          className="ai-response-beam ai-contact-response-beam"
        >
          <div className="ai-response ai-contact-response">
            <p>{message}</p>
          </div>
        </BorderBeam>
      </SiteSquircle>
      <form className="ai-contact-form" onSubmit={submit}>
        <SiteSquircle asChild>
          <div className="ai-contact-fields elevated-surface">
            <label>
              <span>Email</span>
              <input
                type="email"
                name="email"
                value={email}
                maxLength={MAX_EMAIL_CHARS}
                autoComplete="email"
                inputMode="email"
                placeholder="you@example.com"
                required
                disabled={status === "sending" || status === "sent"}
                onChange={(event) => onEmailChange(event.target.value)}
              />
            </label>
            <label>
              <span>Notes</span>
              <textarea
                name="note"
                value={note}
                maxLength={MAX_NOTE_CHARS}
                rows={3}
                placeholder={
                  "• How should Matt call you?\n• What is your enquiry?"
                }
                disabled={status === "sending" || status === "sent"}
                onChange={(event) => onNoteChange(event.target.value)}
              />
            </label>
            <label className="ai-honeypot" aria-hidden="true">
              Company
              <input name="company" tabIndex={-1} autoComplete="off" />
            </label>
            {statusMessage ? (
              <p className="ai-contact-status" role="status">
                {statusMessage}
              </p>
            ) : null}
          </div>
        </SiteSquircle>
        <div className="ai-contact-submit-shell">
          <SiteSquircle
            className="ai-contact-submit-surface elevated-surface"
            aria-hidden="true"
          />
          <button
            className="ai-contact-submit"
            type="submit"
            disabled={
              status === "sending" || status === "sent" || !email.trim()
            }
          >
            {buttonLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
