import { Link, useRouter } from '@tanstack/react-router';
import { useState, type FormEvent } from 'react';
import { WIcon } from '@/lib/icons';
import { formatDate, formatTime, formatXof } from '@/lib/text';
import { toast } from '@/lib/toast';
import * as m from '@/paraglide/messages.js';
import { trackEvent } from '@/features/analytics/track';
import { addToCart } from '@/features/cart/ui/cart-store';
import { coverUrl } from '@/features/catalog/domain/book';
import { Btn, closeSheet, ContentHead, DeliveryBadge, download, Empty, openSheet, Panel, PaymentBadge } from '@/features/workspace/ui/parts';
import { cancelOrderFn, saveOrderDelivery, saveOrderNote, savePaymentStatus } from '../functions';
import { canPrepare, deliveryBadge, DELIVERY_STATUSES, methodLabel, orderSubtotal, orderTotal, paymentBadge, type OrderView } from '../domain/order';

const STEPS = () => [m.step_confirmed(), m.step_preparing(), m.step_on_way(), m.step_delivered()];

function receipt(o: OrderView, shopName: string) {
  const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
  const html = `<!doctype html><html lang="fr"><meta charset="utf-8"><title>${esc(m.ws_receipt_title({ id: o.id }))}</title><style>body{font:14px/1.7 Arial,sans-serif;color:#193d34;max-width:750px;margin:60px auto;padding:20px}h1{font-size:28px}table{width:100%;border-collapse:collapse;margin:25px 0}th,td{text-align:left;padding:12px;border-bottom:1px solid #ddd}small{color:#66705f}</style><h1>${esc(shopName)} · ${esc(m.ws_receipt())}</h1><p>${esc(m.ws_col_order())} #${o.id} · ${formatDate(o.createdAt)}<br>${esc(o.customerName)} · ${esc(o.email)}</p><table><thead><tr><th>${esc(m.ws_col_book())}</th><th>${esc(m.ws_col_qty())}</th><th>${esc(m.ws_col_amount())}</th></tr></thead><tbody>${o.lines
    .map((l) => `<tr><td>${esc(l.title)}</td><td>${l.qty}</td><td>${formatXof(l.priceXof * l.qty)}</td></tr>`)
    .join('')}<tr><td colspan="2">${esc(m.ws_delivery())}</td><td>${formatXof(o.fee)}</td></tr><tr><th colspan="2">${esc(m.total())}</th><th>${formatXof(orderTotal(o))}</th></tr></tbody></table><p>${esc(m.confirmation_payment())} : ${esc(paymentBadge(o.paymentStatus)[0])} · ${esc(methodLabel(o.paymentMethod))} · ${esc(o.paymentReference)}</p><small>${esc(m.ws_amounts_xof())}</small></html>`;
  download(`${shopName.toLowerCase()}-recu-${o.id}.html`, html, 'text/html;charset=utf-8');
  toast(m.ws_receipt_downloaded());
}

