import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import { WIcon, type WorkspaceIconName } from '@/lib/icons';
import { formatNumber } from '@/lib/text';
import * as m from '@/paraglide/messages.js';
import { coverUrl, type Book } from '@/features/catalog/domain/book';
import { ContentHead, DeliveryBadge, Panel } from '@/features/workspace/ui/parts';
import { inQueue, orderTotal, type OrderView } from '../domain/order';
import { OrderTable } from './OrderTable';

const DAY = 86_400_000;

function Metric({ label, value, unit, sub, icon }: { label: string; value: string | number; unit?: string; sub: string; icon: WorkspaceIconName }) {
  return (
    <div className="metric">
      <span className="metric-label">
        <WIcon name={icon} />
        {label}
      </span>
      <strong>
        {value}
        {unit ? <small>{unit}</small> : null}
      </strong>
      <small>{sub}</small>
    </div>
  );
}

function relative(at: string): string {
  const d = new Date(at);
  const today = new Date();
  const time = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Lome' }).format(d);
  return d.toDateString() === today.toDateString()
    ? m.ws_today_at({ time })
    : new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Lome' }).format(d);
}

export function AdminOverview({ orders, lowBooks, activity }: { orders: OrderView[]; lowBooks: Book[]; activity: { text: string; at: string }[] }) {
  const [tab, setTab] = useState<'queue' | 'all'>('queue');
  const queued = orders.filter(inQueue);
  const now = Date.now();
  const paid = orders.filter((o) => o.paymentStatus === 'paid');
  const earned = paid.filter((o) => now - Date.parse(o.createdAt) < 7 * DAY).reduce((s, o) => s + orderTotal(o), 0);
  const delivery = orders.filter((o) => ['prete', 'livraison'].includes(o.deliveryStatus) && o.paymentStatus !== 'failed');
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now - (6 - i) * DAY);
    const key = d.toISOString().slice(0, 10);
    return {
      label: new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', timeZone: 'Africa/Lome' }).format(d),
      amount: paid.filter((o) => o.createdAt.slice(0, 10) === key).reduce((s, o) => s + orderTotal(o), 0),
    };
  });
  const max = Math.max(...days.map((d) => d.amount), 1);
  const today = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Africa/Lome' }).format(new Date());

  return (
    <>
      <ContentHead
        title={m.ws_overview_title()}
        description={m.ws_overview_intro()}
        actions={
          <>
            <span className="date-pill">
              <WIcon name="calendar" />
              {today}
            </span>
            <Link to="/admin/catalogue/$bookId" params={{ bookId: 'nouveau' }} className="btn">
              <WIcon name="plus" />
              {m.ws_add_book()}
            </Link>
          </>
        }
      />
      <div className="metric-strip">
        <Metric label={m.ws_metric_takings()} value={formatNumber(earned)} unit="F CFA" sub={m.ws_metric_takings_sub()} icon="wallet" />
        <Metric label={m.ws_metric_queue()} value={queued.length} sub={m.ws_metric_queue_sub()} icon="bag" />
        <Metric label={m.ws_metric_delivering()} value={orders.filter((o) => o.deliveryStatus === 'livraison').length} sub={m.ws_metric_delivering_sub()} icon="truck" />
        <Metric label={m.ws_metric_stock()} value={lowBooks.length} sub={m.ws_metric_stock_sub()} icon="box" />
      </div>
      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>{m.ws_next_orders()}</h2>
              <p>{m.ws_next_orders_sub()}</p>
            </div>
            <Link to="/admin/commandes" className="text-link">
              {m.ws_see_all()} <WIcon name="arrow" />
            </Link>
          </div>
          <div className="tabs">
            <button type="button" className={tab === 'queue' ? 'active' : ''} onClick={() => setTab('queue')}>
              {m.ws_tab_queue()} <span>{queued.length}</span>
            </button>
            <button type="button" className={tab === 'all' ? 'active' : ''} onClick={() => setTab('all')}>
              {m.ws_tab_all()} <span>{orders.length}</span>
            </button>
          </div>
          <OrderTable orders={(tab === 'all' ? orders : queued).slice(0, 5)} admin compact />
          <div className="table-footer">
            <span>{m.ws_amounts_with_delivery()}</span>
            <Link to="/admin/commandes" className="text-link">
              {m.ws_manage_orders()} <WIcon name="chev" />
            </Link>
          </div>
        </section>
        <div className="panel-stack">
          <Panel
            title={m.ws_deliveries_panel()}
            sub={m.ws_deliveries_panel_sub()}
            link={
              <Link to="/admin/livraisons" className="text-link">
                {m.ws_planning()} <WIcon name="arrow" />
              </Link>
            }
          >
            {delivery.length ? (
              delivery.map((o) => (
                <Link key={o.id} to="/admin/commandes/$orderId" params={{ orderId: o.id }} className="delivery-mini">
                  <span className="delivery-marker">
                    <WIcon name="truck" />
                  </span>
                  <div>
                    <strong>
                      #{o.id} · {o.area}
                    </strong>
                    <p>
                      {o.customerName} · {o.window}
                    </p>
                    <DeliveryBadge status={o.deliveryStatus} />
                  </div>
                  <WIcon name="chev" />
                </Link>
              ))
            ) : (
              <p className="muted small">{m.ws_no_delivery()}</p>
            )}
          </Panel>
          <Panel
            title={m.ws_stock_panel()}
            sub={m.ws_stock_panel_sub({ count: lowBooks.length })}
            link={
              <Link to="/admin/stocks" className="text-link">
                {m.ws_see_stocks()} <WIcon name="arrow" />
              </Link>
            }
          >
            {lowBooks.length ? (
              lowBooks.slice(0, 3).map((b) => (
                <Link key={b.id} className="stock-item" to="/admin/catalogue/$bookId" params={{ bookId: b.id }}>
                  <img src={coverUrl(b.cover)} alt="" width="30" height="44" />
                  <div>
                    <strong>{b.title}</strong>
                    <small>{b.stock === 0 ? m.ws_restock() : m.ws_threshold({ count: b.threshold })}</small>
                  </div>
                  <span className="stock-count">{b.stock === 0 ? m.ws_out() : m.ws_left({ count: b.stock })}</span>
                </Link>
              ))
            ) : (
              <p className="small muted">{m.ws_stock_ok()}</p>
            )}
          </Panel>
        </div>
      </div>
      <div className="under-grid">
        <Panel title={m.ws_week_takings()} sub={m.ws_week_takings_sub()}>
          <div className="chart" role="img" aria-label={days.map((d) => `${d.label} ${d.amount} F CFA`).join(', ')}>
            {days.map((d) => (
              <div className="chart-col" key={d.label}>
                <div className="chart-bar" style={{ height: `${Math.max(2, (d.amount / max) * 100)}%` }}>
                  {d.amount ? <span>{formatNumber(d.amount)}</span> : null}
                </div>
                <span>{d.label}</span>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title={m.ws_activity()} sub={m.ws_activity_sub()}>
          {activity.length ? (
            activity.map((a, i) => (
              <div className="activity" key={i}>
                <span />
                <div>
                  <p>{a.text}</p>
                  <small>{relative(a.at)}</small>
                </div>
              </div>
            ))
          ) : (
            <p className="muted small">{m.ws_activity_empty()}</p>
          )}
        </Panel>
      </div>
    </>
  );
}
