import { Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Icon } from '@/lib/icons';
import * as m from '@/paraglide/messages.js';
import { trackEvent } from '@/features/analytics/track';
import { coverUrl } from '@/features/catalog/domain/book';
import { clearCart, useCart } from '@/features/cart/ui/cart-store';
import { useMoney, useTotal } from '@/features/currency/ui/currency-store';
import { DemoNote, PageIntro } from '@/features/storefront/ui/parts';
import { DEMO_MODE, useShop } from '@/features/storefront/ui/shop-context';
import { submitOrder } from '../functions';

interface Prefill {
  name: string;
  email: string;
  phone: string;
  street: string;
  area: string;
  city: string;
}

export function CheckoutPage({ prefill }: { prefill: Prefill | null }) {
  const { books, delivery, payments, viewer } = useShop();
  const money = useMoney();
  const total = useTotal();
  const navigate = useNavigate();
  const cart = useCart();
  const [zone, setZone] = useState<'lome' | 'outside'>('lome');
  const methods = [
    payments.mobileMoney && (['mobile_money', m.method_mobile_money(), m.method_mobile_money_hint()] as const),
    payments.card && (['card', m.method_card(), m.method_card_hint()] as const),
    payments.cashOnDelivery && (['cash_on_delivery', m.method_cash(), m.method_cash_hint()] as const),
  ].filter((x) => x !== false);
  const [method, setMethod] = useState<string>(methods[0]?.[0] ?? 'cash_on_delivery');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const started = useRef(false);

  const lines = cart
    .map((l) => ({ ...l, book: books.find((b) => b.id === l.id) }))
    .filter((l): l is typeof l & { book: NonNullable<typeof l.book> } => Boolean(l.book));
  const fee = zone === 'lome' ? delivery.lome : delivery.outside;
  const subtotalXof = lines.reduce((s, l) => s + l.book.priceXof * l.qty, 0);

  useEffect(() => {
    if (started.current || !lines.length) return;
    started.current = true;
    trackEvent('checkout.start', { items: lines.reduce((s, l) => s + l.qty, 0), value_xof: subtotalXof });
  }, [lines.length]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const get = (k: string) => String(data.get(k) ?? '').trim();
    setSending(true);
    setError('');
    try {
      const result = await submitOrder({
        data: {
          lines: lines.map((l) => ({ id: l.id, qty: l.qty })),
          name: get('name'),
          email: get('email'),
          phone: get('phone'),
          zone,
          street: get('street'),
          area: get('area'),
          city: get('city'),
          note: get('note'),
          paymentMethod: method as 'mobile_money' | 'card' | 'cash_on_delivery',
        },
      });
      if (!result.ok) {
        const title = books.find((b) => b.id === result.bookId)?.title ?? '';
        setError(result.reason === 'stock' ? m.checkout_error_stock({ title }) : result.reason === 'method' ? m.checkout_error_method() : m.checkout_error_unavailable({ title }));
        trackEvent('checkout.payment_failed', { method, reason: result.reason });
        return;
      }
      trackEvent('order.placed', { order: result.id, items: result.items, value_xof: result.total, method });
      clearCart();
      if (result.redirect) window.location.assign(result.redirect);
      else void navigate({ to: '/commande/$orderId', params: { orderId: result.id }, search: { t: result.token } });
    } catch {
      setError(m.checkout_error_generic());
    } finally {
      setSending(false);
    }
  }

  if (!lines.length) {
    return (
      <>
        <PageIntro title={m.checkout_title()} crumb={m.checkout_crumb()} />
        <div className="wrap section">
          <div className="empty-state">
            <Icon name="bag" />
            <h2>{m.checkout_empty_title()}</h2>
            <p>{m.cart_empty_body()}</p>
            <Link className="button" to="/catalogue">
              {m.explore_shop()} <Icon name="arrow" />
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageIntro title={m.checkout_title()} description={m.checkout_intro()} crumb={m.checkout_crumb()} />
      <form className="wrap checkout-layout" onSubmit={submit}>
        <div className="contact-form">
          <fieldset className="checkout-step">
            <legend>
              <span>1</span>
              {m.checkout_step_contact()}
            </legend>
            {!viewer ? (
              <p className="muted" style={{ fontSize: 12, marginBottom: 16 }}>
                {m.checkout_have_account()}{' '}
                <Link to="/connexion" search={{ redirect: '/commande' }} className="text-button">
                  {m.checkout_sign_in()}
                </Link>
              </p>
            ) : null}
            <div className="checkout-fields">
              <label className="full">
                {m.field_full_name()}
                <input name="name" autoComplete="name" required minLength={2} maxLength={100} defaultValue={prefill?.name ?? ''} />
              </label>
              <label>
                {m.email_label()}
                <input name="email" type="email" autoComplete="email" required defaultValue={prefill?.email ?? ''} placeholder={m.email_placeholder()} />
              </label>
              <label>
                {m.field_phone()}
                <input name="phone" type="tel" autoComplete="tel" required minLength={6} maxLength={40} defaultValue={prefill?.phone ?? ''} placeholder="90 00 00 00" />
              </label>
            </div>
          </fieldset>
          <fieldset className="checkout-step">
            <legend>
              <span>2</span>
              {m.checkout_step_delivery()}
            </legend>
            {(
              [
                ['lome', m.zone_lome(), m.zone_lome_hint(), delivery.lome],
                ['outside', m.zone_outside(), m.zone_outside_hint(), delivery.outside],
              ] as const
            ).map(([id, label, hint, price]) => (
              <label className="choice-card" key={id}>
                <input
                  type="radio"
                  name="zone"
                  value={id}
                  checked={zone === id}
                  onChange={() => {
                    setZone(id);
                    trackEvent('checkout.delivery', { zone: id });
                  }}
                />
                <span>
                  <strong>{label}</strong>
                  <small>{hint}</small>
                </span>
                <span className="choice-price">{money(price)}</span>
              </label>
            ))}
            <div className="checkout-fields" style={{ marginTop: 18 }}>
              <label className="full">
                {m.field_street()}
                <textarea name="street" required minLength={3} maxLength={300} defaultValue={prefill?.street ?? ''} style={{ minHeight: 80 }} />
              </label>
              <label>
                {m.field_area()}
                <input name="area" required minLength={2} maxLength={80} defaultValue={prefill?.area ?? ''} />
              </label>
              <label>
                {m.field_city()}
                <input name="city" required minLength={2} maxLength={80} defaultValue={prefill?.city || (zone === 'lome' ? 'Lomé' : '')} key={zone} />
              </label>
              <label className="full">
                {m.field_note()}
                <input name="note" maxLength={500} placeholder={m.field_note_placeholder()} />
              </label>
            </div>
          </fieldset>
          <fieldset className="checkout-step">
            <legend>
              <span>3</span>
              {m.checkout_step_payment()}
            </legend>
            {methods.map(([id, label, hint]) => (
              <label className="choice-card" key={id}>
                <input
                  type="radio"
                  name="method"
                  value={id}
                  checked={method === id}
                  onChange={() => {
                    setMethod(id);
                    trackEvent('checkout.payment', { method: id });
                  }}
                />
                <span>
                  <strong>{label}</strong>
                  <small>{hint}</small>
                </span>
              </label>
            ))}
          </fieldset>
        </div>
        <aside className="checkout-summary" aria-label={m.checkout_summary_label()}>
          <h2>{m.checkout_summary_title()}</h2>
          {lines.map(({ book: b, qty }) => (
            <div className="checkout-row" key={b.id}>
              <span>
                <img src={coverUrl(b.cover)} alt="" width="38" height="56" />
                {qty} × {b.title}
              </span>
              <strong>{money(b.priceXof, qty)}</strong>
            </div>
          ))}
          <div className="checkout-row">
            <span>{m.subtotal()}</span>
            <span>{total(lines.map((l) => ({ priceXof: l.book.priceXof, qty: l.qty })))}</span>
          </div>
          <div className="checkout-row">
            <span>{zone === 'lome' ? m.fee_lome() : m.fee_outside()}</span>
            <span>{money(fee)}</span>
          </div>
          <div className="checkout-row total">
            <span>{m.total()}</span>
            <span>{total([...lines.map((l) => ({ priceXof: l.book.priceXof, qty: l.qty })), { priceXof: fee, qty: 1 }])}</span>
          </div>
          {error ? (
            <p className="form-error" role="alert">
              {error}
            </p>
          ) : null}
          <button className="button" type="submit" disabled={sending}>
            {method === 'cash_on_delivery' ? m.checkout_submit_cash() : m.checkout_submit_pay()} <Icon name="arrow" />
          </button>
          <small>{DEMO_MODE ? m.checkout_note_demo() : m.checkout_note()}</small>
        </aside>
      </form>
      <DemoNote />
    </>
  );
}
