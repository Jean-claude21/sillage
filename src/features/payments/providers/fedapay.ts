import type { PaymentCheck, PaymentProvider, PaymentStart } from '../domain/port';

/**
 * FedaPay (Mobile Money and cards in XOF). Creates a transaction, then its payment page; the return
 * address carries the transaction id, which the shop re-reads before trusting anything.
 * Not yet exercised against a sandbox account: test it with the shop's own keys before opening.
 */
export function fedapayProvider(options: { secretKey: string; environment: 'sandbox' | 'live' }): PaymentProvider {
  const base = options.environment === 'live' ? 'https://api.fedapay.com/v1' : 'https://sandbox-api.fedapay.com/v1';
  const call = async (path: string, init?: RequestInit) => {
    const res = await fetch(`${base}${path}`, {
      ...init,
      headers: { Authorization: `Bearer ${options.secretKey}`, 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) throw new Error(`fedapay ${path}: ${res.status}`);
    return (await res.json()) as Record<string, unknown>;
  };
  const transactionOf = (body: Record<string, unknown>) =>
    (body['v1/transaction'] ?? body['transaction'] ?? body) as { id?: number; status?: string; amount?: number };

  return {
    id: 'fedapay',
    async start(input: PaymentStart) {
      const [first, ...rest] = input.customer.name.trim().split(/\s+/);
      const created = transactionOf(
        await call('/transactions', {
          method: 'POST',
          body: JSON.stringify({
            description: input.description,
            amount: input.amountXof,
            currency: { iso: 'XOF' },
            callback_url: input.returnUrl,
            custom_metadata: { order_id: input.orderId },
            customer: { firstname: first ?? input.customer.name, lastname: rest.join(' ') || first, email: input.customer.email },
          }),
        }),
      );
      if (!created.id) throw new Error('fedapay: no transaction id');
      const token = await call(`/transactions/${created.id}/token`, { method: 'POST' });
      const url = typeof token['url'] === 'string' ? token['url'] : null;
      if (!url) throw new Error('fedapay: no payment url');
      return { redirectUrl: url, reference: String(created.id) };
    },
    async check(reference: string): Promise<PaymentCheck> {
      const t = transactionOf(await call(`/transactions/${encodeURIComponent(reference)}`));
      const status = t.status === 'approved' || t.status === 'transferred' ? 'paid' : t.status === 'pending' ? 'pending' : 'failed';
      return { status, amountXof: typeof t.amount === 'number' ? t.amount : null };
    },
  };
}
