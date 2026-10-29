import { Link } from '@tanstack/react-router';
import { WIcon } from '@/lib/icons';
import { formatDate, formatTime, formatXof, initials } from '@/lib/text';
import * as m from '@/paraglide/messages.js';
import { coverUrl } from '@/features/catalog/domain/book';
import { DeliveryBadge, Empty, PaymentBadge } from '@/features/workspace/ui/parts';
import { orderTotal, type OrderView } from '../domain/order';

/** The orders table of both spaces: client column for the team, covers for the reader. */
export function OrderTable({
  orders,
  admin,
  compact = false,
  onClear,
}: {
  orders: OrderView[];
  admin: boolean;
  compact?: boolean;
  onClear?: () => void;
}) {
  const base = admin ? '/admin/commandes/$orderId' : '/mon-compte/commandes/$orderId';
  if (!orders.length) {
    return (
      <Empty
        title={m.ws_orders_empty_title()}
        description={m.ws_orders_empty_body()}
        action={
          onClear ? (
            <button type="button" className="btn secondary" onClick={onClear}>
              {m.filters_reset()}
            </button>
          ) : undefined
        }
      />
    );
  }
  return (
    <div className={`table-scroll${compact ? ' compact' : ''}`}>
      <table>
        <thead>
          <tr>
            <th scope="col">{m.ws_col_order()}</th>
            <th scope="col">{admin ? m.ws_col_customer() : m.ws_col_books()}</th>
            <th scope="col">{m.ws_col_amount()}</th>
            <th scope="col">{m.confirmation_payment()}</th>
            <th scope="col">{m.ws_col_delivery()}</th>
            <th scope="col">
              <span className="sr-only">{m.ws_open()}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td>
                <Link className="order-id" to={base} params={{ orderId: o.id }}>
                  #{o.id}
                </Link>
                <small className="subtext">{compact ? formatTime(o.createdAt) : formatDate(o.createdAt)}</small>
              </td>
              <td>
                {admin ? (
                  <div className="person">
                    <span className="avatar">{initials(o.customerName)}</span>
                    <span>
                      {o.customerName}
                      <small className="subtext">{o.area}</small>
                    </span>
                  </div>
                ) : (
                  <div className="cover-stack">
                    {o.lines.map((l) => (
                      <img key={l.bookId} src={coverUrl(l.cover)} alt={l.title} width="25" height="36" />
                    ))}
                  </div>
                )}
              </td>
              <td className="price-nowrap">
                <strong>{formatXof(orderTotal(o))}</strong>
              </td>
              <td>
                <PaymentBadge status={o.paymentStatus} />
              </td>
              <td>
                <DeliveryBadge status={o.deliveryStatus} />
              </td>
              <td>
                <Link className="icon-btn" to={base} params={{ orderId: o.id }} aria-label={m.ws_see_order({ id: o.id })}>
                  <WIcon name="chev" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
