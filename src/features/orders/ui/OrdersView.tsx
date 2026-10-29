import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import { WIcon } from '@/lib/icons';
import { fold } from '@/lib/text';
import { toast } from '@/lib/toast';
import * as m from '@/paraglide/messages.js';
import { Btn, ContentHead, download, SearchInput, SelectFilter } from '@/features/workspace/ui/parts';
import { deliveryBadge, DELIVERY_STATUSES, methodLabel, orderTotal, paymentBadge, PAYMENT_STATUSES, type OrderView } from '../domain/order';
import { OrderTable } from './OrderTable';

export function exportOrders(list: OrderView[]): void {
  const rows = [
    [m.ws_col_order(), m.ws_col_date(), m.ws_col_customer(), m.ws_col_amount_xof(), m.ws_col_method(), m.confirmation_payment(), m.ws_col_delivery()],
    ...list.map((o) => [o.id, o.createdAt.slice(0, 10), o.customerName, orderTotal(o), methodLabel(o.paymentMethod), paymentBadge(o.paymentStatus)[0], deliveryBadge(o.deliveryStatus)[0]]),
  ];
  const csv = '﻿' + rows.map((r) => r.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(';')).join('\r\n');
  download(`sillage-commandes-${new Date().toISOString().slice(0, 10)}.csv`, csv, 'text/csv;charset=utf-8');
  toast(m.ws_exported());
}

export function AdminOrdersView({ orders, initialQuery = '' }: { orders: OrderView[]; initialQuery?: string }) {
  const [q, setQ] = useState(initialQuery);
  const [payment, setPayment] = useState('');
  const [delivery, setDelivery] = useState('');
  const list = orders.filter(
    (o) =>
      (!q || fold(`${o.id} ${o.customerName} ${o.area} ${o.email}`).includes(fold(q))) &&
      (!payment || o.paymentStatus === payment) &&
      (!delivery || o.deliveryStatus === delivery),
  );
  const clear = () => {
    setQ('');
    setPayment('');
    setDelivery('');
  };
  return (
    <>
      <ContentHead
        title={m.ws_orders_title_admin()}
        description={m.ws_orders_intro_admin()}
        actions={
          <Btn kind="secondary" icon="download" onClick={() => exportOrders(list)}>
            {m.ws_export()}
          </Btn>
        }
      />
      <section className="panel">
        <div className="view-tools">
          <SearchInput value={q} onChange={setQ} placeholder={m.ws_orders_search_admin()} />
          <div className="actions">
            <SelectFilter id="payment" label={m.ws_all_payments()} value={payment} onChange={setPayment} choices={PAYMENT_STATUSES.map((s) => [s, paymentBadge(s)[0]])} />
            <SelectFilter id="delivery" label={m.ws_all_deliveries()} value={delivery} onChange={setDelivery} choices={DELIVERY_STATUSES.map((s) => [s, deliveryBadge(s)[0]])} />
          </div>
        </div>
        <OrderTable orders={list} admin onClear={clear} />
        <div className="table-footer">
          <span>{list.length > 1 ? m.ws_orders_count_many({ count: list.length }) : m.ws_orders_count_one({ count: list.length })}</span>
          <span>{m.ws_amounts_xof()}</span>
        </div>
      </section>
    </>
  );
}

export function ClientOrdersView({ orders }: { orders: OrderView[] }) {
  const [q, setQ] = useState('');
  const [tab, setTab] = useState<'' | 'active' | 'done'>('');
  const list = orders.filter(
    (o) =>
      (!q || fold(`${o.id} ${o.lines.map((l) => l.title).join(' ')}`).includes(fold(q))) &&
      (!tab || (tab === 'active' ? !['livree', 'annulee'].includes(o.deliveryStatus) : o.deliveryStatus === 'livree')),
  );
  return (
    <>
      <ContentHead
        title={m.ws_orders_title_client()}
        description={m.ws_orders_intro_client()}
        actions={
          <Link className="btn secondary" to="/catalogue">
            {m.ws_back_to_shop()} <WIcon name="external" />
          </Link>
        }
      />
      <section className="panel">
        <div className="tabs section-gap">
          <button type="button" className={!tab ? 'active' : ''} onClick={() => setTab('')}>
            {m.ws_tab_all()} <span>{orders.length}</span>
          </button>
          <button type="button" className={tab === 'active' ? 'active' : ''} onClick={() => setTab('active')}>
            {m.ws_tab_active()}
          </button>
          <button type="button" className={tab === 'done' ? 'active' : ''} onClick={() => setTab('done')}>
            {m.ws_tab_delivered()}
          </button>
        </div>
        <div className="view-tools">
          <SearchInput value={q} onChange={setQ} placeholder={m.ws_orders_search_client()} />
        </div>
        <OrderTable orders={list} admin={false} onClear={() => setQ('')} />
        <div className="table-footer">
          <span>{list.length > 1 ? m.ws_orders_count_many({ count: list.length }) : m.ws_orders_count_one({ count: list.length })}</span>
          <span>{m.ws_amounts_xof()}</span>
        </div>
      </section>
    </>
  );
}
