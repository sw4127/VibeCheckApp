/**
 * Shared PostHog query helper for the KPI scripts (brief §3.D9 — D6/C4/N3).
 *
 * Auth: a PERSONAL API key with read scope (PostHog → Settings → Personal API
 * keys) + the numeric project id — NOT the public `phc_` capture key. Read
 * from env or .env.local:
 *   POSTHOG_PERSONAL_API_KEY=phx_...
 *   POSTHOG_PROJECT_ID=12345
 *   POSTHOG_API_HOST=https://us.posthog.com   (default; EU: eu.posthog.com)
 *
 * Zero deps; Node 18+ fetch. Fails LOUD on missing env (same anti-silent-noop
 * doctrine as /api/health).
 */
import { readFileSync, existsSync } from "node:fs";

/** Merge .env.local into process.env (no override) so scripts run standalone. */
export function loadEnvLocal(path = ".env.local") {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2];
  }
}

export function posthogConfig() {
  loadEnvLocal();
  const key = process.env.POSTHOG_PERSONAL_API_KEY;
  const project = process.env.POSTHOG_PROJECT_ID;
  const host = process.env.POSTHOG_API_HOST || "https://us.posthog.com";
  if (!key || !project) {
    console.error(
      [
        "⚠️  POSTHOG QUERY ENV MISSING — this script reads the real dataset or nothing (N3).",
        "   Needed (env or .env.local):",
        "     POSTHOG_PERSONAL_API_KEY  (personal key w/ read scope — NOT the public phc_ key)",
        "     POSTHOG_PROJECT_ID        (numeric id, PostHog project settings)",
        "   Docs: docs/kpis.md §Instrumentation",
      ].join("\n"),
    );
    process.exit(2);
  }
  return { key, project, host };
}

/** Run a HogQL query; returns { columns, results }. */
export async function hogql(query) {
  const { key, project, host } = posthogConfig();
  const res = await fetch(`${host}/api/projects/${project}/query/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({ query: { kind: "HogQLQuery", query } }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`PostHog query failed (${res.status}): ${body.slice(0, 300)}`);
  }
  const data = await res.json();
  return { columns: data.columns ?? [], results: data.results ?? [] };
}

/** Sessions entered with ?ref=dev are the PM/engineer, never the cohort (N3). */
export const EXCLUDE_DEV = "and (properties.ref is null or properties.ref != 'dev')";
