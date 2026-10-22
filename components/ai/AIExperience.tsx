"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { MAX_AI_TURNS } from "@/lib/ai/limits";
import { AiDock } from "@/components/ai/AiDock";
import {
  AiAnswer,
  AiOverlay,
  type AIPhase,
} from "@/components/ai/AiOverlay";
import { AiTour, type TourStep } from "@/components/ai/AiTour";
import {
  denyTracking,
  grantTracking,
  resumeTracking,
  track,
  trackingDecision,
} from "@/lib/analytics";
import {
  type Discipline,
  focusSlug,
  parseFocus,
  walkthroughEyebrow,
} from "@/lib/disciplines";
import type { TourCatalog } from "@/lib/content";
import {
  type SplashRun,
  WalkthroughSplash,
} from "@/components/ai/WalkthroughSplash";
import type { ContactStatus } from "@/components/ai/AiContactForm";
import type { BloubExpressionId } from "@/components/ai/vendor/bloub/bloub";

type Exchange = { question: string; answer: string };

/** Matches --ai-close-dur, so the exit finishes exactly as the phase flips. */
const CROSS_MS = 240;

/**
 * When the tour was last offered on its own (ms since epoch). It is offered at
 * most once a day: from the moment it appears, so leaving without answering
 * still counts. Matt chose once a day on 2026-10-18.
 */
const TOUR_OFFERED_KEY = "mmd:tour-offered";
const TOUR_OFFER_EVERY_MS = 24 * 60 * 60 * 1000;
/**
 * What the cloud says once a walkthrough is up, one after the other, and how
 * long each stays. See doc/hr-mode-plan.md.
 */
const WALKTHROUGH_BUBBLE = ["Please enjoy.", "You can change what's shown by pressing me."];
const BUBBLE_STEP_MS = 2400;
const BUBBLE_LAST_MS = 6000;

/** Long enough for the page to be seen before the AI speaks up. */
const TOUR_OFFER_DELAY_MS = 1200;

function markTourOffered() {
  try {
    window.localStorage.setItem(TOUR_OFFERED_KEY, String(Date.now()));
  } catch {
    // Private mode: it may be offered again next visit, which is harmless.
  }
}

function tourOfferedRecently() {
  try {
    const at = Number(window.localStorage.getItem(TOUR_OFFERED_KEY));
    // Anything unreadable — including the old "1" flag — reads as long ago.
    return Number.isFinite(at) && Date.now() - at < TOUR_OFFER_EVERY_MS;
  } catch {
    return false;
  }
}

async function responseError(response: Response) {
  try {
    const body = (await response.json()) as { error?: string };
    return body.error || "Matt's AI is unavailable right now.";
  } catch {
    return "Matt's AI is unavailable right now.";
  }
}

