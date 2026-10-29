import { Link, useRouter } from '@tanstack/react-router';
import type { FormEvent } from 'react';
import { WIcon } from '@/lib/icons';
import { formatDate, formatXof, initials } from '@/lib/text';
import { toast } from '@/lib/toast';
import * as m from '@/paraglide/messages.js';
import { trackEvent } from '@/features/analytics/track';
import { addToCart } from '@/features/cart/ui/cart-store';
import { coverUrl, type Book } from '@/features/catalog/domain/book';
import { THEME_IDS, themeLabel } from '@/features/catalog/domain/themes';
import { orderTotal, type OrderView } from '@/features/orders/domain/order';
import { saveWish } from '@/features/wishlist/functions';
import { Btn, closeSheet, ContentHead, DeliveryBadge, Empty, openSheet, Panel } from '@/features/workspace/ui/parts';
import { deleteAddress, saveAddress, saveProfile, sendTicket, setDefaultAddress, type fetchAccount } from '../functions';

type Account = Awaited<ReturnType<typeof fetchAccount>>;
type Address = Account['addresses'][number];

function useRefresh() {
  const router = useRouter();
  return () => void router.invalidate();
}

function OrderPreview({ o }: { o: OrderView }) {
  const count = o.lines.reduce((s, l) => s + l.qty, 0);
  return (
    <article className="order-preview">
      <div className="order-preview-top">
        <div>
          <h3>
            <Link to="/mon-compte/commandes/$orderId" params={{ orderId: o.id }}>
              {m.ws_order_title({ id: o.id })}
            </Link>
          </h3>
          <p>
            {formatDate(o.createdAt)} · {m.ws_books_count({ count })}
          </p>
        </div>
        <DeliveryBadge status={o.deliveryStatus} />
      </div>
      <div className="order-preview-books">
        <div className="cover-stack">
          {o.lines.map((l) => (
            <img key={l.bookId} src={coverUrl(l.cover)} alt="" width="33" height="49" />
          ))}
        </div>
        <div>
          {o.lines[0]?.title}
          {o.lines.length > 1 ? <small>{m.ws_and_more({ count: o.lines.length - 1 })}</small> : null}
        </div>
      </div>
      <div className="order-preview-foot">
        <strong>{formatXof(orderTotal(o))}</strong>
        <Link to="/mon-compte/commandes/$orderId" params={{ orderId: o.id }} className="text-link">
          {o.deliveryStatus === 'livree' ? m.ws_see_details() : m.ws_follow_order()} <WIcon name="arrow" />
        </Link>
      </div>
    </article>
  );
}

function MiniBook({ book: b, onRemove }: { book: Book; onRemove: () => void }) {
  return (
    <article className="mini-book">
      <div className="mini-book-art">
        <Link to="/livres/$bookId" params={{ bookId: b.id }}>
          <img src={coverUrl(b.cover)} alt={b.title} width="95" height="139" />
        </Link>
        <button type="button" className="icon-btn" aria-label={m.ws_remove_wish({ title: b.title })} onClick={onRemove}>
          <WIcon name="heart" />
        </button>
      </div>
      <h3>
        <Link to="/livres/$bookId" params={{ bookId: b.id }}>
          {b.title}
        </Link>
      </h3>
      <p>{b.author}</p>
      <div className="price-row">
        <span>{formatXof(b.priceXof)}</span>
        <button
          type="button"
          className="add-mini"
          aria-label={m.cart_add_label({ title: b.title })}
          disabled={b.stock === 0}
          onClick={() => {
            if (addToCart(b.id)) {
              toast(m.ws_added_to_shop_cart());
              trackEvent('cart.add', { book: b.id, source: 'account', qty: 1, price_xof: b.priceXof });
            } else toast(m.cart_max_reached());
          }}
        >
          +
        </button>
      </div>
      {b.stock === 0 ? <small className="danger-text">{m.availability_out()}</small> : null}
    </article>
  );
}

