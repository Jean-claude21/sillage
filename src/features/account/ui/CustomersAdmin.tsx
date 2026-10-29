import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import { WIcon } from '@/lib/icons';
import { fold, formatDate, formatXof, initials } from '@/lib/text';
import * as m from '@/paraglide/messages.js';
import { orderTotal, type OrderView } from '@/features/orders/domain/order';
import { OrderTable } from '@/features/orders/ui/OrderTable';
import { ContentHead, Empty, Panel, SearchInput } from '@/features/workspace/ui/parts';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  orders: OrderView[];
}

const paidTotal = (orders: OrderView[]) => orders.filter((o) => o.paymentStatus === 'paid').reduce((s, o) => s + orderTotal(o), 0);

export function CustomersView({ customers }: { customers: Customer[] }) {
  const [q, setQ] = useState('');
  const list = customers.filter((c) => !q || fold(`${c.name} ${c.email} ${c.city}`).includes(fold(q)));
  return (
    <>
      <ContentHead title={m.ws_customers_title()} description={m.ws_customers_intro()} />
      <section className="panel">
        <div className="view-tools">
          <SearchInput value={q} onChange={setQ} placeholder={m.ws_customers_search()} />
          <span className="muted small">{m.ws_profiles_count({ count: list.length })}</span>
        </div>
        {list.length ? (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th scope="col">{m.ws_col_customer()}</th>
                  <th scope="col">{m.field_city()}</th>
                  <th scope="col">{m.ws_col_orders()}</th>
                  <th scope="col">{m.ws_col_paid()}</th>
                  <th scope="col">{m.ws_col_last_order()}</th>
                  <th scope="col" />
                </tr>
              </thead>
              <tbody>
                {list.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <Link className="person" to="/admin/clients/$customerId" params={{ customerId: c.id }}>
                        <span className="avatar">{initials(c.name)}</span>
                        <span>
                          <strong>{c.name}</strong>
                          <small className="subtext">{c.email}</small>
                        </span>
                      </Link>
                    </td>
                    <td>{c.city || '—'}</td>
                    <td>{c.orders.length}</td>
                    <td>
                      <strong>{formatXof(paidTotal(c.orders))}</strong>
                    </td>
                    <td>{c.orders[0] ? formatDate(c.orders[0].createdAt) : '—'}</td>
                    <td>
                      <Link className="icon-btn" to="/admin/clients/$customerId" params={{ customerId: c.id }} aria-label={m.ws_see_profile({ name: c.name })}>
                        <WIcon name="chev" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty title={m.ws_customers_empty_title()} description={m.ws_customers_empty_body()} />
        )}
      </section>
    </>
  );
}

export function CustomerView({ customer: c }: { customer: Customer | null }) {
  if (!c) {
    return <ContentHead title={m.not_found_title()} description={m.ws_customer_missing()} />;
  }
  return (
    <>
      <Link to="/admin/clients" className="back-link">
        <WIcon name="left" />
        {m.ws_all_customers()}
      </Link>
      <ContentHead title={c.name} description={m.ws_customer_intro()} />
      <div className="detail-grid">
        <section className="panel">
          <div className="panel-head">
            <h2>{m.ws_their_orders()}</h2>
            <span className="status neutral">{m.ws_orders_count_many({ count: c.orders.length })}</span>
          </div>
          <OrderTable orders={c.orders} admin />
        </section>
        <div>
          <Panel title={m.ws_contact_details()}>
            <div className="address">
              <strong>{c.name}</strong>
              {c.email}
              <br />
              {c.phone || '—'}
              <br />
              {c.city ? `${c.city}, ${m.togo()}` : m.togo()}
            </div>
            <hr className="divider" />
            <dl className="key-values">
              <dt>{m.ws_col_paid()}</dt>
              <dd>
                <strong>{formatXof(paidTotal(c.orders))}</strong>
              </dd>
              <dt>{m.ws_col_last_order()}</dt>
              <dd>{c.orders[0] ? formatDate(c.orders[0].createdAt) : '—'}</dd>
            </dl>
          </Panel>
        </div>
      </div>
    </>
  );
}
