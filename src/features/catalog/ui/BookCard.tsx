import { Link } from '@tanstack/react-router';
import { Icon } from '@/lib/icons';
import { toast } from '@/lib/toast';
import * as m from '@/paraglide/messages.js';
import { trackEvent } from '@/features/analytics/track';
import { addToCart } from '@/features/cart/ui/cart-store';
import { useMoney } from '@/features/currency/ui/currency-store';
import { toggleWish, useWishes } from '@/features/wishlist/ui/wish-store';
import { coverUrl, type Book } from '../domain/book';
import { themeLabel } from '../domain/themes';

export function HeartButton({ book }: { book: Book }) {
  const wished = useWishes().includes(book.id);
  return (
    <button
      type="button"
      className="icon-button heart"
      aria-label={`${wished ? m.wish_remove_label() : m.wish_add_label()} ${book.title}`}
      aria-pressed={wished}
      onClick={() => toast(toggleWish(book.id) ? m.wish_added() : m.wish_removed())}
    >
      <Icon name="heart" />
    </button>
  );
}

/** Adds to the cart with the mockup's confirmation, or explains the per-book limit. */
export function addBook(book: Book, qty: number, source: string): void {
  if (book.stock <= 0) {
    toast(m.cart_out_of_stock());
    return;
  }
  if (!addToCart(book.id, qty)) {
    toast(m.cart_max_reached());
    return;
  }
  toast(m.cart_added({ title: book.title }));
  trackEvent('cart.add', { book: book.id, source, qty, price_xof: book.priceXof });
}

export function BookCard({ book, source = 'catalogue' }: { book: Book; source?: string }) {
  const money = useMoney();
  return (
    <article className="book-card">
      <div className="book-stage">
        <Link className="cover-link" to="/livres/$bookId" params={{ bookId: book.id }} tabIndex={-1} aria-hidden="true">
          <img src={coverUrl(book.cover)} alt="" width="300" height="440" loading="lazy" />
        </Link>
        {book.isNew ? (
          <span className="book-badge">{m.badge_new()}</span>
        ) : book.kind === 'pack' ? (
          <span className="book-badge">{m.badge_pack()}</span>
        ) : null}
        <HeartButton book={book} />
      </div>
      <p className="book-meta">{themeLabel(book.theme)}</p>
      <h3>
        <Link to="/livres/$bookId" params={{ bookId: book.id }}>
          {book.title}
        </Link>
      </h3>
      <p className="book-author">{book.author}</p>
      <div className="book-bottom">
        <span className="price">{money(book.priceXof)}</span>
        <button
          type="button"
          className="add-button"
          aria-label={m.cart_add_label({ title: book.title })}
          onClick={() => addBook(book, 1, source)}
        >
          +
        </button>
      </div>
    </article>
  );
}

export function BookGrid({ books, className = '', source }: { books: readonly Book[]; className?: string; source?: string }) {
  return (
    <div className={`books-grid ${className}`}>
      {books.map((b) => (
        <BookCard key={b.id} book={b} source={source} />
      ))}
    </div>
  );
}
