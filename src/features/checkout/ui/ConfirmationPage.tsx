import { Link, useRouter } from '@tanstack/react-router';
import { useState } from 'react';
import { Icon } from '@/lib/icons';
import { formatXof } from '@/lib/text';
import * as m from '@/paraglide/messages.js';
import { coverUrl } from '@/features/catalog/domain/book';
import { methodLabel, orderSubtotal, orderTotal, paymentBadge, type OrderView } from '@/features/orders/domain/order';
import { DemoNote, PageIntro } from '@/features/storefront/ui/parts';
import { useShop } from '@/features/storefront/ui/shop-context';
import { retryPayment } from '../functions';

const STEPS = ['a-preparer', 'preparation', 'livraison', 'livree'] as const;

export function ConfirmationPage({ order, token }: { order: OrderView | null; token?: string }) {
  const { viewer } = useShop();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  if (!order) {
    return (
      <>
        <PageIntro title={m.not_found_title()} description={m.confirmation_missing()} />
        <div className="wrap section">
          <Link className="button" to="/catalogue">
            {m.back_to_catalog()}
          </Link>
        </div>
      </>
    );
  }

  const paid = order.paymentStatus === 'paid';
  const online = order.paymentMethod !== 'cash_on_delivery';
  const stage = { 'a-preparer': 0, preparation: 1, prete: 1, livraison: 2, livree: 3, annulee: -1 }[order.deliveryStatus];
  const title = order.deliveryStatus === 'annulee' ? m.confirmation_cancelled() : online && !paid ? m.confirmation_waiting() : m.confirmation_thanks();

  async function pay() {
    setBusy(true);
    try {
      const { redirect } = await retryPayment({ data: { id: order!.id, t: token } });
      if (redirect) window.location.assign(redirect);
      else await router.invalidate();
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageIntro title={title} description={m.confirmation_intro({ id: order.id, email: order.email })} crumb={m.confirmation_crumb({ id: order.id })} />
      <div className="wrap checkout-layout">
        <div>
          {stage >= 0 ? (
            <div className="order-status-strip">
              {STEPS.map((s, i) => (
                <div key={s} className={i < stage ? 'done' : i === stage ? 'active' : ''}>
                  {[m.step_confirmed(), m.step_preparing(), m.step_on_way(), m.step_delivered()][i]}
                </div>
              ))}
            </div>
          ) : null}
          {online && !paid && order.deliveryStatus !== 'annulee' ? (
            <div className="notice-box warning">
              <Icon name="bag" />
              <div>
                <p>{order.paymentStatus === 'failed' ? m.confirmation_payment_failed() : m.confirmation_payment_pending()}</p>
                <button type="button" className="button" style={{ marginTop: 14, width: 'auto' }} disabled={busy} onClick={() => void pay()}>
                  {m.confirmation_pay_now()} <Icon name="arrow" />
                </button>
              </div>
            </div>
          ) : (
            <div className="notice-box">
              <Icon name="truck" />
              <p>{order.paymentMethod === 'cash_on_delivery' && !paid ? m.confirmation_cash() : m.confirmation_next()}</p>
            </div>
          )}
          <dl className="product-details">
            <div>
              <dt>{m.confirmation_payment()}</dt>
              <dd>
                {methodLabel(order.paymentMethod)} · {paymentBadge(order.paymentStatus)[0]}
              </dd>
            </div>
            <div>
              <dt>{m.confirmation_address()}</dt>
              <dd>{order.address}</dd>
            </div>
            <div>
              <dt>{m.field_phone()}</dt>
              <dd>{order.phone}</dd>
            </div>
            <div>
              <dt>{m.confirmation_window()}</dt>
              <dd>{order.window || m.window_to_organise()}</dd>
            </div>
          </dl>
          <div className="hero-actions" style={{ marginTop: 30 }}>
            {viewer ? (
              <Link className="button" to="/mon-compte/commandes/$orderId" params={{ orderId: order.id }}>
                {m.confirmation_follow()} <Icon name="arrow" />
              </Link>
            ) : (
              <Link className="button" to="/inscription" search={{ redirect: '/mon-compte/commandes' }}>
                {m.confirmation_create_account()} <Icon name="arrow" />
              </Link>
            )}
            <Link className="button secondary" to="/catalogue">
              {m.continue_browsing()}
            </Link>
          </div>
        </div>
        <aside className="checkout-summary">
          <h2>{m.confirmation_summary({ id: order.id })}</h2>
          {order.lines.map((l) => (
            <div className="checkout-row" key={l.bookId}>
              <span>
                <img src={coverUrl(l.cover)} alt="" width="38" height="56" />
                {l.qty} × {l.title}
              </span>
              <strong>{formatXof(l.priceXof * l.qty)}</strong>
            </div>
          ))}
          <div className="checkout-row">
            <span>{m.subtotal()}</span>
            <span>{formatXof(orderSubtotal(order))}</span>
          </div>
          <div className="checkout-row">
            <span>{order.zone === 'lome' ? m.fee_lome() : m.fee_outside()}</span>
            <span>{formatXof(order.fee)}</span>
          </div>
          <div className="checkout-row total">
            <span>{m.total()}</span>
            <span>{formatXof(orderTotal(order))}</span>
          </div>
          <small>{m.confirmation_xof()}</small>
        </aside>
      </div>
      <DemoNote />
    </>
  );
}
