/**
 * The payment port. The shop never trusts a redirection or a notification: an order is marked
 * paid only after the provider itself is asked (check), and the amount matches.
 */
export interface PaymentStart {
  orderId: string;
  amountXof: number;
  description: string;
  customer: { name: string; email: string; phone: string };
  /** Where the provider sends the reader back; the shop then asks the provider. */
  returnUrl: string;
}

export interface PaymentCheck {
  status: 'paid' | 'pending' | 'failed';
  amountXof: number | null;
}

export interface PaymentProvider {
  id: 'simulated' | 'fedapay';
  start(input: PaymentStart): Promise<{ redirectUrl: string; reference: string }>;
  check(reference: string): Promise<PaymentCheck>;
}
