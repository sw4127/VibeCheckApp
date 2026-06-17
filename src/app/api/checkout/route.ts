/**
 * POST /api/checkout — start a hosted Merchant-of-Record checkout for the $3.99
 * unlock (spec §24). Provider-agnostic (Dodo by default).
 *
 * Stateless (no DB): the premium token rides the return URL (?t=) AND the
 * provider's metadata; the success page (/premium/report) verifies the order
 * live against the provider and reads the token back. Hosted redirect = the
 * webview-survivable path (§12.B5).
 *
 * Key-guarded: with the provider unconfigured it returns 501 so the rest of the
 * app builds/runs without keys (the preview offers a dev-unlock in non-prod).
 */
import { paymentProvider } from "@/lib/payments";
import { baseUrl } from "@/lib/site";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const provider = paymentProvider();
  if (!provider.isConfigured()) {
    return Response.json({ error: "payments_not_configured" }, { status: 501 });
  }

  const body = await request.json().catch(() => ({}));
  // Either a sample-profile id or a stateless premium token from the music
  // result — opaque string either way; cap for metadata/URL safety.
  const token = (typeof body?.profile === "string" ? body.profile : "velvet_cynic").slice(0, 490);

  const origin = baseUrl();
  // CLEAN return URL (no query) so the provider appends ?payment_id=&status=
  // unambiguously — a paid customer must never fail to unlock because the order
  // id didn't parse. The token rides the provider's metadata and is read back on
  // server-side verify (authoritative); ?t= is reserved for dev-unlock only.
  const successUrl = `${origin}/premium/report`;
  const cancelUrl = `${origin}/premium/preview?canceled=1`;

  const { url, reason } = await provider.createCheckout({ token, successUrl, cancelUrl });
  if (!url) {
    return Response.json({ error: "checkout_failed", reason: reason ?? "unknown" }, { status: 502 });
  }
  return Response.json({ url });
}
