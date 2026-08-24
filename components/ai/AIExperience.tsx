"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { AiDock } from "@/components/ai/AiDock";
import { AiOverlay, type AIPhase } from "@/components/ai/AiOverlay";
import type { ContactStatus } from "@/components/ai/AiContactForm";
import type { BloubExpressionId } from "@/components/ai/vendor/bloub/bloub";

type Exchange = { question: string; answer: string };

/** Matches --ai-close-dur, so the exit finishes exactly as the phase flips. */
const CROSS_MS = 240;

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
  // Which answer the contact form is layered over, so leaving it returns to
  // the conversation rather than restarting one.
  const [chatPhase, setChatPhase] = useState<AIPhase>("answer_primary");
  const [leaving, setLeaving] = useState(false);
  const [crossDirection, setCrossDirection] = useState<
    "to-email" | "to-chat" | null
  >(null);
  const crossing = useRef(false);
  const crossTimer = useRef<number | undefined>(undefined);
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

  useEffect(
    () => () => {
      window.clearTimeout(crossTimer.current);
    },
    [],
  );

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
      setChatPhase(answeringPhase);
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

  // The outgoing surface has to survive long enough to leave. React would
  // unmount it on the same tick as the phase change, so hold the change for
  // the length of the exit and let the incoming side play its own entrance
  // after — the same handoff the panel opens with, run sideways.
  const toggleContact = useCallback(() => {
    if (crossing.current) return;
    crossing.current = true;
    // The side being left goes the way it came from: the form off to the left,
    // the follow-up off to the right, and whichever arrives comes in from the
    // opposite edge so the pair reads as one shift rather than two fades.
    setCrossDirection(phase === "contact" ? "to-chat" : "to-email");
    setLeaving(true);
    setContactStatusMessage(undefined);
    crossTimer.current = window.setTimeout(() => {
      setPhase((current) => (current === "contact" ? chatPhase : "contact"));
      setLeaving(false);
      crossing.current = false;
    }, CROSS_MS);
  }, [chatPhase, phase]);

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
          onToggleContact={toggleContact}
          leaving={leaving}
          crossDirection={crossDirection}
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