function useRemoveWish() {
  const refresh = useRefresh();
  return async (id: string) => {
    await saveWish({ data: { bookId: id, wished: false } });
    toast(m.wish_removed());
    refresh();
  };
}

export function ClientOverview({ account }: { account: Account }) {
  const remove = useRemoveWish();
  const { orders, profile, wishes } = account;
  const latest = orders[0];
  const address = account.addresses.find((a) => a.isDefault) ?? account.addresses[0];
  const messages: Record<string, [string, string]> = {
    'a-preparer': [m.ws_hero_confirmed_sub(), m.ws_hero_confirmed()],
    preparation: [m.ws_hero_preparing_sub(), m.ws_hero_preparing()],
    prete: [m.ws_hero_ready_sub(), m.ws_hero_ready()],
    livraison: [m.ws_hero_on_way_sub(), m.ws_hero_on_way()],
    livree: [m.ws_hero_delivered_sub(), m.ws_hero_delivered()],
    annulee: [m.ws_hero_cancelled_sub(), m.ws_hero_cancelled()],
  };
  const [sub, title] = latest ? (messages[latest.deliveryStatus] ?? messages['a-preparer']!) : ['', ''];
  return (
    <>
      <ContentHead
        title={m.ws_hello({ name: profile.name.split(' ')[0] ?? profile.name })}
        description={m.ws_hello_intro()}
        actions={
          <Link to="/catalogue" className="btn secondary">
            {m.explore_shop()} <WIcon name="external" />
          </Link>
        }
      />
      {latest ? (
        <section className="customer-hero">
          <div className="customer-hero-copy">
            <span className="status">{m.ws_order_title({ id: latest.id })}</span>
            <h2>{title}</h2>
            <p>
              {sub}
              <br />
              {m.ws_hero_body()}
            </p>
            <Link to="/mon-compte/commandes/$orderId" params={{ orderId: latest.id }} className="btn">
              {m.ws_follow_my_order()} <WIcon name="arrow" />
            </Link>
          </div>
          <div className="hero-mini-books">
            {latest.lines.slice(0, 2).map((l) => (
              <img key={l.bookId} src={coverUrl(l.cover)} alt={l.title} width="100" height="146" />
            ))}
          </div>
        </section>
      ) : (
        <section className="customer-hero">
          <div className="customer-hero-copy">
            <h2>{m.ws_first_order_title()}</h2>
            <p>{m.ws_first_order_body()}</p>
            <Link to="/catalogue" className="btn">
              {m.explore_shop()} <WIcon name="arrow" />
            </Link>
          </div>
        </section>
      )}
      <div className="summary-line">
        <span>
          <strong>{orders.length}</strong> {m.ws_orders_word()}
        </span>
        <span>
          <strong>{orders.filter((o) => !['livree', 'annulee'].includes(o.deliveryStatus)).length}</strong> {m.ws_in_progress_word()}
        </span>
        <span>
          <strong>{wishes.length}</strong> {m.ws_wishes_word()}
        </span>
      </div>
      <div className="client-grid section-gap">
        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>{m.ws_last_orders()}</h2>
              <p>{m.ws_last_orders_sub()}</p>
            </div>
            <Link className="text-link" to="/mon-compte/commandes">
              {m.ws_see_all()} <WIcon name="arrow" />
            </Link>
          </div>
          {orders.length ? orders.slice(0, 3).map((o) => <OrderPreview key={o.id} o={o} />) : <p className="muted small" style={{ padding: 24 }}>{m.ws_no_orders_yet()}</p>}
        </section>
        <div className="panel-stack">
          <Panel title={m.ws_main_address()}>
            {address ? (
              <>
                <div className="address">
                  <strong>
                    {address.label} · {address.name}
                  </strong>
                  {address.street}
                  <br />
                  {address.area}, {address.city}
                  <br />
                  {m.togo()}
                </div>
                <Link className="text-link section-gap" to="/mon-compte/adresses">
                  {m.ws_manage_addresses()} <WIcon name="arrow" />
                </Link>
              </>
            ) : (
              <>
                <p className="muted small">{m.ws_add_first_address()}</p>
                <Link className="text-link section-gap" to="/mon-compte/adresses">
                  {m.ws_add_address()} <WIcon name="arrow" />
                </Link>
              </>
            )}
          </Panel>
          <Panel
            title={m.ws_kept_for_later()}
            sub={m.ws_kept_for_later_sub()}
            link={
              <Link className="text-link" to="/mon-compte/favoris">
                {m.wishes_short()} <WIcon name="arrow" />
              </Link>
            }
          >
            {wishes.length ? (
              <div className="mini-books-grid">
                {wishes.slice(0, 2).map((b) => (
                  <MiniBook key={b.id} book={b} onRemove={() => void remove(b.id)} />
                ))}
              </div>
            ) : (
              <p className="muted small">{m.ws_wishes_here()}</p>
            )}
          </Panel>
        </div>
      </div>
    </>
  );
}

