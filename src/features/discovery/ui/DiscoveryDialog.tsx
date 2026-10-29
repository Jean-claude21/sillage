import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import { Icon } from '@/lib/icons';
import { useDialog } from '@/lib/modal';
import { createStore, useStore } from '@/lib/store';
import * as m from '@/paraglide/messages.js';
import { trackEvent } from '@/features/analytics/track';
import { coverUrl } from '@/features/catalog/domain/book';
import { useMoney } from '@/features/currency/ui/currency-store';
import { useShop } from '@/features/storefront/ui/shop-context';

/** The reading guide: one wish, one book to start with. */
export const discoveryOpen = createStore(false);

export function openDiscovery(): void {
  discoveryOpen.set(true);
  trackEvent('guide.start', {});
}

const CHOICES = [
  ['litterature', () => m.guide_litterature()],
  ['jeunesse', () => m.guide_jeunesse()],
  ['savoirs', () => m.guide_savoirs()],
  ['pratique', () => m.guide_pratique()],
  ['inspiration', () => m.guide_inspiration()],
] as const;

export function DiscoveryDialog() {
  const open = useStore(discoveryOpen, false);
  const [theme, setTheme] = useState<string | null>(null);
  const ref = useDialog(open, () => {
    discoveryOpen.set(false);
    setTheme(null);
  });
  const { books } = useShop();
  const money = useMoney();
  const book = theme ? books.find((b) => b.theme === theme) : undefined;

  return (
    <dialog id="discovery-dialog" className="modal" aria-labelledby="discovery-title" ref={ref}>
      <button type="button" className="icon-button modal-close" aria-label={m.guide_close()} onClick={() => discoveryOpen.set(false)}>
        <Icon name="close" />
      </button>
      <div id="discovery-content">
        {!book ? (
          <>
            <h2 id="discovery-title">
              {m.guide_title_1()}
              <br />
              <em>{m.guide_title_2()}</em>
            </h2>
            <p>{m.guide_intro()}</p>
            <div className="quiz-options">
              {CHOICES.map(([id, label]) => (
                <button
                  type="button"
                  key={id}
                  onClick={() => {
                    setTheme(id);
                    trackEvent('guide.choose', { theme: id });
                  }}
                >
                  {label()} <Icon name="arrow" />
                </button>
              ))}
            </div>
            <small className="muted">{m.guide_note()}</small>
          </>
        ) : (
          <>
            <h2 id="discovery-title">
              {m.guide_result_1()}
              <br />
              <em>{m.guide_result_2()}</em>
            </h2>
            <div className="quiz-result">
              <img src={coverUrl(book.cover)} alt={book.title} width="105" height="154" />
              <div>
                <h3>{book.title}</h3>
                <p>{book.subtitle}</p>
                <p>
                  {book.author} · {money(book.priceXof)}
                </p>
              </div>
            </div>
            <p>{book.description}</p>
            <Link className="button" to="/livres/$bookId" params={{ bookId: book.id }} onClick={() => discoveryOpen.set(false)}>
              {m.guide_open_book()} <Icon name="arrow" />
            </Link>
            <button type="button" className="text-button" style={{ display: 'block', marginTop: 20, fontSize: 11 }} onClick={() => setTheme(null)}>
              {m.guide_again()}
            </button>
          </>
        )}
      </div>
    </dialog>
  );
}
