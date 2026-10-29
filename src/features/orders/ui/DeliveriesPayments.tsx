import { Link, useRouter } from '@tanstack/react-router';
import { useState, type FormEvent } from 'react';
import { WIcon } from '@/lib/icons';
import { fold, formatDate, formatXof } from '@/lib/text';
import { toast } from '@/lib/toast';
import * as m from '@/paraglide/messages.js';
import { Btn, closeSheet, ContentHead, DeliveryBadge, Empty, openSheet, PaymentBadge, SearchInput, SelectFilter } from '@/features/workspace/ui/parts';
import { canPrepare, methodLabel, orderTotal, paymentBadge, PAYMENT_STATUSES, type OrderView } from '../domain/order';
import { planDelivery } from '../functions';
import { exportOrders } from './OrdersView';

function TourForm({ ready, couriers, onDone }: { ready: OrderView[]; couriers: string[]; onDone: () => void }) {
  const tomorrow = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const ids = data.getAll('orders').map(String);
    if (!ids.length) {
      toast(m.ws_tour_pick());
      return;
    }
    const { count } = await planDelivery({
      data: { ids, courier: String(data.get('courier')), date: String(data.get('date')), window: String(data.get('window')) },
    });
    closeSheet();
    toast(count > 1 ? m.ws_tour_done_many({ count }) : m.ws_tour_done_one({ count }));
    onDone();
  }
  if (!ready.length) {
    return (
      <Empty
        title={m.ws_tour_none_title()}
        description={m.ws_tour_none_body()}
        action={
          <Link to="/admin/commandes" className="btn" onClick={closeSheet}>
            {m.ws_see_orders()}
          </Link>
        }
      />
    );
  }
  return (
    <form className="sheet-form" onSubmit={(e) => void submit(e)}>
      <div>
        <h3>{m.ws_ready_orders()}</h3>
        {ready.map((o) => (
          <label className="choice-row" key={o.id}>
            <input type="checkbox" name="orders" value={o.id} defaultChecked /> #{o.id} · {o.customerName} · {o.area}
          </label>
        ))}
      </div>
      <label className="field">
        {m.ws_hand_to()}
        <select name="courier">
          {couriers.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </label>
      <label className="field">
        {m.ws_date()}
        <input name="date" type="date" min={new Date().toISOString().slice(0, 10)} defaultValue={tomorrow} required />
      </label>
      <label className="field">
        {m.ws_slot()}
        <select name="window">
          <option>09 h – 13 h</option>
          <option>14 h – 18 h</option>
        </select>
      </label>
      <div className="inline-notice">
        <WIcon name="info" />
        {m.ws_tour_notice()}
      </div>
      <button className="btn" type="submit">
        <WIcon name="truck" />
        {m.ws_tour_submit()}
      </button>
    </form>
  );
}

