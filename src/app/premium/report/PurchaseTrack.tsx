"use client";

import { useEffect } from "react";
import { track, type TrackProps } from "@/lib/analytics";

/**
 * Fire the `purchase` conversion event ONCE per unlock (keyed by the Stripe
 * session id), not on every report view — refreshes must not inflate the one
 * metric the recalibration optimizes (§19.B3). Guard lives in sessionStorage
 * (stateless rule: no server store).
 */
export default function PurchaseTrack({
  unlockKey,
  props,
}: {
  unlockKey: string;
  props?: TrackProps;
}) {
  useEffect(() => {
    const k = `vc_purchase_${unlockKey}`;
    try {
      if (sessionStorage.getItem(k)) return;
      sessionStorage.setItem(k, "1");
    } catch {
      /* storage blocked — fire anyway rather than lose the conversion */
    }
    track("purchase", props);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
