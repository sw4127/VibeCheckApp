import type { Metadata } from "next";
import BiasFlow from "./BiasFlow";

/**
 * The Prestige-Bias Test (memo D2 Instrument 1, D3 v1 flagship).
 * Naming is provisional — "gym" product naming is open per memo §9.5.
 */
export const metadata: Metadata = {
  title: "The Prestige Test — do you hear the music, or the name?",
  description:
    "Rate eight clips with just your ears. Rate them again with the names attached. The gap is your number.",
};

export default function BiasPage() {
  return <BiasFlow />;
}
