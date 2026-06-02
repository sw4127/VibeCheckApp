/**
 * Stable, dependency-free, isomorphic hash for cache keying (NOT security).
 *
 * Runs identically on Node and the Edge runtime (no node:crypto), and is
 * synchronous so it can key a verdict inline. Identical normalized answers ->
 * identical hash -> CDN/LLM cache hit (spec §6 "cache by input hash").
 */

import type { Answers, QuizConfig } from "./types";

/** Canonical string form of an answer set: question ids sorted, joined stably. */
export function canonicalAnswers(config: QuizConfig, answers: Answers): string {
  const parts = config.questions
    .map((q) => `${q.id}=${answers[q.id] ?? ""}`)
    .sort();
  // Include the quiz id so different quizzes can never collide in a shared cache.
  return `${config.id}|${parts.join("&")}`;
}

/** FNV-1a 32-bit, returned as zero-padded 8-char hex. */
export function fnv1a(input: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    // h *= 16777619, kept in 32-bit unsigned range via Math.imul.
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

/** Convenience: canonical + hash in one call. */
export function hashAnswers(config: QuizConfig, answers: Answers): string {
  return fnv1a(canonicalAnswers(config, answers));
}
