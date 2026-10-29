import { Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Icon } from '@/lib/icons';
import * as m from '@/paraglide/messages.js';
import { trackEvent } from '@/features/analytics/track';
import { useMoney } from '@/features/currency/ui/currency-store';
import { DemoNote, PageIntro } from '@/features/storefront/ui/parts';
import { DEMO_MODE, useShop } from '@/features/storefront/ui/shop-context';
import { coverUrl, MAX_PER_BOOK, relatedBooks } from '../domain/book';
import { themeLabel } from '../domain/themes';
import { addBook, BookGrid, HeartButton } from './BookCard';

export function ProductPage({ bookId }: { bookId: string }) {
  const { books } = useShop();
  const money = useMoney();
  const [qty, setQty] = useState(1);
  const b = books.find((x) => x.id === bookId);

  useEffect(() => {
    setQty(1);
    if (b) trackEvent('book.view', { isbn: b.isbn, book: b.id, publisher: b.publisherId, theme: b.theme, price_xof: b.priceXof });
  }, [b?.id]);

  if (!b) {
    return (
      <>
        <PageIntro title={m.not_found_title()} />
        <div className="wrap section">
          <Link className="button" to="/catalogue">
            {m.back_to_catalog()}
          </Link>
        </div>
      </>
    );
  }

  const theme = themeLabel(b.theme);
  return (
    <>
      <div className="wrap page-intro">
        <div className="breadcrumb">
          <Link to="/">{m.crumb_home()}</Link>
          <span>/</span>
          <Link to="/catalogue">{m.crumb_shop()}</Link>
          <span>/</span>
          <Link to="/catalogue" search={{ theme: b.theme }}>
            {theme}
          </Link>
        </div>
      </div>
      <section className="wrap product-layout">
        <div className="product-art">
          <img src={coverUrl(b.cover)} alt={m.cover_alt({ title: b.title })} width="300" height="440" />
          <HeartButton book={b} />
        </div>
        <div className="product-info">
          <Link className="theme-pill" to="/catalogue" search={{ theme: b.theme }}>
            {theme}
          </Link>
          <h1>{b.title}</h1>
          <p className="author">{b.author}</p>
          <p className="publisher">
            <Link to="/catalogue" search={{ editeur: b.publisherId }}>
              {b.publisherName} <span aria-hidden="true">↗</span>
            </Link>
          </p>
          <p className="description">{b.description}</p>
          <span className="price">{money(b.priceXof)}</span>
          <p className="availability">
            {b.stock <= 0 ? m.availability_out() : b.stock <= b.threshold ? m.availability_low({ count: b.stock }) : m.availability_in()}
          </p>
          <div className="purchase-row">
            <div className="quantity-control" aria-label={m.qty_label()}>
              <button type="button" aria-label={m.qty_less()} onClick={() => setQty((q) => Math.max(1, q - 1))}>
                −
              </button>
              <output id="product-qty">{qty}</output>
              <button type="button" aria-label={m.qty_more()} onClick={() => setQty((q) => Math.min(MAX_PER_BOOK, q + 1))}>
                +
              </button>
            </div>
            <button type="button" className="button" disabled={b.stock <= 0} onClick={() => addBook(b, qty, 'product')}>
              {m.add_to_cart()} <Icon name="bag" />
            </button>
          </div>
          <dl className="product-details">
            <div>
              <dt>{m.detail_format()}</dt>
              <dd>{b.format || (b.kind === 'pack' ? m.format_pack() : m.format_book())}</dd>
            </div>
            <div>
              <dt>{m.detail_pages()}</dt>
              <dd>{m.pages_count({ count: b.pages })}</dd>
            </div>
            <div>
              <dt>{m.detail_language()}</dt>
              <dd>{m.language_fr()}</dd>
            </div>
            <div>
              <dt>{m.detail_collection()}</dt>
              <dd>{theme}</dd>
            </div>
          </dl>
        </div>
      </section>
      <section className="wrap product-description">
        <div>
          <h2>{m.excerpt_title()}</h2>
          <p>« {b.excerpt} »</p>
          {DEMO_MODE ? <p className="muted">{m.excerpt_fictive()}</p> : null}
        </div>
        <div>
          <details onToggle={(e) => (e.currentTarget as HTMLDetailsElement).open && trackEvent('book.excerpt_open', { book: b.id })}>
            <summary>{m.faq_for_whom()}</summary>
            <p>{m.faq_for_whom_body({ theme })}</p>
          </details>
          <details>
            <summary>{m.faq_delivery()}</summary>
            <p>{m.faq_delivery_body()}</p>
          </details>
          <details>
            <summary>{m.faq_publisher()}</summary>
            <p>{DEMO_MODE ? m.faq_publisher_body_demo({ publisher: b.publisherName }) : m.faq_publisher_body({ publisher: b.publisherName })}</p>
            <Link className="text-link" to="/catalogue" search={{ editeur: b.publisherId }}>
              {m.see_publisher_books()} <Icon name="arrow" />
            </Link>
          </details>
        </div>
      </section>
      <section className="wrap section">
        <div className="section-head">
          <h2>{m.related_title()}</h2>
          <Link className="text-link" to="/catalogue">
            {m.crumb_shop()} <Icon name="arrow" />
          </Link>
        </div>
        <BookGrid books={relatedBooks(books, b)} source="related" />
      </section>
      <DemoNote />
    </>
  );
}
