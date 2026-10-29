import { guard, type AnalyticsEvents, type EventName } from './events';

declare global {
  interface Window {
    umami?: { track: (name: string, data?: Record<string, unknown>) => void };
  }
}

/** Sends an event to Umami when its script is present; does nothing otherwise (dev, tests). */
export function trackEvent<E extends EventName>(name: E, data: AnalyticsEvents[E]): void {
  if (typeof window === 'undefined') return;
  try {
    window.umami?.track(name, guard(data as Record<string, unknown>));
  } catch {
    // Measuring never breaks a purchase.
  }
}
