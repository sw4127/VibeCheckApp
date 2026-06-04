"use client";

import { useEffect } from "react";
import { track, type TrackProps } from "@/lib/analytics";

/**
 * Fire a single analytics event on mount — lets server components emit events
 * (e.g. result_view) without becoming client components themselves.
 */
export default function Track({ event, props }: { event: string; props?: TrackProps }) {
  useEffect(() => {
    track(event, props);
    // Fire once on mount; event/props are stable per render of a result page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
