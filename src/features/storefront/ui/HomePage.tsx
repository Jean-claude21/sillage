import { Link } from '@tanstack/react-router';
import { Icon } from '@/lib/icons';
import { Rich } from '@/lib/rich';
import * as m from '@/paraglide/messages.js';
import { BookGrid } from '@/features/catalog/ui/BookCard';
import { coverUrl } from '@/features/catalog/domain/book';
import { THEME_IDS, themeLabel } from '@/features/catalog/domain/themes';
import { openDiscovery } from '@/features/discovery/ui/DiscoveryDialog';
import { DemoNote, PublisherLogo, Services } from './parts';
import { useShop } from './shop-context';

export function HomePage() {
  const { books, publishers, content } = useShop();
  const selection = content.selection.map((id) => books.find((b) => b.id === id)).filter((b) => b !== undefined);
  const featured = selection.length ? selection : books.slice(0, 4);
  // The hero's three covers and the gift section follow the mockup's choices when they exist.
  const pick = (id: string, i: number) => books.find((b) => b.id === id) ?? books[i];
  const [back, center, front] = [pick('liens-invisibles', 0), pick('maison-des-marees', 1), pick('champ-des-possibles', 2)];
  const young = books.find((b) => b.theme === 'jeunesse');
  const knowledge = books.find((b) => b.theme === 'savoirs');

  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <h1>
            <Rich text={content.title} />
          </h1>
          <p>
            <Rich text={content.description} />
          </p>
          <div className="hero-actions">
            <Link className="button" to="/catalogue">
              {m.explore_shop()} <Icon name="arrow" />
            </Link>
            <button type="button" className="button secondary" onClick={openDiscovery}>
              {m.home_find_book()}
            </button>
          </div>
          <div className="hero-foot">
            <Icon name="book" />
            {m.home_hero_foot()}
          </div>
        </div>
        <div className="hero-stage">
          <div className="stage-sun" />
          <div className="stage-floor" />
          <div className="stage-line" />
          <div className="sun-stamp">
            {m.home_stamp_1()}
            <br />
            <strong>{m.home_stamp_2()}</strong>
            <span>{m.home_stamp_3()}</span>
          </div>
          <div className="hero-books">
            {[
              [back, 'back'],
              [center, 'center'],
              [front, 'front'],
            ].map(([b, place]) =>
              b && typeof b !== 'string' ? (
                <Link key={b.id} to="/livres/$bookId" params={{ bookId: b.id }} className={`scene-book ${place}`} aria-label={m.home_discover_book({ title: b.title })}>
                  <img src={coverUrl(b.cover)} alt={b.title} width="300" height="440" {...(place === 'center' ? { fetchPriority: 'high' as const } : {})} />
                </Link>
              ) : null,
            )}
          </div>
          <span className="stage-caption">{m.home_stage_caption()}</span>
        </div>
      </section>
      <div className="wrap theme-strip">
        <p>{m.home_universe_question()}</p>
        <div className="theme-links">
          {THEME_IDS.map((id) => (
            <Link key={id} className="theme-pill" to="/catalogue" search={{ theme: id }}>
              <span className="theme-dot" />
              {themeLabel(id)}
            </Link>
          ))}
        </div>
      </div>
      <section className="wrap section">
        <div className="section-head">
          <div>
            <h2>{m.home_selection_title()}</h2>
            <p>{m.home_selection_body()}</p>
          </div>
          <Link className="text-link" to="/catalogue" search={{ selection: 'selection' }}>
            {m.home_selection_link()} <Icon name="arrow" />
          </Link>
        </div>
        <BookGrid books={featured} source="home" />
      </section>
      <section className="curated wrap">
        <div className="curated-visual">
          <div className="curated-circle" />
          {center ? <img src={coverUrl(center.cover)} alt={center.title} width="164" height="240" loading="lazy" /> : null}
          {front ? <img src={coverUrl(front.cover)} alt={front.title} width="153" height="224" loading="lazy" /> : null}
        </div>
        <div className="curated-copy">
          <h2>
            {m.home_gift_1()}
            <br />
            <em>{m.home_gift_2()}</em>
          </h2>
          <p>{m.home_gift_body()}</p>
          <Link className="button" to="/catalogue" search={{ type: 'pack' }}>
            {m.home_gift_link()} <Icon name="arrow" />
          </Link>
        </div>
      </section>
      <section className="wrap section">
        <div className="section-head">
          <div>
            <h2>{m.home_universes_title()}</h2>
            <p>{m.home_universes_body()}</p>
          </div>
          <button type="button" className="text-button text-link" onClick={openDiscovery}>
            {m.home_guide_me()} <Icon name="arrow" />
          </button>
        </div>
        <div className="editorial-grid">
          {[
            { theme: 'jeunesse', book: young, title: [m.home_young_1(), m.home_young_2()], body: [m.home_young_3(), m.home_young_4()] },
            { theme: 'savoirs', book: knowledge, title: [m.home_know_1(), m.home_know_2()], body: [m.home_know_3(), m.home_know_4()] },
          ].map((card) => (
            <article className="editorial-card" key={card.theme}>
              <Link className="editorial-art" to="/catalogue" search={{ theme: card.theme }} tabIndex={-1} aria-hidden="true">
                {card.book ? <img src={coverUrl(card.book.cover)} alt="" width="105" height="154" loading="lazy" /> : null}
              </Link>
              <div>
                <h3>
                  {card.title[0]}
                  <br />
                  {card.title[1]}
                </h3>
                <p>
                  {card.body[0]}
                  <br />
                  {card.body[1]}
                </p>
                <Link className="text-link" to="/catalogue" search={{ theme: card.theme }}>
                  {themeLabel(card.theme)} <Icon name="arrow" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="publisher-band">
        <div className="wrap">
          <h2>
            {m.home_publishers_1()}
            <br />
            {m.home_publishers_2()}
            <br />
            {m.home_publishers_3()}
          </h2>
          <div className="publisher-logos">
            {publishers.slice(0, 3).map((p) => (
              <Link key={p.id} className="publisher-logo" to="/catalogue" search={{ editeur: p.id }}>
                <PublisherLogo publisher={p} />
              </Link>
            ))}
          </div>
          <Link to="/editeurs" className="text-link">
            {m.home_publishers_link()} <Icon name="arrow" />
          </Link>
        </div>
      </section>
      <Services />
      <DemoNote />
    </>
  );
}
