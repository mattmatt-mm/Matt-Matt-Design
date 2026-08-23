import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { siteUrl } from "@/lib/site";

export const FREE_MODEL_ALLOWLIST = [
  "z-ai/glm-5.2:free",
  "nousresearch/hermes-3-llama-3.1-405b:free",
] as const;

type FreeModel = (typeof FREE_MODEL_ALLOWLIST)[number];

function allowedModel(value: string | undefined, fallback: FreeModel): FreeModel {
  const candidate = value ?? fallback;
  if (!FREE_MODEL_ALLOWLIST.includes(candidate as FreeModel)) {
    throw new Error("Configured AI model is outside the free-model allowlist.");
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
    "nousresearch/hermes-3-llama-3.1-405b:free",
  );

  const openrouter = createOpenRouter({
    apiKey,
    headers: {
      "HTTP-Referer": siteUrl,
      "X-Title": "Matt - Design Engineer",
    },
  });

  return openrouter(primary, {
    extraBody: {
      // OpenRouter tries this exact free fallback only when the primary fails.
      // No auto-router or paid model can enter the request path.
      models: primary === fallback ? [] : [fallback],
      // Exclude provider endpoints that may retain or train on visitor text.
      provider: { data_collection: "deny" },
    },
  });
}
