import { Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { Icon } from '@/lib/icons';
import * as m from '@/paraglide/messages.js';
import { trackEvent } from '@/features/analytics/track';
import { DemoNote, PageIntro } from '@/features/storefront/ui/parts';
import { useShop } from '@/features/storefront/ui/shop-context';
import { useWishes } from '@/features/wishlist/ui/wish-store';
import { filterBooks, type CatalogQuery } from '../domain/book';
import { THEME_IDS, themeLabel } from '../domain/themes';
import { BookGrid } from './BookCard';

/** The catalogue and the wishes share one screen, as in the mockup. */
export function CatalogPage({ query, wishes: isWish = false }: { query: CatalogQuery; wishes?: boolean }) {
  const { books, publishers } = useShop();
  const wished = useWishes();
  const navigate = useNavigate();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { q = '', theme = '', editeur = '', selection = '', type = '', tri = 'selection' } = query;
  const publisher = publishers.find((p) => p.id === editeur);
  const list = filterBooks(books, query, isWish ? wished : undefined);

  const title = isWish
    ? m.wishes_title()
    : q
      ? m.catalog_results_for({ q })
      : theme
        ? themeLabel(theme)
        : publisher
          ? publisher.name
          : type === 'pack'
            ? m.catalog_title_packs()
            : selection === 'nouveautes'
              ? m.catalog_title_new()
              : selection === 'selection'
                ? m.catalog_title_selection()
                : m.catalog_title();

  const lastSearch = useRef('');
  useEffect(() => {
    if (!q || lastSearch.current === q) return;
    lastSearch.current = q;
    trackEvent('search.submit', { results: list.length, has_results: list.length > 0 });
    if (!list.length) trackEvent('search.no_results', { q });
  }, [q, list.length]);

  const to = isWish ? '/favoris' : '/catalogue';
  function change(key: keyof CatalogQuery, value: string) {
    const next = { ...query, [key]: value || undefined };
    void navigate({ to, search: next, replace: false, resetScroll: false });
    if (value && key !== 'tri') trackEvent('catalog.filter', { kind: key, value });
    if (key === 'tri') trackEvent('catalog.sort', { by: value });
  }

  const active: [keyof CatalogQuery, string][] = (
    [
      ['theme', theme ? themeLabel(theme) : ''],
      ['editeur', publisher?.name ?? editeur],
      ['selection', selection ? (selection === 'nouveautes' ? m.filter_new() : m.filter_selection()) : ''],
      ['type', type ? m.filter_packs() : ''],
      ['q', q],
    ] as [keyof CatalogQuery, string][]
  ).filter(([key, label]) => Boolean(query[key]) && Boolean(label));

  return (
    <>
      <PageIntro
        title={title}
        description={isWish ? m.wishes_intro() : m.catalog_intro()}
        crumb={isWish ? m.wishes_short() : m.crumb_catalog()}
      />
      <div className="catalog-layout wrap">
        <aside className={`filters${filtersOpen ? ' open' : ''}`} id="catalog-filters" aria-label={m.filters_label()}>
          <div className="filter-group">
            <h3>{m.filters_themes()}</h3>
            {THEME_IDS.map((id) => (
              <label className="filter-option" key={id}>
                <input type="checkbox" value={id} checked={theme === id} onChange={(e) => change('theme', e.target.checked ? id : '')} />
                {themeLabel(id)}
              </label>
            ))}
          </div>
          <div className="filter-group">
            <h3>{m.filters_publishers()}</h3>
            {publishers.map((p) => (
              <label className="filter-option" key={p.id}>
                <input type="checkbox" value={p.id} checked={editeur === p.id} onChange={(e) => change('editeur', e.target.checked ? p.id : '')} />
                {p.name}
              </label>
            ))}
          </div>
          <div className="filter-group">
            <h3>{m.filters_discover()}</h3>
            <label className="filter-option">
              <input type="checkbox" checked={selection === 'nouveautes'} onChange={(e) => change('selection', e.target.checked ? 'nouveautes' : '')} />
              {m.filters_new()}
            </label>
            <label className="filter-option">
              <input type="checkbox" checked={type === 'pack'} onChange={(e) => change('type', e.target.checked ? 'pack' : '')} />
              {m.filters_packs()}
            </label>
            <button type="button" className="text-button filter-reset" onClick={() => void navigate({ to, search: {} })}>
              {m.filters_reset()}
            </button>
          </div>
        </aside>
        <section aria-label={m.catalog_books_label()}>
          <div className="catalog-toolbar">
            <p id="result-count" role="status">
              {list.length > 1
                ? isWish
                  ? m.count_wishes_many({ count: list.length })
                  : m.count_books_many({ count: list.length })
                : isWish
                  ? m.count_wishes_one({ count: list.length })
                  : m.count_books_one({ count: list.length })}
            </p>
            <button
              type="button"
              className="filters-toggle"
              aria-expanded={filtersOpen}
              aria-controls="catalog-filters"
              onClick={() => setFiltersOpen((o) => !o)}
            >
              {m.filters_toggle()} {active.length ? `(${active.length})` : ''}
            </button>
            <label className="sort-label">
              {m.sort_label()}
              <select id="catalog-sort" value={tri} onChange={(e) => change('tri', e.target.value === 'selection' ? '' : e.target.value)}>
                <option value="selection">{m.sort_selection()}</option>
                <option value="prix-asc">{m.sort_price_asc()}</option>
                <option value="prix-desc">{m.sort_price_desc()}</option>
                <option value="titre">{m.sort_title()}</option>
              </select>
            </label>
          </div>
          {active.length ? (
            <div className="active-filters">
              {active.map(([key, label]) => (
                <button type="button" key={key} aria-label={m.filter_remove({ label })} onClick={() => change(key, '')}>
                  {label} <span aria-hidden="true">×</span>
                </button>
              ))}
            </div>
          ) : null}
          {list.length ? (
            <BookGrid books={list} className="catalog-grid" source={isWish ? 'wishes' : 'catalogue'} />
          ) : (
            <div className="empty-state">
              <Icon name={isWish ? 'heart' : 'search'} />
              <h2>{isWish ? m.wishes_empty_title() : m.catalog_empty_title()}</h2>
              <p>{isWish ? m.wishes_empty_body() : m.catalog_empty_body()}</p>
              <Link className="button" to="/catalogue">
                {m.catalog_explore_all()} <Icon name="arrow" />
              </Link>
            </div>
          )}
        </section>
      </div>
      <DemoNote />
    </>
  );
}
