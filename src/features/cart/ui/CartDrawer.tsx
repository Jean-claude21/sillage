import { Link, useNavigate } from '@tanstack/react-router';
import { Icon } from '@/lib/icons';
import { useDialog } from '@/lib/modal';
import { useStore } from '@/lib/store';
import * as m from '@/paraglide/messages.js';
import { trackEvent } from '@/features/analytics/track';
import { coverUrl, MAX_PER_BOOK } from '@/features/catalog/domain/book';
import { useMoney, useTotal } from '@/features/currency/ui/currency-store';
import { DEMO_MODE, useShop } from '@/features/storefront/ui/shop-context';
import { countItems } from '../domain/cart';
import { cartOpen, removeFromCart, updateQty, useCart } from './cart-store';

/** The cart, as the mockup's drawer: lines, quantities, subtotal, then the recap. */
export function CartDrawer() {
  const open = useStore(cartOpen, false);
  const ref = useDialog(open, () => cartOpen.set(false));
  const { books } = useShop();
  const money = useMoney();
  const total = useTotal();
  const navigate = useNavigate();
  const lines = useCart()
    .map((l) => ({ ...l, book: books.find((b) => b.id === l.id) }))
    .filter((l): l is typeof l & { book: NonNullable<typeof l.book> } => Boolean(l.book));
  const count = countItems(lines);
  const close = () => cartOpen.set(false);

  return (
    <dialog id="cart-dialog" className="drawer" aria-labelledby="cart-title" ref={ref}>
      <div className="drawer-head">
        <div>
          <span className="muted">{m.cart_kicker()}</span>
          <h2 id="cart-title">
            {m.cart_title()} <span id="drawer-count">({count})</span>
          </h2>
        </div>
        <button type="button" className="icon-button" aria-label={m.cart_close()} onClick={close}>
          <Icon name="close" />
        </button>
      </div>
      <div id="cart-content">
        {!lines.length ? (
          <div className="cart-empty">
            <Icon name="bag" />
            <h3>
              {m.cart_empty_title_1()}
              <br />
              {m.cart_empty_title_2()}
            </h3>
            <p>{m.cart_empty_body()}</p>
            <button
              type="button"
              className="button"
              onClick={() => {
                close();
                void navigate({ to: '/catalogue' });
              }}
            >
              {m.explore_shop()} <Icon name="arrow" />
            </button>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {lines.map(({ book: b, qty }) => (
                <article className="cart-item" key={b.id}>
                  <Link to="/livres/$bookId" params={{ bookId: b.id }} onClick={close}>
                    <img src={coverUrl(b.cover)} alt={b.title} width="62" height="91" />
                  </Link>
                  <div>
                    <h3>
                      <Link to="/livres/$bookId" params={{ bookId: b.id }} onClick={close}>
                        {b.title}
                      </Link>
                    </h3>
                    <p className="muted">{b.author}</p>
                    <div className="quantity-control">
                      <button type="button" aria-label={m.cart_less({ title: b.title })} onClick={() => updateQty(b.id, -1)}>
                        −
                      </button>
                      <output>{qty}</output>
                      <button
                        type="button"
                        aria-label={m.cart_more({ title: b.title })}
                        disabled={qty >= MAX_PER_BOOK}
                        onClick={() => updateQty(b.id, 1)}
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      className="text-button remove"
                      onClick={() => {
                        removeFromCart(b.id);
                        trackEvent('cart.remove', { book: b.id });
                      }}
                    >
                      {m.cart_remove()}
                    </button>
                  </div>
                  <span className="price">{money(b.priceXof, qty)}</span>
                </article>
              ))}
            </div>
            <div className="cart-summary">
              <div className="cart-total">
                <span>{m.subtotal()}</span>
                <span>{total(lines.map((l) => ({ priceXof: l.book.priceXof, qty: l.qty })))}</span>
              </div>
              <small>{DEMO_MODE ? m.cart_note_demo() : m.cart_note()}</small>
              <button
                type="button"
                className="button"
                onClick={() => {
                  close();
                  void navigate({ to: '/commande' });
                }}
              >
                {m.cart_checkout()} <Icon name="arrow" />
              </button>
              <button type="button" className="text-button" style={{ display: 'block', margin: '17px auto 0', fontSize: 11 }} onClick={close}>
                {m.continue_browsing()}
              </button>
            </div>
          </>
        )}
      </div>
    </dialog>
  );
}