export function OrderDetail({ order: o, admin, couriers = [], shopName }: { order: OrderView | null; admin: boolean; couriers?: string[]; shopName: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const back = admin ? '/admin/commandes' : '/mon-compte/commandes';
  if (!o) {
    return (
      <>
        <ContentHead title={m.not_found_title()} description={m.ws_order_missing()} />
        <section className="panel">
          <Empty
            title={m.ws_lost_title()}
            description={m.ws_lost_body()}
            action={
              <Link className="btn" to={back}>
                {m.ws_back_to_space()}
              </Link>
            }
          />
        </section>
      </>
    );
  }
  const order = o;
  const prepare = canPrepare(order);
  const stage = ({ 'a-preparer': 0, preparation: 1, prete: 1, livraison: 2, livree: 3 } as Record<string, number>)[order.deliveryStatus] ?? 0;
  const count = order.lines.reduce((s, l) => s + l.qty, 0);

  async function run(action: () => Promise<{ ok: boolean; reason?: string }>, done: string) {
    setBusy(true);
    try {
      const result = await action();
      if (!result.ok) {
        toast(result.reason === 'courier' ? m.ws_need_courier() : result.reason === 'unpaid' ? m.ws_need_payment() : m.ws_order_final());
        return;
      }
      toast(done);
      await router.invalidate();
    } finally {
      setBusy(false);
    }
  }

  function submitDelivery(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    void run(
      () =>
        saveOrderDelivery({
          data: {
            id: order.id,
            status: String(data.get('delivery')) as OrderView['deliveryStatus'],
            courier: String(data.get('courier') ?? ''),
            window: String(data.get('window') ?? ''),
          },
        }),
      m.ws_delivery_saved(),
    );
  }

  function confirmCancel() {
    openSheet(
      m.ws_cancel_title({ id: order.id }),
      m.ws_cancel_intro(),
      <form
        className="sheet-form section-gap"
        onSubmit={(e) => {
          e.preventDefault();
          closeSheet();
          void run(() => cancelOrderFn({ data: { id: order.id } }), m.ws_cancelled());
        }}
      >
        <p className="muted">{order.paymentStatus === 'paid' ? m.ws_cancel_paid_note() : m.ws_cancel_note()}</p>
        <button className="btn danger" type="submit">
          {m.ws_cancel_confirm()}
        </button>
        <button className="btn secondary" type="button" onClick={closeSheet}>
          {m.ws_cancel_keep()}
        </button>
      </form>,
    );
  }

  const orderPanel = (
    <section className="panel">
      <div className="panel-head">
        <div>
          <h2>{m.ws_order_books()}</h2>
          <p>{m.ws_order_books_sub({ count })}</p>
        </div>
        <DeliveryBadge status={order.deliveryStatus} />
      </div>
      <div className="detail-list">
        {order.lines.map((l) => (
          <div className="detail-item" key={l.bookId}>
            <img src={coverUrl(l.cover)} alt={l.title} width="43" height="63" />
            <div>
              <h3>{l.title}</h3>
              <p>
                {l.author} · {m.ws_qty({ count: l.qty })}
              </p>
              <p>{m.ws_unit_price({ price: formatXof(l.priceXof) })}</p>
            </div>
            <strong>{formatXof(l.priceXof * l.qty)}</strong>
          </div>
        ))}
      </div>
      <div className="totals">
        <div>
          <span>{m.ws_books_subtotal()}</span>
          <span>{formatXof(orderSubtotal(order))}</span>
        </div>
        <div>
          <span>
            {m.ws_delivery()} · {order.area}
          </span>
          <span>{formatXof(order.fee)}</span>
        </div>
        <div className="total">
          <span>{m.ws_order_total()}</span>
          <span>{formatXof(orderTotal(order))}</span>
        </div>
      </div>
    </section>
  );

  const deliveryPanel = admin ? (
    <Panel title={m.ws_prep_delivery()} sub={m.ws_prep_delivery_sub()}>
      {!prepare ? (
        <div className="inline-notice warning">
          <WIcon name="clock" />
          {m.ws_prep_after_payment()}
        </div>
      ) : null}
      <form className="sheet-form" onSubmit={submitDelivery} key={order.deliveryStatus + order.courier}>
        <label className="field">
          {m.ws_order_state()}
          <select name="delivery" defaultValue={order.deliveryStatus} disabled={!prepare || order.deliveryStatus === 'annulee'}>
            {DELIVERY_STATUSES.filter((s) => s !== 'annulee' || order.deliveryStatus === 'annulee').map((s) => (
              <option key={s} value={s}>
                {deliveryBadge(s)[0]}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          {m.ws_courier()}
          <select name="courier" defaultValue={order.courier} disabled={!prepare}>
            <option value="">{m.ws_unassigned()}</option>
            {[...new Set([...couriers, ...(order.courier ? [order.courier] : [])])].map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </label>
        <label className="field">
          {m.ws_window()}
          <input name="window" defaultValue={order.window} placeholder={m.ws_window_placeholder()} disabled={!prepare} />
        </label>
        <button className="btn" type="submit" disabled={!prepare || busy || order.deliveryStatus === 'annulee'}>
          <WIcon name="check" />
          {m.ws_update()}
        </button>
      </form>
      {!['annulee', 'livree'].includes(order.deliveryStatus) ? (
        <button type="button" className="text-btn" style={{ marginTop: 16 }} onClick={confirmCancel}>
          {m.ws_cancel_order()}
        </button>
      ) : null}
    </Panel>
  ) : (
    <Panel title={m.ws_journey()} sub={order.deliveryStatus === 'annulee' ? m.ws_journey_cancelled() : m.ws_journey_sub()}>
      {order.deliveryStatus === 'annulee' ? (
        <p className="muted small">{m.ws_journey_cancelled()}</p>
      ) : (
        <>
          <div className="order-stage-strip">
            {STEPS().map((l, i) => (
              <div key={l} className={`order-stage ${i < stage ? 'done' : i === stage ? 'active' : 'future'}`}>
                <strong>{l}</strong>
                <small>{i < stage ? m.ws_step_done() : i === stage ? (prepare ? m.ws_step_current() : m.ws_step_after_payment()) : m.ws_step_next()}</small>
              </div>
            ))}
          </div>
          <div className="inline-notice">
            <WIcon name="truck" />
            <div>
              {order.deliveryStatus === 'livree' ? m.ws_delivered_note() : m.ws_window_note({ window: order.window || m.window_to_organise() })}
              {order.courier ? (
                <>
                  <br />
                  {m.ws_courier_note({ courier: order.courier })}
                </>
              ) : null}
            </div>
          </div>
          <Link to="/mon-compte/aide" search={{ commande: order.id }} className="text-link">
            {m.ws_question_order()} <WIcon name="arrow" />
          </Link>
        </>
      )}
    </Panel>
  );

  const paymentPanel = (
    <Panel title={m.confirmation_payment()} sub={m.ws_payment_sub()}>
      <dl className="key-values">
        <dt>{m.ws_status()}</dt>
        <dd>
          <PaymentBadge status={order.paymentStatus} />
        </dd>
        <dt>{m.ws_method()}</dt>
        <dd>{methodLabel(order.paymentMethod)}</dd>
        <dt>{m.ws_col_amount()}</dt>
        <dd>
          <strong>{formatXof(orderTotal(order))}</strong>
        </dd>
        <dt>{m.ws_reference()}</dt>
        <dd>{order.paymentReference || '—'}</dd>
      </dl>
      {order.paymentStatus === 'paid' ? (
        <div className="inline-notice">
          <WIcon name="check" />
          {m.ws_payment_confirmed()}
        </div>
      ) : null}
      {['paid', 'refunded'].includes(order.paymentStatus) ? (
        <Btn kind="secondary small" icon="download" onClick={() => receipt(order, shopName)}>
          {m.ws_receipt()}
        </Btn>
      ) : admin && order.paymentMethod === 'cash_on_delivery' && order.deliveryStatus !== 'annulee' ? (
        <>
          <div className="inline-notice warning">
            <WIcon name="info" />
            {m.ws_cash_note()}
          </div>
          <Btn kind="secondary small" disabled={busy} onClick={() => void run(() => savePaymentStatus({ data: { id: order.id, status: 'paid' } }), m.ws_cash_recorded())}>
            {m.ws_cash_received()}
          </Btn>
        </>
      ) : !admin && order.paymentStatus !== 'paid' && order.deliveryStatus !== 'annulee' && order.paymentMethod !== 'cash_on_delivery' ? (
        <Link className="btn secondary small" to="/commande/$orderId" params={{ orderId: order.id }} search={{ t: undefined }}>
          {m.confirmation_pay_now()}
        </Link>
      ) : (
        <p className="progress-note">{order.paymentMethod === 'cash_on_delivery' ? m.ws_cash_client_note() : m.ws_payment_waiting()}</p>
      )}
      {admin && order.paymentStatus === 'paid' && order.deliveryStatus === 'annulee' ? (
        <Btn kind="secondary small" disabled={busy} onClick={() => void run(() => savePaymentStatus({ data: { id: order.id, status: 'refunded' } }), m.ws_refund_recorded())}>
          {m.ws_mark_refunded()}
        </Btn>
      ) : null}
    </Panel>
  );

  const customerPanel = (
    <Panel title={admin ? m.ws_customer() : m.confirmation_address()}>
      <div className="address">
        <strong>{order.customerName}</strong>
        {order.address}
        <br />
        {m.togo()}
        <br />
        <span className="muted small">
          {order.phone}
          {admin ? ` · ${order.email}` : ''}
        </span>
      </div>
      {order.customerNote ? <p className="progress-note">« {order.customerNote} »</p> : null}
      {admin && order.customerId ? (
        <>
          <hr className="divider" />
          <Link to="/admin/clients/$customerId" params={{ customerId: order.customerId }} className="text-link">
            {m.ws_customer_card()} <WIcon name="arrow" />
          </Link>
        </>
      ) : null}
    </Panel>
  );

  const notes = admin ? (
    <Panel title={m.ws_team_note()} sub={m.ws_team_note_sub()}>
      <form
        className="sheet-form"
        onSubmit={(e) => {
          e.preventDefault();
          const note = String(new FormData(e.currentTarget).get('note') ?? '');
          void run(() => saveOrderNote({ data: { id: order.id, note } }), m.ws_note_saved());
        }}
      >
        <label className="field">
          <span className="sr-only">{m.ws_team_note()}</span>
          <textarea name="note" maxLength={1000} defaultValue={order.note} placeholder={m.ws_team_note_placeholder()} />
        </label>
        <button className="btn secondary small" type="submit">
          {m.ws_save_note()}
        </button>
      </form>
    </Panel>
  ) : (
    <Panel title={m.ws_next_read()} sub={m.ws_next_read_sub()}>
      <Btn
        kind="secondary"
        icon="bag"
        onClick={() => {
          let n = 0;
          for (const l of order.lines) if (addToCart(l.bookId, l.qty)) n += l.qty;
          trackEvent('reorder.click', { order: order.id });
          toast(n ? m.ws_reordered({ count: n }) : m.cart_max_reached());
        }}
      >
        {m.ws_reorder()}
      </Btn>
      <p className="progress-note">{m.ws_reorder_note()}</p>
    </Panel>
  );

  return (
    <>
      <Link to={back} className="back-link">
        <WIcon name="left" />
        {m.ws_all_orders()}
      </Link>
      <ContentHead
        title={m.ws_order_title({ id: order.id })}
        description={`${m.ws_placed_on({ date: formatDate(order.createdAt), time: formatTime(order.createdAt) })}${admin ? ` · ${order.customerName}` : ''}`}
      />
      <div className="detail-grid">
        <div>
          {orderPanel}
          {admin ? notes : deliveryPanel}
        </div>
        <div className="panel-stack">
          {paymentPanel}
          {admin ? deliveryPanel : null}
          {customerPanel}
          {admin ? null : notes}
        </div>
      </div>
    </>
  );
}
