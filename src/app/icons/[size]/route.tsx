import { appIcon } from "@/lib/icon";

export const runtime = "nodejs";

/**
 * §23.F — manifest icon endpoints (/icons/192, /icons/512). Generated via Satori
 * so there are no PNG assets to keep in sync. Unknown sizes fall back to 192 so
 * a bad request never 500s.
 */
export async function GET(_req: Request, ctx: { params: Promise<{ size: string }> }) {
  const { size } = await ctx.params;
  return appIcon(size === "512" ? 512 : 192);
}