export function FavoritesView({ wishes }: { wishes: Book[] }) {
  const remove = useRemoveWish();
  return (
    <>
      <ContentHead
        title={m.wishes_title()}
        description={m.ws_favorites_intro()}
        actions={
          <Link to="/catalogue" className="btn secondary">
            {m.ws_discover_more()} <WIcon name="external" />
          </Link>
        }
      />
      {wishes.length ? (
        <div className="favorites-grid">
          {wishes.map((b) => (
            <MiniBook key={b.id} book={b} onRemove={() => void remove(b.id)} />
          ))}
        </div>
      ) : (
        <section className="panel">
          <Empty
            title={m.wishes_empty_title()}
            description={m.ws_favorites_empty()}
            action={
              <Link to="/catalogue" className="btn">
                {m.explore_shop()} <WIcon name="arrow" />
              </Link>
            }
          />
        </section>
      )}
    </>
  );
}

function AddressForm({ address, defaultName, isFirst, onDone }: { address?: Address; defaultName: string; isFirst: boolean; onDone: () => void }) {
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const get = (k: string) => String(d.get(k) ?? '').trim();
    await saveAddress({
      data: { id: address?.id, label: get('label'), name: get('name'), street: get('street'), area: get('area'), city: get('city'), phone: get('phone'), isDefault: d.has('default') },
    });
    closeSheet();
    toast(m.ws_address_saved());
    onDone();
  }
  return (
    <form className="sheet-form" onSubmit={(e) => void submit(e)}>
      <label className="field">
        {m.ws_address_label()}
        <input name="label" defaultValue={address?.label} placeholder={m.ws_address_label_placeholder()} required maxLength={50} />
      </label>
      <label className="field">
        {m.ws_recipient()}
        <input name="name" defaultValue={address?.name ?? defaultName} required maxLength={100} />
      </label>
      <label className="field">
        {m.field_street()}
        <textarea name="street" defaultValue={address?.street} required maxLength={300} />
      </label>
      <div className="form-grid">
        <label className="field">
          {m.field_area()}
          <input name="area" defaultValue={address?.area} required maxLength={80} />
        </label>
        <label className="field">
          {m.field_city()}
          <input name="city" defaultValue={address?.city ?? 'Lomé'} required maxLength={80} />
        </label>
      </div>
      <label className="field">
        {m.field_phone()}
        <input name="phone" defaultValue={address?.phone} placeholder="90 00 00 00" required maxLength={50} />
      </label>
      <label className="choice-row">
        <input name="default" type="checkbox" defaultChecked={address?.isDefault ?? isFirst} />
        {m.ws_make_default()}
      </label>
      <button className="btn" type="submit">
        <WIcon name="check" />
        {m.ws_save_address()}
      </button>
    </form>
  );
}

