import { createTextStreamResponse, streamText, toTextStream } from "ai";
import { getAIKnowledge } from "@/lib/content";
import { limitTextStream, MAX_QUESTION_CHARS } from "@/lib/ai/limits";
import { getPortfolioModel } from "@/lib/ai/models";
import { decideKnowledge } from "@/lib/ai/policy";
import { buildInstructions, buildPrompt } from "@/lib/ai/prompt";
import { requestIp, sameOrigin, takeRateLimit } from "@/lib/ai/request";
import { turnCookie, validateTurn } from "@/lib/ai/turn";

export const runtime = "nodejs";
export const maxDuration = 25;

type AIRequest = {
  question?: unknown;
  firstQuestion?: unknown;
  turn?: unknown;
};

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
  if (contentLength > 2_000) return error("Question is too large.", 413);

  const ip = requestIp(request);
  if (
    !takeRateLimit("ai-short", ip, 5, 10 * 60 * 1000) ||
    !takeRateLimit("ai-day", ip, 20, 24 * 60 * 60 * 1000)
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
  const turn = body.turn === 2 ? 2 : body.turn === 1 ? 1 : null;

  if (!question || question.length > MAX_QUESTION_CHARS || !turn) {
    return error("Enter a shorter question.", 400);
  }
  if (
    (turn === 2 && (!firstQuestion || firstQuestion.length > MAX_QUESTION_CHARS)) ||
    !validateTurn(request, turn, firstQuestion)
  ) {
    return error("Matt's AI is unavailable right now. Please try again later.", 429);
  }

  try {
    const knowledge = await getAIKnowledge();
    const currentDecision = decideKnowledge(question, knowledge.facts);
    const decision =
      currentDecision.outcome === "contact" &&
      currentDecision.reason === "unknown" &&
      firstQuestion
        ? decideKnowledge(`${firstQuestion} ${question}`, knowledge.facts)
        : currentDecision;

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
          "X-AI-Outcome": decision.outcome,
          "X-AI-Preview": "static-approved-copy",
        },
      });
    }

    const result = streamText({
      model: getPortfolioModel(),
      instructions: buildInstructions(knowledge, decision),
      prompt: buildPrompt({ question, firstQuestion }),
      maxOutputTokens: 180,
      temperature: 0.2,
      abortSignal: AbortSignal.any([
        request.signal,
        AbortSignal.timeout(20_000),
      ]),
    });

    const stream = limitTextStream(toTextStream({ stream: result.stream }));
    return createTextStreamResponse({
      stream,
      headers: {
        "Cache-Control": "no-store",
        "Set-Cookie": turnCookie(turn, question, firstQuestion),
        "X-AI-Outcome": decision.outcome,
      },
    });
  } catch (cause) {
    // Keep visitor questions and provider response bodies out of logs while
    // retaining enough metadata to distinguish configuration and uptime errors.
    reportProviderFailure(cause);
    return error("Matt's AI is unavailable right now. Please try again later.", 503);
  }
}
