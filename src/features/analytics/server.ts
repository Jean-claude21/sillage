import { env } from '@/platform/env';
import { guard, type AnalyticsEvents, type EventName } from './events';

/**
 * Sends an event from the server, for facts the browser cannot prove: a payment confirmed by the
 * provider. Uses Umami's public collection endpoint; never blocks the caller.
 */
export async function trackServerEvent<E extends EventName>(name: E, data: AnalyticsEvents[E], path = '/'): Promise<void> {
  if (!env.umamiWebsiteId) return;
  const hostname = new URL(env.siteUrl).hostname;
  try {
    await fetch(`${env.umamiHost.replace(/\/$/, '')}/api/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0 (compatible; SillageServer/1.0)' },
      body: JSON.stringify({
        type: 'event',
        payload: {
          website: env.umamiWebsiteId,
          hostname,
          url: path,
          language: 'fr-FR',
          name,
          data: guard(data as Record<string, unknown>),
        },
      }),
      signal: AbortSignal.timeout(4000),
    });
  } catch {
    // Measuring never breaks a payment.
  }
}