export function AddressesView({ addresses, name }: { addresses: Address[]; name: string }) {
  const refresh = useRefresh();
  const edit = (a?: Address) =>
    openSheet(a ? m.ws_edit_address() : m.ws_new_address(), m.ws_address_sheet_intro(), <AddressForm address={a} defaultName={name} isFirst={!addresses.length} onDone={refresh} />);
  const remove = (a: Address) =>
    openSheet(
      m.ws_delete_address_title(),
      `${a.label} · ${a.city}`,
      <form
        className="sheet-form section-gap"
        onSubmit={(e) => {
          e.preventDefault();
          void deleteAddress({ data: { id: a.id } }).then(() => {
            closeSheet();
            toast(m.ws_address_deleted());
            refresh();
          });
        }}
      >
        <p className="muted">{m.ws_delete_address_note()}</p>
        <button className="btn danger" type="submit">
          {m.ws_delete_address()}
        </button>
        <button className="btn secondary" type="button" onClick={closeSheet}>
          {m.ws_keep_address()}
        </button>
      </form>,
    );
  return (
    <>
      <ContentHead
        title={m.ws_addresses_title()}
        description={m.ws_addresses_intro()}
        actions={
          <Btn icon="plus" onClick={() => edit()}>
            {m.ws_add_address()}
          </Btn>
        }
      />
      <div className="address-grid">
        {addresses.map((a) => (
          <article className="address-card" key={a.id}>
            <div className="address">
              {a.isDefault ? <span className="status">{m.ws_main_address_badge()}</span> : <span className="status neutral">{m.ws_other_address_badge()}</span>}
              <strong>
                {a.label} · {a.name}
              </strong>
              {a.street}
              <br />
              {a.area}, {a.city}
              <br />
              {m.togo()}
              <br />
              <span className="small muted">{a.phone}</span>
            </div>
            <div className="actions">
              <Btn kind="secondary small" icon="edit" onClick={() => edit(a)}>
                {m.ws_edit()}
              </Btn>
              {!a.isDefault ? (
                <button
                  type="button"
                  className="text-btn"
                  onClick={() =>
                    void setDefaultAddress({ data: { id: a.id } }).then(() => {
                      toast(m.ws_default_saved());
                      refresh();
                    })
                  }
                >
                  {m.ws_set_default()}
                </button>
              ) : null}
              <button type="button" className="icon-btn" aria-label={m.ws_delete_address_label({ label: a.label })} onClick={() => remove(a)}>
                <WIcon name="trash" />
              </button>
            </div>
          </article>
        ))}
        <button type="button" className="add-address" onClick={() => edit()}>
          <WIcon name="plus" />
          {m.ws_add_new_address()}
        </button>
      </div>
    </>
  );
}

export function ProfileView({ profile }: { profile: Account['profile'] }) {
  const refresh = useRefresh();
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    await saveProfile({
      data: {
        name: String(d.get('name') ?? '').trim(),
        phone: String(d.get('phone') ?? '').trim(),
        newsletter: d.has('newsletter'),
        genres: d.getAll('genres').map(String) as (typeof THEME_IDS)[number][],
      },
    });
    toast(m.ws_profile_saved());
    refresh();
  }
  return (
    <>
      <ContentHead title={m.ws_profile_title()} description={m.ws_profile_intro()} />
      <div className="detail-grid">
        <form className="panel" onSubmit={(e) => void submit(e)}>
          <div className="form-section">
            <div className="profile-intro">
              <span className="avatar peach">{initials(profile.name)}</span>
              <div>
                <h2>{profile.name}</h2>
                <p>{profile.email}</p>
              </div>
            </div>
            <div className="form-grid">
              <label className="field full">
                {m.field_full_name()}
                <input name="name" defaultValue={profile.name} required maxLength={100} />
              </label>
              <label className="field">
                {m.email_label()}
                <input type="email" value={profile.email} disabled />
              </label>
              <label className="field">
                {m.field_phone()}
                <input name="phone" defaultValue={profile.phone} maxLength={50} />
              </label>
            </div>
          </div>
          <div className="form-section">
            <h2>{m.ws_what_you_read()}</h2>
            {THEME_IDS.map((id) => (
              <label className="choice-row" key={id}>
                <input name="genres" type="checkbox" value={id} defaultChecked={profile.genres.includes(id)} />
                {themeLabel(id)}
              </label>
            ))}
            <hr className="divider" />
            <label className="choice-row">
              <input name="newsletter" type="checkbox" defaultChecked={profile.newsletter} />
              {m.ws_newsletter_pref()}
            </label>
          </div>
          <div className="form-footer">
            <button className="btn" type="submit">
              <WIcon name="check" />
              {m.ws_save_profile()}
            </button>
          </div>
        </form>
        <div className="panel-stack">
          <Panel title={m.ws_your_account()}>
            <p className="muted small">{m.ws_your_account_body()}</p>
          </Panel>
          <Panel title={m.ws_a_question()}>
            <p className="muted small">{m.ws_a_question_body()}</p>
            <Link className="text-link section-gap" to="/mon-compte/aide">
              {m.ws_contact_shop()} <WIcon name="arrow" />
            </Link>
          </Panel>
        </div>
      </div>
    </>
  );
}

