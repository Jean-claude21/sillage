import * as m from '@/paraglide/messages.js';

export const DELIVERY_STATUSES = ['a-preparer', 'preparation', 'prete', 'livraison', 'livree', 'annulee'] as const;
export const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'] as const;
export const PAYMENT_METHODS = ['mobile_money', 'card', 'cash_on_delivery'] as const;

export type DeliveryStatus = (typeof DELIVERY_STATUSES)[number];
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
export type Zone = 'lome' | 'outside';

/** Label and tone of a delivery status, as the mockup's badges show them. */
export function deliveryBadge(status: string): [string, string] {
  switch (status) {
    case 'a-preparer':
      return [m.delivery_to_prepare(), 'warning'];
    case 'preparation':
      return [m.delivery_preparing(), 'info'];
    case 'prete':
      return [m.delivery_ready(), 'info'];
    case 'livraison':
      return [m.delivery_on_way(), 'info'];
    case 'livree':
      return [m.delivery_delivered(), ''];
    case 'annulee':
      return [m.delivery_cancelled(), 'neutral'];
    default:
      return [status, 'neutral'];
  }
}

export function paymentBadge(status: string): [string, string] {
  switch (status) {
    case 'paid':
      return [m.payment_paid(), ''];
    case 'pending':
      return [m.payment_pending(), 'warning'];
    case 'failed':
      return [m.payment_failed(), 'danger'];
    case 'refunded':
      return [m.payment_refunded(), 'neutral'];
    default:
      return [status, 'neutral'];
  }
}

export function methodLabel(method: string): string {
  switch (method) {
    case 'mobile_money':
      return m.method_mobile_money();
    case 'card':
      return m.method_card();
    case 'cash_on_delivery':
      return m.method_cash();
    default:
      return method;
  }
}

/** Orders the team still has to prepare or hand over: paid, or to be paid on delivery. */
export function inQueue(o: { paymentStatus: string; paymentMethod: string; deliveryStatus: string }): boolean {
  const payable = o.paymentStatus === 'paid' || (o.paymentMethod === 'cash_on_delivery' && o.paymentStatus === 'pending');
  return payable && ['a-preparer', 'preparation', 'prete'].includes(o.deliveryStatus);
}

/** Preparation may start once paid, or at once for an order paid on delivery. */
export function canPrepare(o: { paymentStatus: string; paymentMethod: string }): boolean {
  return o.paymentStatus === 'paid' || (o.paymentMethod === 'cash_on_delivery' && o.paymentStatus === 'pending');
}

export interface OrderLineView {
  bookId: string;
  title: string;
  author: string;
  cover: string;
  priceXof: number;
  qty: number;
}

export interface OrderView {
  id: string;
  customerId: string | null;
  customerName: string;
  email: string;
  phone: string;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  paymentReference: string;
  deliveryStatus: DeliveryStatus;
  zone: Zone;
  area: string;
  city: string;
  address: string;
  fee: number;
  courier: string;
  window: string;
  note: string;
  customerNote: string;
  createdAt: string;
  lines: OrderLineView[];
}

export function orderSubtotal(o: { lines: readonly { priceXof: number; qty: number }[] }): number {
  return o.lines.reduce((s, l) => s + l.priceXof * l.qty, 0);
}

export function orderTotal(o: { fee: number; lines: readonly { priceXof: number; qty: number }[] }): number {
  return orderSubtotal(o) + o.fee;
}
