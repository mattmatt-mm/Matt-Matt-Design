import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

/**
 * The crawlers behind AI answers (ChatGPT, Claude, Perplexity, Gemini,
 * Copilot), named so the welcome stays on record even if a broader rule is
 * added later. See doc/seo-plan.md.
 */
const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "Bingbot",
];

const disallow = ["/keystatic", "/api/"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: AI_CRAWLERS, allow: "/", disallow },
      { userAgent: "*", allow: "/", disallow },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
