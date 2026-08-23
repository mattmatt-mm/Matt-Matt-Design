import type { AIFact } from "@/lib/content";

export type KnowledgeDecision =
  | { outcome: "answer"; fact: AIFact }
  | { outcome: "contact"; fact?: AIFact; reason: "unknown" | "contact" | "private" };

const injectionMarkers = [
  "ignore previous",
  "system prompt",
  "developer message",
  "hidden instruction",
  "reveal prompt",
  "jailbreak",
  "忽略之前",
  "系統提示",
  "隱藏指令",
];

const contactMarkers = [
  "available",
  "availability",
  "hire",
  "freelance",
  "rate",
  "pricing",
  "price",
  "budget",
  "timeline",
  "meeting",
  "introduction",
  "合作",
  "報價",
  "預算",
  "檔期",
  "會面",
];

// What Matt keeps off the site: how to reach him outside the handoff, his
// body, the people around him, life before and outside the work, and his other
// accounts. Relationship is deliberately absent — that one is answerable, and
// it is a fact in the knowledge base rather than a wall here.
const privateMarkers = [
  "address",
  "phone",
  "phone number",
  "how tall",
  "friend",
  "friends",
  "instagram",
  "childhood",
  "personal life",
  "growing up",
  "salary",
  "family",
  "password",
  "credential",
  "private client",
  "住址",
  "電話",
  "身高",
  "朋友",
  "私生活",
  "童年",
  "薪金",
  "家人",
  "密碼",
  "私人客戶",
];

function normalize(value: string) {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase()
    .replaceAll(/[\p{P}\p{S}]+/gu, " ")
    .replaceAll(/\s+/g, " ")
    .trim();
}

/**
 * Whole words, not substrings. Matching anywhere meant "corporate" carried the
 * "rate" marker and sent a branding question to the contact form. `normalize`
 * has already reduced the question to words separated by single spaces, so
 * padding both sides is enough to pin the edges.
 *
 * Han runs together without spaces and has no boundaries to find, so those
 * still match inside a phrase.
 */
function matchesWhole(question: string, candidate: string) {
  if (!candidate) return false;
  return /\p{Script=Han}/u.test(candidate)
    ? question.includes(candidate)
    : ` ${question} `.includes(` ${candidate} `);
}

function containsMarker(question: string, markers: string[]) {
  return markers.some((marker) => matchesWhole(question, normalize(marker)));
}

/** A whole alias present in the question. Anything less is a partial score. */
const EXPLICIT_MATCH = 100;

function aliasScore(question: string, alias: string) {
  const candidate = normalize(alias);
  if (candidate.length < 2) return 0;
  if (matchesWhole(question, candidate)) return EXPLICIT_MATCH + candidate.length;

  const words = candidate.split(" ").filter((word) => word.length > 2);
  if (!words.length) return 0;
  return words.filter((word) => matchesWhole(question, word)).length;
}

export function decideKnowledge(
  question: string,
  facts: AIFact[],
): KnowledgeDecision {
  const normalized = normalize(question);

  // Attempts to talk to the prompt itself are refused before anything else.
  if (containsMarker(normalized, injectionMarkers)) {
    return { outcome: "contact", reason: "private" };
  }

  const ranked = facts
    .map((fact) => ({
      fact,
      score: Math.max(0, ...fact.aliases.map((alias) => aliasScore(normalized, alias))),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  const selected = ranked[0]?.fact;

  // A fact whose whole alias is in the question is the deliberate answer to
  // it, so it outranks the marker walls below. Those are a blunt fallback:
  // "朋友" in the friends wall otherwise swallows "女朋友", and a fact Matt
  // added on purpose could never be reached. Anything he has not approved
  // still meets the walls.
  const explicit = ranked[0]?.score >= EXPLICIT_MATCH ? ranked[0].fact : undefined;
  if (explicit?.policy === "answer" && explicit.answer.trim()) {
    return { outcome: "answer", fact: explicit };
  }

  if (containsMarker(normalized, privateMarkers)) {
    return { outcome: "contact", reason: "private" };
  }
  if (containsMarker(normalized, contactMarkers)) {
    return { outcome: "contact", reason: "contact" };
  }
  if (!selected) return { outcome: "contact", reason: "unknown" };
  if (selected.policy === "never_answer") {
    return { outcome: "contact", fact: selected, reason: "private" };
  }
  if (selected.policy === "contact_only") {
    return { outcome: "contact", fact: selected, reason: "contact" };
  }
  if (!selected.answer.trim()) {
    return { outcome: "contact", fact: selected, reason: "unknown" };
  }
  return { outcome: "answer", fact: selected };
}