export function AIExperience({
  children,
  tourCatalog,
}: {
  children: React.ReactNode;
  /** Titles for the walkthrough splash, before its page has loaded. */
  tourCatalog: TourCatalog;
}) {
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
  const [turnsUsed, setTurnsUsed] = useState(0);
  const [composerError, setComposerError] = useState<string>();
  const [contactEmail, setContactEmail] = useState("");
  const [contactNote, setContactNote] = useState("");
  const [contactStatus, setContactStatus] = useState<ContactStatus>("idle");
  const [contactStatusMessage, setContactStatusMessage] = useState<string>();
  const [announcement, setAnnouncement] = useState("");
  const [responseComplete, setResponseComplete] = useState(false);

  const router = useRouter();
  const [tourStep, setTourStep] = useState<TourStep | null>(null);
  const [tourPicks, setTourPicks] = useState<Discipline[]>([]);
  const [splash, setSplash] = useState<(SplashRun & { id: number }) | null>(
    null,
  );
  // Set while the cloud was pressed on a walkthrough: the picks open over
  // whatever conversation exists, with a way back to it.
  const [configuring, setConfiguring] = useState(false);
  const [bubble, setBubble] = useState<string | null>(null);
  const bubbleTimers = useRef<number[]>([]);
  const openRef = useRef(open);
  openRef.current = open;

  const close = useCallback(() => {
    setTourStep(null);
    setOpen(false);
    requestAnimationFrame(() => trigger.current?.focus());
  }, []);

  // Whether the tour offer follows the cookie question on this visit.
  const tourDue = useRef(false);

  const offerTour = useCallback(() => {
    markTourOffered();
    track("tour_offered");
    setTourPicks([]);
    setTourStep("offer");
    setOpen(true);
  }, []);

  // On arrival the AI speaks up on its own (doc/hr-mode-plan.md): first, until
  // it is answered, to ask for cookies; then, at most once a day, to offer the
  // guided tour. `?tour` on any URL offers the tour regardless.
  useEffect(() => {
    resumeTracking();
    const path = window.location.pathname;
    if (path.startsWith("/keystatic")) return;
    const askCookies = trackingDecision() === null;
    const forced = new URLSearchParams(window.location.search).has("tour");
    tourDue.current =
      !path.startsWith("/tour/") && (forced || !tourOfferedRecently());
    if (!askCookies && !tourDue.current) return;
    const timer = window.setTimeout(() => {
      // Someone who has already opened the AI is busy with it.
      if (openRef.current) return;
      if (askCookies) {
        setTourStep("cookies");
        setOpen(true);
      } else {
        offerTour();
      }
    }, TOUR_OFFER_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [offerTour]);

  // Either answer moves on to the tour, if one is due today.
  function answerCookies(accepted: boolean) {
    if (accepted) {
      grantTracking();
      track("cookies_accepted");
    } else {
      denyTracking();
    }
    if (tourDue.current) offerTour();
    else close();
  }

  // Each case study or post the reading chain reaches (components/DetailChain).
  useEffect(() => {
    const onEntry = (event: Event) => {
      const { basePath, slug, source } = (event as CustomEvent).detail;
      track(basePath === "/work" ? "case_study_viewed" : "post_viewed", {
        slug,
        source,
      });
    };
    window.addEventListener("mmd:chain-entry", onEntry);
    return () => window.removeEventListener("mmd:chain-entry", onEntry);
  }, []);

  const hideBubble = useCallback(() => {
    bubbleTimers.current.forEach(window.clearTimeout);
    bubbleTimers.current = [];
    setBubble(null);
  }, []);

  // After the walkthrough is revealed: "Please enjoy.", then how to change it.
  const showBubble = useCallback(() => {
    hideBubble();
    let at = 0;
    WALKTHROUGH_BUBBLE.forEach((line, i) => {
      bubbleTimers.current.push(
        window.setTimeout(() => {
          setBubble(line);
          setAnnouncement(line);
          track("walkthrough_message_shown", { line, step: i + 1 });
        }, at),
      );
      at += i === WALKTHROUGH_BUBBLE.length - 1 ? BUBBLE_LAST_MS : BUBBLE_STEP_MS;
    });
    bubbleTimers.current.push(window.setTimeout(() => setBubble(null), at));
  }, [hideBubble]);

  useEffect(() => hideBubble, [hideBubble]);

  // The cloud. On a walkthrough it opens the picks the walkthrough was made
  // from, so they can be changed — over any conversation already had here.
  function openAi() {
    hideBubble();
    const picks = pathname.startsWith("/tour/")
      ? parseFocus(pathname.slice("/tour/".length))
      : null;
    if (picks) {
      track("tour_configure_opened", { focus: focusSlug(picks) });
      setTourPicks(picks);
      setTourStep("pick");
      setConfiguring(true);
    }
    setOpen(true);
  }

  // "I'm hiring" above the composer: back into the walkthrough at any time,
  // straight to the chips — saying "I'm hiring" already answers the offer.
  function openTour() {
    track("tour_reopened");
    setConfiguring(true);
    setTourStep("pick");
  }

  function declineTour() {
    track("tour_declined");
    if (configuring) backToConversation();
    else close();
  }

  // Asked for from inside the AI, the tour steps aside back to it rather than
  // closing everything — the conversation underneath is kept.
  function backToConversation() {
    setConfiguring(false);
    setTourStep(null);
  }

  function acceptTour() {
    track("tour_accepted");
    setTourStep("pick");
  }

  function continueTour() {
    track("tour_disciplines_selected", { disciplines: tourPicks });
    setTourStep("ready");
  }

  function startTour(button: HTMLElement) {
    const focus = focusSlug(tourPicks);
    const href = `/tour/${focus}`;
    track("tour_started", { focus, disciplines: tourPicks });
    setConfiguring(false);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTourStep(null);
      setOpen(false);
      router.push(href);
      window.setTimeout(showBubble, 600);
      return;
    }
    // The AI stays up beneath the fading sheet; the route change closes it once the
    // screen is covered (components/ai/WalkthroughSplash.tsx).
    const picks = parseFocus(focus) ?? tourPicks;
    setSplash({
      id: Date.now(),
      button: button.closest<HTMLElement>(".ai-tour-button") ?? button,
      eyebrow: walkthroughEyebrow(picks),
      titles: tourCatalog
        .filter((study) => study.disciplines.some((d) => picks.includes(d)))
        .map((study) => study.title),
      href,
    });
  }


  useEffect(() => {
    setOpen(false);
    setTourStep(null);
    setConfiguring(false);
    if (!pathname.startsWith("/tour/")) hideBubble();
  }, [pathname, hideBubble]);

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

  async function ask() {
    if (requestInFlight.current) return;
    const cleanQuestion = question.trim();
    if (!cleanQuestion) return;
    if (turnsUsed >= MAX_AI_TURNS) return;
    requestInFlight.current = true;
    const turn = turnsUsed + 1;
    const thinkingPhase = turn === 1 ? "thinking_primary" : "thinking_followup";
    // The last allowed answer is the one that closes the conversation, so it
    // is the only one that arrives without another prompt beneath it.
    const answeringPhase =
      turn >= MAX_AI_TURNS ? "answer_final" : "answer_primary";
    const firstQuestion = exchanges[0]?.question;

    track("ai_question_asked", { question: cleanQuestion, turn });
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
          // Every follow-up names the opening question: the server checks it
          // against the turn cookie, and leaving it off past the second turn
          // made every later question fail as "unavailable".
          firstQuestion: turn > 1 ? firstQuestion : undefined,
          history: turn > 1 ? exchanges.slice(-3) : undefined,
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
        turn === 1 ? [exchange] : [...previous, exchange],
      );
      setTurnsUsed(turn);
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
      track("contact_sent");
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
  if (tourStep) cloudExpression = tourStep === "pick" ? "attentive" : "happy";
  if (bubble && !open) cloudExpression = "happy";

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
          onFollowUpSubmit={() => ask()}
          onClose={close}
          onToggleContact={toggleContact}
          leaving={leaving}
          crossDirection={crossDirection}
          turnsLeft={Math.max(MAX_AI_TURNS - turnsUsed, 0)}
          onContactEmailChange={(value) => {
            setContactEmail(value);
            if (contactStatus === "error") setContactStatus("idle");
          }}
          onContactNoteChange={(value) => {
            setContactNote(value);
            if (contactStatus === "error") setContactStatus("idle");
          }}
          onContactSubmit={sendContact}
          onHiring={openTour}
          tour={
            tourStep ? (
              <AiTour
                step={tourStep}
                picks={tourPicks}
                onAccept={acceptTour}
                onDecline={declineTour}
                onAcceptCookies={() => answerCookies(true)}
                onDeclineCookies={() => answerCookies(false)}
                onToggle={(value) =>
                  setTourPicks((picks) =>
                    picks.includes(value)
                      ? picks.filter((p) => p !== value)
                      : [...picks, value],
                  )
                }
                onContinue={continueTour}
                onAskInstead={configuring ? backToConversation : undefined}
                onStart={startTour}
              />
            ) : undefined
          }
        />
      ) : null}
      <AiDock
        aiOpen={open}
        expression={cloudExpression}
        triggerRef={trigger}
        onOpen={openAi}
        onNavigate={() => setOpen(false)}
      />
      {bubble && !open ? (
        // The cloud speaking unprompted, in the same answer surface and the
        // same place as any answer. Remounted per line, so each rises in.
        // Pressing it is pressing the cloud.
        <div key={bubble} className="ai-cloud-says" onClick={openAi}>
          <AiAnswer>{bubble}</AiAnswer>
        </div>
      ) : null}
      {splash ? (
        <WalkthroughSplash
          key={splash.id}
          run={splash}
          onCovered={() => {
            // Changing the picks on a walkthrough can land on the same one;
            // with no route change to close the AI, close it here.
            setOpen(false);
            setTourStep(null);
          }}
          onDone={() => {
            setSplash(null);
            showBubble();
          }}
        />
      ) : null}
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </p>
    </>
  );
}
