import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { siteUrl } from "@/lib/site";

export const FREE_MODEL_ALLOWLIST = [
  "z-ai/glm-5.2:free",
  "openrouter/free",
] as const;

type FreeModel = (typeof FREE_MODEL_ALLOWLIST)[number];

function allowedModel(value: string | undefined, fallback: FreeModel): FreeModel {
  const candidate = value ?? fallback;
  if (!FREE_MODEL_ALLOWLIST.includes(candidate as FreeModel)) {
    // Model availability changes over time. A stale Vercel variable must not
    // take the whole endpoint down, and it must never widen the request path
    // to a paid model. Fall back to a currently approved free model instead.
    console.warn("Ignoring an AI model outside the current free-model allowlist.");
    return fallback;
  }
  return candidate as FreeModel;
}

export function getPortfolioModel() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY is not configured.");

  const primary = allowedModel(
    process.env.OPENROUTER_PRIMARY_MODEL,
    "z-ai/glm-5.2:free",
  );
  const fallback = allowedModel(
    process.env.OPENROUTER_FALLBACK_MODEL,
    "openrouter/free",
  );

  const openrouter = createOpenRouter({
    apiKey,
    headers: {
      "HTTP-Referer": siteUrl,
      "X-Title": "Matt - Design Engineer",
    },
  });

  return openrouter(primary, {
    // OpenRouter first tries the named free model, then its maintained router
    // for currently available free models. Paid models cannot enter the path.
    models: primary === fallback ? [] : [fallback],
    extraBody: {
      // Exclude provider endpoints that may retain or train on visitor text.
      provider: { data_collection: "deny" },
    },
  });
}
