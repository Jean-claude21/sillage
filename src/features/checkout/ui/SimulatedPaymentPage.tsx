import { Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { Icon } from '@/lib/icons';
import { formatXof } from '@/lib/text';
import * as m from '@/paraglide/messages.js';
import { methodLabel, orderTotal, type OrderView } from '@/features/orders/domain/order';
import { PageIntro } from '@/features/storefront/ui/parts';
import { confirmSimulatedPayment } from '../functions';

/** Stands in for the provider's payment page until the shop's merchant account is connected. */
export function SimulatedPaymentPage({ order, token, simulated }: { order: OrderView | null; token: string; simulated: boolean }) {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  if (!order || !simulated) {
    return (
      <>
        <PageIntro title={m.not_found_title()} />
        <div className="wrap section">
          <Link className="button" to="/">
            {m.crumb_home()}
          </Link>
        </div>
      </>
    );
  }
  async function answer(outcome: 'paid' | 'failed') {
    setBusy(true);
    await confirmSimulatedPayment({ data: { id: order!.id, t: token, outcome } });
    void navigate({ to: '/commande/$orderId', params: { orderId: order!.id }, search: { t: token } });
  }
  return (
    <>
      <PageIntro title={m.pay_title()} description={m.pay_intro()} crumb={m.pay_crumb()} />
      <div className="wrap">
        <div className="pay-page">
          <span className="theme-pill">{methodLabel(order.paymentMethod)}</span>
          <p className="muted" style={{ marginTop: 18 }}>
            {m.pay_order({ id: order.id })}
          </p>
          <p className="pay-amount">{formatXof(orderTotal(order))}</p>
          <div className="notice-box warning">
            <Icon name="check" />
            <p>{m.pay_test_notice()}</p>
          </div>
          <button type="button" className="button" disabled={busy} onClick={() => void answer('paid')}>
            {m.pay_confirm()} <Icon name="check" />
          </button>
          <button type="button" className="button secondary" disabled={busy} onClick={() => void answer('failed')}>
            {m.pay_refuse()}
          </button>
        </div>
      </div>
    </>
  );
}
