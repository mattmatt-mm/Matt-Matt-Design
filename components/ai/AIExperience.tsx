"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { AiDock } from "@/components/ai/AiDock";
import { AiOverlay, type AIPhase } from "@/components/ai/AiOverlay";
import type { ContactStatus } from "@/components/ai/AiContactForm";
import type { BloubExpressionId } from "@/components/ai/vendor/bloub/bloub";

type Exchange = { question: string; answer: string };

async function responseError(response: Response) {
  try {
    const body = (await response.json()) as { error?: string };
    return body.error || "Matt's AI is unavailable right now.";
  } catch {
    return "Matt's AI is unavailable right now.";
  }
}

export function AIExperience({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const trigger = useRef<HTMLButtonElement | null>(null);
  const requestInFlight = useRef(false);
  const contactInFlight = useRef(false);
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<AIPhase>("ask_primary");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [composerError, setComposerError] = useState<string>();
  const [contactEmail, setContactEmail] = useState("");
  const [contactNote, setContactNote] = useState("");
  const [contactStatus, setContactStatus] = useState<ContactStatus>("idle");
  const [contactStatusMessage, setContactStatusMessage] = useState<string>();
  const [announcement, setAnnouncement] = useState("");
  const [responseComplete, setResponseComplete] = useState(false);

  const close = useCallback(() => {
    setOpen(false);
    requestAnimationFrame(() => trigger.current?.focus());
  }, []);


  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, [close, open]);

  async function ask(turnOverride?: 1 | 2) {
    if (requestInFlight.current) return;
    const cleanQuestion = question.trim();
    if (!cleanQuestion) return;
    requestInFlight.current = true;
    const turn = turnOverride ?? (phase === "ask_followup" ? 2 : 1);
    const thinkingPhase = turn === 1 ? "thinking_primary" : "thinking_followup";
    const answeringPhase = turn === 1 ? "answer_primary" : "answer_final";
    const firstQuestion = exchanges[0]?.question;

    setComposerError(undefined);
    setAnswer("");
    setResponseComplete(false);
    setPhase(thinkingPhase);
    setAnnouncement("Thinking");

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: cleanQuestion,
          turn,
          firstQuestion: turn === 2 ? firstQuestion : undefined,
        }),
      });
      if (!response.ok || !response.body) {
        throw new Error(await responseError(response));
      }

      const outcome = response.headers.get("x-ai-outcome");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let complete = "";
      let firstToken = true;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        if (!chunk) continue;
        complete += chunk;
        if (firstToken) {
          firstToken = false;
          setPhase(answeringPhase);
        }
        setAnswer(complete);
      }

      complete += decoder.decode();
      if (!complete.trim()) throw new Error("Matt's AI did not return an answer.");

      const exchange = { question: cleanQuestion, answer: complete.trim() };
      setExchanges((previous) =>
        turn === 1 ? [exchange] : [previous[0], exchange].filter(Boolean),
      );
      setAnswer(exchange.answer);
      setQuestion("");
      setAnnouncement("Answer ready");
      setPhase(outcome === "contact" ? "contact" : answeringPhase);
      setResponseComplete(true);
    } catch (error) {
      setResponseComplete(false);
      setPhase(turn === 1 ? "ask_primary" : "ask_followup");
      const message = error instanceof Error ? error.message : "Please try again.";
      setComposerError(message);
      setAnnouncement(message);
    } finally {
      requestInFlight.current = false;
    }
  }

  async function sendContact(company: string) {
    if (contactInFlight.current) return;
    contactInFlight.current = true;
    setContactStatus("sending");
    setContactStatusMessage(undefined);
    setAnnouncement("Sending email to Matt");
    try {
      const response = await fetch("/api/ai/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: contactEmail, note: contactNote, company }),
      });
      const body = (await response.json()) as { message?: string; error?: string };
      if (!response.ok) throw new Error(body.error || "That did not send.");
      setContactStatus("sent");
      setContactStatusMessage(body.message ?? "Sent to Matt.");
      setAnnouncement("Email sent to Matt");
    } catch (error) {
      const message = error instanceof Error ? error.message : "That did not send.";
      setContactStatus("error");
      setContactStatusMessage(message);
      setAnnouncement(message);
    } finally {
      contactInFlight.current = false;
    }
  }

  if (pathname.startsWith("/keystatic")) return <>{children}</>;

  let cloudExpression: BloubExpressionId = "neutral";
  if (composerError) cloudExpression = "angry";
  else if (contactStatus === "error") cloudExpression = "sad";
  else if (contactStatus === "sent") cloudExpression = "happy";
  else if (phase === "contact") cloudExpression = "shy";
  else if (phase.startsWith("thinking")) cloudExpression = "confused";
  else if (phase.startsWith("answer")) cloudExpression = "happy";
  else if (open) cloudExpression = "attentive";

  return (
    <>
      {children}
      {open ? (
        <AiOverlay
          phase={phase}
          question={question}
          answer={answer}
          responseComplete={responseComplete}
          composerError={composerError}
          contactEmail={contactEmail}
          contactNote={contactNote}
          contactStatus={contactStatus}
          contactStatusMessage={contactStatusMessage}
          onQuestionChange={setQuestion}
          onQuestionSubmit={() => ask()}
          onFollowUpSubmit={() => ask(2)}
          onClose={close}
          onContactEmailChange={(value) => {
            setContactEmail(value);
            if (contactStatus === "error") setContactStatus("idle");
          }}
          onContactNoteChange={(value) => {
            setContactNote(value);
            if (contactStatus === "error") setContactStatus("idle");
          }}
          onContactSubmit={sendContact}
        />
      ) : null}
      <AiDock
        aiOpen={open}
        expression={cloudExpression}
        triggerRef={trigger}
        onOpen={() => setOpen(true)}
        onNavigate={() => setOpen(false)}
      />
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </p>
    </>
  );
}
