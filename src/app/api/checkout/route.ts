/**
 * POST /api/checkout — create a Stripe Checkout Session for the $3.99 unlock.
 *
 * Stateless (no DB): the purchased profile rides in `metadata`, and the success
 * page verifies the session live against Stripe (see /premium/report). Hosted
 * Checkout + `automatic_payment_methods` gives Link + Apple/Google Pay + card
 * (the webview-survivable path, spec §12.B5), guest by default.
 *
 * Key-guarded: with no STRIPE_SECRET_KEY it returns 501 so the rest of the app
 * builds/runs without keys (the preview offers a dev-unlock in non-prod).
 */
import Stripe from "stripe";
import { baseUrl } from "@/lib/site";

export const runtime = "nodejs";

const PRICE_CENTS = 399; // $3.99 launch price (spec §13). A/B vs $4.99 later.

export async function POST(request: Request) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return Response.json({ error: "stripe_not_configured" }, { status: 501 });
  }

  const body = await request.json().catch(() => ({}));
  // Either a sample-profile id (Slice 0) or a stateless premium token from the
  // music result (§19.B4 pattern) — opaque string either way; Stripe metadata
  // values cap at 500 chars.
  const profile = (typeof body?.profile === "string" ? body.profile : "velvet_cynic").slice(0, 490);

  const stripe = new Stripe(key);
  const origin = baseUrl();
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: PRICE_CENTS,
            product_data: { name: "Vibe Check — The Full Read" },
          },
        },
      ],
      // Hosted Checkout auto-offers eligible methods (Link + Apple/Google Pay +
      // card) based on dashboard settings — enable Link in the Stripe dashboard.
      metadata: { profile },
      success_url: `${origin}/premium/report?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/premium/preview?canceled=1`,
    });
    return Response.json({ url: session.url });
  } catch (err) {
    // Surface Stripe's reason (type/code/message — never the key) so a
    // misconfigured key or account is diagnosable instead of an opaque 500.
    const e = err as { type?: string; code?: string; message?: string };
    console.error("[checkout] Stripe error:", e.type, e.code, e.message);
    return Response.json(
      { error: "checkout_failed", reason: e.code ?? e.type ?? "unknown" },
      { status: 502 },
    );
  }
}
