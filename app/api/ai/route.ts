import { createTextStreamResponse, streamText, toTextStream } from "ai";
import { getAIKnowledge } from "@/lib/content";
import {
  limitTextStream,
  MAX_AI_TURNS,
  MAX_QUESTION_CHARS,
} from "@/lib/ai/limits";
import { getPortfolioModel } from "@/lib/ai/models";
import { decideKnowledge } from "@/lib/ai/policy";
import {
  buildInstructions,
  buildPrompt,
  type Exchange,
  type Wall,
} from "@/lib/ai/prompt";
import { requestIp, sameOrigin, takeRateLimit } from "@/lib/ai/request";
import { turnCookie, validateTurn } from "@/lib/ai/turn";

export const runtime = "nodejs";
export const maxDuration = 25;

type AIRequest = {
  question?: unknown;
  firstQuestion?: unknown;
  turn?: unknown;
  history?: unknown;
};

/** Earlier exchanges the model sees, so a follow-up can lean on what was
 * said. Visitor-supplied, so it is capped and only ever shapes the answer to
 * that same visitor. */
const MAX_HISTORY = 3;
const MAX_HISTORY_ANSWER_CHARS = 900;

function readHistory(value: unknown): Exchange[] {
  if (!Array.isArray(value)) return [];
  return value
    .slice(-MAX_HISTORY)
    .filter(
      (item): item is Exchange =>
        typeof item?.question === "string" && typeof item?.answer === "string",
    )
    .map((item) => ({
      question: item.question.trim().slice(0, MAX_QUESTION_CHARS),
      answer: item.answer.trim().slice(0, MAX_HISTORY_ANSWER_CHARS),
    }))
    .filter((item) => item.question && item.answer);
}

function error(message: string, status: number) {
  return Response.json(
    { error: message },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

function reportProviderFailure(cause: unknown) {
  if (!(cause instanceof Error)) {
    console.error("Portfolio AI request failed with an unknown provider error.");
    return;
  }

  const statusCode =
    "statusCode" in cause && typeof cause.statusCode === "number"
      ? cause.statusCode
      : undefined;
  console.error("Portfolio AI request failed.", {
    name: cause.name,
    statusCode,
  });
}

function localPreviewStream(message: string) {
  let begin: ReturnType<typeof setTimeout> | undefined;
  let timer: ReturnType<typeof setInterval> | undefined;
  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    start(controller) {
      const words = message.split(/(?<=\s)/u);
      let index = 0;
      begin = setTimeout(() => {
        timer = setInterval(() => {
          const word = words[index];
          if (word) controller.enqueue(encoder.encode(word));
          index += 1;
          if (index >= words.length) {
            clearInterval(timer);
            controller.close();
          }
        }, 24);
      }, 650);
    },
    cancel() {
      clearTimeout(begin);
      clearInterval(timer);
    },
  });
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return error("Request not allowed.", 403);
  if (!request.headers.get("content-type")?.startsWith("application/json")) {
    return error("Question could not be read.", 415);
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 8_000) return error("Question is too large.", 413);

  const ip = requestIp(request);
  // A whole session has to fit inside the short window, or the ceiling meant
  // to bound abuse would cut an ordinary conversation short instead.
  if (
    !takeRateLimit("ai-short", ip, MAX_AI_TURNS + 2, 10 * 60 * 1000) ||
    !takeRateLimit("ai-day", ip, MAX_AI_TURNS * 4, 24 * 60 * 60 * 1000)
  ) {
    return error(
      "That is a lot of questions in a short window. Try again in a few minutes.",
      429,
    );
  }

  let body: AIRequest;
  try {
    body = (await request.json()) as AIRequest;
  } catch {
    return error("Question could not be read.", 400);
  }

  const question = typeof body.question === "string" ? body.question.trim() : "";
  const firstQuestion =
    typeof body.firstQuestion === "string" ? body.firstQuestion.trim() : undefined;
  const turn =
    typeof body.turn === "number" &&
    Number.isInteger(body.turn) &&
    body.turn >= 1 &&
    body.turn <= MAX_AI_TURNS
      ? body.turn
      : null;

  if (!question || question.length > MAX_QUESTION_CHARS) {
    return error("Enter a shorter question.", 400);
  }
  // Separate from the question check so a conversation that has run its length
  // is told that, rather than being asked to shorten something.
  if (!turn) {
    return error(
      `This conversation is limited to ${MAX_AI_TURNS} questions. Leave an email and Matt can follow up.`,
      429,
    );
  }
  if (
    (turn > 1 && (!firstQuestion || firstQuestion.length > MAX_QUESTION_CHARS)) ||
    !validateTurn(request, turn, firstQuestion)
  ) {
    return error("Matt's AI is unavailable right now. Please try again later.", 429);
  }

  const history = readHistory(body.history);

  try {
    const knowledge = await getAIKnowledge();
    const decision = decideKnowledge(question, knowledge.facts);
    // Private, contact-only and prompt-injection questions are walled off here,
    // before the model, so no wording can talk it into answering them. Anything
    // else goes to the model with the whole briefing, including questions no
    // alias matched: the briefing decides what it can say, not a keyword.
    const wall: Wall =
      decision.outcome === "contact" && decision.reason !== "unknown"
        ? decision.reason
        : null;
    const outcome = wall ? "contact" : "answer";

    // Local visual QA remains usable before Matt adds his server key. This
    // branch is unreachable in production and never pretends to be a model.
    if (process.env.NODE_ENV !== "production" && !process.env.OPENROUTER_API_KEY) {
      const previewText =
        decision.outcome === "answer"
          ? decision.fact.answer
          : decision.reason === "private"
            ? "Matt keeps that information private. Leave an email and Matt can follow up."
            : decision.reason === "contact"
              ? "Matt handles that directly. Leave an email and Matt can follow up."
              : "This AI does not know that. Leave an email and Matt can follow up.";
      return new Response(localPreviewStream(previewText), {
        headers: {
          "Cache-Control": "no-store",
          "Content-Type": "text/plain; charset=utf-8",
          "Set-Cookie": turnCookie(turn, question, firstQuestion),
          "X-AI-Outcome": outcome,
          "X-AI-Preview": "static-approved-copy",
        },
      });
    }

    const result = streamText({
      model: getPortfolioModel(),
      instructions: buildInstructions(knowledge, wall),
      prompt: buildPrompt({ question, history }),
      // GLM thinks before it writes, and its reasoning (about 200 tokens) is
      // billed against this budget. At 320 a longer answer ran out mid-sentence;
      // 800 leaves room for the thinking plus 100 words in Chinese or English.
      // The stream limit below still holds the visible ceiling.
      maxOutputTokens: 800,
      // Enough variety to sound like a person rather than a recited fact; the
      // briefing, not the temperature, is what keeps it truthful.
      temperature: 0.7,
      abortSignal: AbortSignal.any([
        request.signal,
        AbortSignal.timeout(20_000),
      ]),
      onError: ({ error }) => {
        console.error("[ai] provider error", error);
      },
    });

    const stream = limitTextStream(toTextStream({ stream: result.stream }));
    return createTextStreamResponse({
      stream,
      headers: {
        "Cache-Control": "no-store",
        "Set-Cookie": turnCookie(turn, question, firstQuestion),
        "X-AI-Outcome": outcome,
      },
    });
  } catch (cause) {
    // Keep visitor questions and provider response bodies out of logs while
    // retaining enough metadata to distinguish configuration and uptime errors.
    reportProviderFailure(cause);
    return error("Matt's AI is unavailable right now. Please try again later.", 503);
  }
}
