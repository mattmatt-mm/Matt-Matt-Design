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

const privateMarkers = [
  "address",
  "phone",
  "salary",
  "family",
  "relationship",
  "password",
  "credential",
  "private client",
  "住址",
  "電話",
  "薪金",
  "家人",
  "感情",
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

function containsMarker(question: string, markers: string[]) {
  return markers.some((marker) => question.includes(normalize(marker)));
}

function aliasScore(question: string, alias: string) {
  const candidate = normalize(alias);
  if (candidate.length < 2) return 0;
  if (question.includes(candidate)) return 100 + candidate.length;

  const words = candidate.split(" ").filter((word) => word.length > 2);
  if (!words.length) return 0;
  return words.filter((word) => question.includes(word)).length;
}

export function decideKnowledge(
  question: string,
  facts: AIFact[],
): KnowledgeDecision {
  const normalized = normalize(question);

  if (containsMarker(normalized, injectionMarkers)) {
    return { outcome: "contact", reason: "private" };
  }
  if (containsMarker(normalized, privateMarkers)) {
    return { outcome: "contact", reason: "private" };
  }
  if (containsMarker(normalized, contactMarkers)) {
    return { outcome: "contact", reason: "contact" };
  }

  const ranked = facts
    .map((fact) => ({
      fact,
      score: Math.max(0, ...fact.aliases.map((alias) => aliasScore(normalized, alias))),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  const selected = ranked[0]?.fact;
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
