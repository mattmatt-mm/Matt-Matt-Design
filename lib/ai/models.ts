import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { siteUrl } from "@/lib/site";

/**
 * Models this endpoint is allowed to reach. The list is the cost control: a
 * stale or mistyped variable falls back rather than taking the endpoint down,
 * and nothing outside the list can enter the request path. Add a model here
 * deliberately, having checked what it costs.
 *
 * `z-ai/glm-5.2` is the paid GLM, billed against the OpenRouter key. The
 * `:free` variants share a rate-limited pool and return empty completions when
 * that pool is saturated, which is why the paid one is the primary.
 */
export const MODEL_ALLOWLIST = [
  "z-ai/glm-5.2",
  "z-ai/glm-5.2:free",
  "openrouter/free",
] as const;

type AllowedModel = (typeof MODEL_ALLOWLIST)[number];

function allowedModel(
  value: string | undefined,
  fallback: AllowedModel,
): AllowedModel {
  const candidate = value ?? fallback;
  if (!MODEL_ALLOWLIST.includes(candidate as AllowedModel)) {
    // Name it. Failing silently here is how a variable ends up set to a model
    // that never gets used — the endpoint keeps working on the fallback and
    // nothing says the setting was ignored.
    console.warn(
      `Ignoring AI model "${candidate}": not in the allowlist. ` +
        `Using "${fallback}" instead.`,
    );
    return fallback;
  }
  return candidate as AllowedModel;
}

export function getPortfolioModel() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY is not configured.");

  const primary = allowedModel(
    process.env.OPENROUTER_PRIMARY_MODEL,
    "z-ai/glm-5.2",
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
    // OpenRouter tries the named model first, then falls through to the second
    // one if it is unavailable.
    models: primary === fallback ? [] : [fallback],
    extraBody: {
      // Exclude provider endpoints that may retain or train on visitor text.
      provider: { data_collection: "deny" },
    },
  });
}
