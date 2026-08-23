import { createHash, createHmac, timingSafeEqual } from "node:crypto";

type TurnState = {
  used: 1 | 2;
  firstQuestionHash: string;
  expiresAt: number;
};

const COOKIE_NAME = "mmd_ai_turn";
const TURN_TTL_SECONDS = 60 * 60;

let warnedAboutLocalSecret = false;

function secret() {
  const configured = process.env.AI_TURN_SECRET;
  if (configured) return configured;
  if (process.env.NODE_ENV !== "production") {
    // Say so once. Falling back silently is what let a deployment ship with
    // this unset: locally every answer works, and only production throws.
    if (!warnedAboutLocalSecret) {
      warnedAboutLocalSecret = true;
      console.warn(
        "AI_TURN_SECRET is not set — using the local development value. " +
          "Production requires the real one or /api/ai returns 503.",
      );
    }
    return "matt-ai-local-development-only";
  }
  throw new Error("AI_TURN_SECRET is not configured.");
}

function digest(value: string) {
  return createHash("sha256").update(value).digest("base64url");
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

function parseCookie(request: Request) {
  const cookie = request.headers.get("cookie") ?? "";
  const value = cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${COOKIE_NAME}=`))
    ?.slice(COOKIE_NAME.length + 1);
  if (!value) return null;

  const [payload, signature] = value.split(".");
  if (!payload || !signature) return null;
  const expected = Buffer.from(sign(payload));
  const supplied = Buffer.from(signature);
  if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) {
    return null;
  }

  try {
    const state = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as TurnState;
    if (state.expiresAt <= Date.now()) return null;
    return state;
  } catch {
    return null;
  }
}

export function validateTurn(
  request: Request,
  turn: 1 | 2,
  firstQuestion: string | undefined,
) {
  const state = parseCookie(request);
  // A first question always stands on its own. Refusing it while any cookie
  // survived meant one finished conversation locked the AI for the rest of the
  // hour, and it reported that as the AI being unavailable. What this cookie
  // is actually for is stopping a follow-up that never had a first turn; the
  // per-visitor rate limits are what bound how much anyone can ask.
  if (turn === 1) return true;
  return Boolean(
    state?.used === 1 &&
      firstQuestion &&
      state.firstQuestionHash === digest(firstQuestion),
  );
}

export function turnCookie(
  turn: 1 | 2,
  question: string,
  firstQuestion: string | undefined,
) {
  const state: TurnState = {
    used: turn,
    firstQuestionHash: digest(firstQuestion ?? question),
    expiresAt: Date.now() + TURN_TTL_SECONDS * 1000,
  };
  const payload = Buffer.from(JSON.stringify(state)).toString("base64url");
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${COOKIE_NAME}=${payload}.${sign(payload)}; Max-Age=${TURN_TTL_SECONDS}; Path=/api/ai; HttpOnly; SameSite=Strict${secure}`;
}