export function SupportView({ orders, tickets, orderId }: { orders: OrderView[]; tickets: Account['tickets']; orderId?: string }) {
  const refresh = useRefresh();
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const d = new FormData(form);
    try {
      await sendTicket({ data: { orderId: String(d.get('order') ?? '') || undefined, subject: String(d.get('subject') ?? ''), message: String(d.get('message') ?? '') } });
      toast(m.ws_ticket_sent());
      trackEvent('contact.submit', { topic: d.get('order') ? 'order' : 'account' });
      form.reset();
      refresh();
    } catch {
      toast(m.contact_failed());
    }
  }
  return (
    <>
      <ContentHead title={m.ws_support_title()} description={m.ws_support_intro()} />
      <div className="support-layout">
        <section className="panel">
          <form onSubmit={(e) => void submit(e)}>
            <div className="form-section">
              <h2>{m.ws_write_shop()}</h2>
              <div className="form-grid section-gap">
                <label className="field full">
                  {m.ws_your_order()}
                  <select name="order" defaultValue={orderId ?? ''}>
                    <option value="">{m.ws_general_question()}</option>
                    {orders.map((o) => (
                      <option key={o.id} value={o.id}>
                        {m.ws_order_title({ id: o.id })}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field full">
                  {m.ws_subject()}
                  <input name="subject" required maxLength={150} placeholder={m.ws_subject_placeholder()} />
                </label>
                <label className="field full">
                  {m.contact_message()}
                  <textarea name="message" required minLength={10} maxLength={3000} placeholder={m.contact_message_placeholder()} />
                </label>
              </div>
              <div className="inline-notice">
                <WIcon name="mail" />
                {m.ws_ticket_notice()}
              </div>
            </div>
            <div className="form-footer">
              <button className="btn" type="submit">
                {m.ws_send_ticket()} <WIcon name="arrow" />
              </button>
            </div>
          </form>
        </section>
        <div className="panel-stack">
          <Panel title={m.ws_your_tickets()}>
            {tickets.length ? (
              tickets.map((t) => (
                <div className="support-thread" key={t.id}>
                  <span className={`status ${t.status === 'resolved' ? '' : 'warning'}`}>{t.status === 'resolved' ? m.ws_ticket_resolved() : m.ws_ticket_open()}</span>
                  <strong style={{ display: 'block', marginTop: 8 }}>{t.subject}</strong>
                  <p>{t.message}</p>
                  <small className="muted">{formatDate(t.createdAt)}</small>
                </div>
              ))
            ) : (
              <p className="muted small">{m.ws_no_tickets()}</p>
            )}
          </Panel>
          <Panel title={m.ws_useful_answers()}>
            <div className="faq">
              <details>
                <summary>{m.ws_faq_track()}</summary>
                <p>{m.ws_faq_track_body()}</p>
              </details>
              <details>
                <summary>{m.ws_faq_who()}</summary>
                <p>{m.ws_faq_who_body()}</p>
              </details>
              <details>
                <summary>{m.help_q3()}</summary>
                <p>{m.help_a3()}</p>
              </details>
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}
