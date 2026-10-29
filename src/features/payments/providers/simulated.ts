import type { PaymentProvider } from '../domain/port';

/**
 * The test provider, used until the shop's merchant account exists: a page of the shop plays the
 * payment page, and the reader chooses the outcome. Its confirmation is refused in any other mode.
 */
export function simulatedProvider(): PaymentProvider {
  return {
    id: 'simulated',
    async start(input) {
      const url = new URL(input.returnUrl, 'http://local');
      const token = url.searchParams.get('t') ?? '';
      return { redirectUrl: `/paiement/${input.orderId}?t=${encodeURIComponent(token)}`, reference: `SIM-${input.orderId}` };
    },
    async check() {
      return { status: 'pending', amountXof: null };
    },
  };
}
