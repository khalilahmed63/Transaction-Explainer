import { track } from "@vercel/analytics";
import type { AnalyticsEvent, AnalyticsEvents } from "./events";

/**
 * Central analytics entry point. Provider-specific calls stay here.
 * Failures must never break product UX.
 */
export function trackEvent<E extends AnalyticsEvent>(
  event: E,
  properties: AnalyticsEvents[E],
): void {
  try {
    track(event, properties);
  } catch {
    // Non-blocking — analytics must never interrupt the product.
  }
}