export function DeliveriesView({ orders, couriers }: { orders: OrderView[]; couriers: string[] }) {
  const router = useRouter();
  const [tab, setTab] = useState<'organize' | 'active' | 'done'>('organize');
  const [q, setQ] = useState('');
  let list = orders.filter((o) => canPrepare(o) || o.paymentStatus === 'paid').filter((o) => o.deliveryStatus !== 'annulee');
  if (tab === 'organize') list = list.filter((o) => ['a-preparer', 'preparation', 'prete'].includes(o.deliveryStatus));
  else if (tab === 'active') list = list.filter((o) => o.deliveryStatus === 'livraison');
  else list = list.filter((o) => o.deliveryStatus === 'livree');
  if (q) list = list.filter((o) => fold(`${o.id} ${o.customerName} ${o.area}`).includes(fold(q)));
  const ready = orders.filter((o) => o.deliveryStatus === 'prete' && canPrepare(o));
  return (
    <>
      <ContentHead
        title={m.ws_deliveries_title()}
        description={m.ws_deliveries_intro()}
        actions={
          <Btn
            icon="truck"
            onClick={() =>
              openSheet(
                m.ws_tour_title(),
                m.ws_tour_intro(),
                <TourForm
                  ready={ready}
                  couriers={couriers}
                  onDone={() => {
                    setTab('active');
                    void router.invalidate();
                  }}
                />,
              )
            }
          >
            {m.ws_tour_title()}
          </Btn>
        }
      />
      <section className="panel">
        <div className="tabs section-gap">
          {(
            [
              ['organize', m.ws_tab_organize()],
              ['active', m.ws_tab_on_way()],
              ['done', m.ws_tab_delivered()],
            ] as const
          ).map(([id, t]) => (
            <button type="button" key={id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)}>
              {t}
            </button>
          ))}
        </div>
        <div className="view-tools">
          <SearchInput value={q} onChange={setQ} placeholder={m.ws_orders_search_admin()} />
          <Link to="/admin/parametres" search={{ onglet: 'livraison' }} className="text-link">
            {m.ws_zones_fees()} <WIcon name="arrow" />
          </Link>
        </div>
        {list.length ? (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th scope="col">{m.ws_col_order_customer()}</th>
                  <th scope="col">{m.ws_col_destination()}</th>
                  <th scope="col">{m.ws_window()}</th>
                  <th scope="col">{m.ws_col_team()}</th>
                  <th scope="col">{m.ws_status()}</th>
                  <th scope="col" />
                </tr>
              </thead>
              <tbody>
                {list.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <Link className="order-id" to="/admin/commandes/$orderId" params={{ orderId: o.id }}>
                        #{o.id}
                      </Link>
                      <small className="subtext">{o.customerName}</small>
                    </td>
                    <td>
                      {o.area}
                      <small className="subtext">
                        {o.city}, {m.togo()}
                      </small>
                    </td>
                    <td>{o.window}</td>
                    <td>{o.courier || m.ws_to_assign()}</td>
                    <td>
                      <DeliveryBadge status={o.deliveryStatus} />
                    </td>
                    <td>
                      <Link to="/admin/commandes/$orderId" params={{ orderId: o.id }} className="icon-btn" aria-label={m.ws_manage_delivery({ id: o.id })}>
                        <WIcon name="chev" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty title={m.ws_deliveries_empty_title()} description={m.ws_deliveries_empty_body()} />
        )}
        <div className="table-footer">
          <span>{list.length > 1 ? m.ws_deliveries_count_many({ count: list.length }) : m.ws_deliveries_count_one({ count: list.length })}</span>
          <span>{m.ws_internal_delivery()}</span>
        </div>
      </section>
    </>
  );
}

export function PaymentsView({ orders }: { orders: OrderView[] }) {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const list = orders.filter((o) => (!q || fold(`${o.id} ${o.customerName} ${o.paymentReference}`).includes(fold(q))) && (!status || o.paymentStatus === status));
  return (
    <>
      <ContentHead
        title={m.ws_payments_title()}
        description={m.ws_payments_intro()}
        actions={
          <Btn kind="secondary" icon="download" onClick={() => exportOrders(list)}>
            {m.ws_export()}
          </Btn>
        }
      />
      <section className="panel">
        <div className="view-tools">
          <SearchInput value={q} onChange={setQ} placeholder={m.ws_payments_search()} />
          <div className="actions">
            <SelectFilter id="payment" label={m.ws_all_statuses()} value={status} onChange={setStatus} choices={PAYMENT_STATUSES.map((s) => [s, paymentBadge(s)[0]])} />
            <Link to="/admin/parametres" search={{ onglet: 'paiements' }} className="text-link">
              {m.ws_payment_methods()} <WIcon name="arrow" />
            </Link>
          </div>
        </div>
        {list.length ? (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th scope="col">{m.ws_reference()}</th>
                  <th scope="col">{m.ws_col_customer()}</th>
                  <th scope="col">{m.ws_col_amount()}</th>
                  <th scope="col">{m.ws_method()}</th>
                  <th scope="col">{m.ws_status()}</th>
                  <th scope="col">{m.ws_col_order()}</th>
                </tr>
              </thead>
              <tbody>
                {list.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <strong>{o.paymentReference || '—'}</strong>
                      <small className="subtext">{formatDate(o.createdAt)}</small>
                    </td>
                    <td>{o.customerName}</td>
                    <td>
                      <strong>{formatXof(orderTotal(o))}</strong>
                    </td>
                    <td>{methodLabel(o.paymentMethod)}</td>
                    <td>
                      <PaymentBadge status={o.paymentStatus} />
                    </td>
                    <td>
                      <Link className="text-link" to="/admin/commandes/$orderId" params={{ orderId: o.id }}>
                        #{o.id} <WIcon name="chev" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty title={m.ws_payments_empty_title()} description={m.ws_payments_empty_body()} />
        )}
        <div className="table-footer">
          <span>{m.ws_payments_count({ count: list.length })}</span>
          <span>{m.ws_amounts_xof()}</span>
        </div>
      </section>
    </>
  );
}

