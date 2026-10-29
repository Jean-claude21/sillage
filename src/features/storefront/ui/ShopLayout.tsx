import { Link, useLocation, useNavigate } from '@tanstack/react-router';
import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Icon, IconSprite } from '@/lib/icons';
import { useStore } from '@/lib/store';
import { Toast } from '@/lib/toast';
import * as m from '@/paraglide/messages.js';
import { trackEvent } from '@/features/analytics/track';
import { isStaff } from '@/features/auth/domain/roles';
import { countItems } from '@/features/cart/domain/cart';
import { CartDrawer } from '@/features/cart/ui/CartDrawer';
import { cartOpen, loadCart, useCart } from '@/features/cart/ui/cart-store';
import { subscribeNewsletter } from '@/features/contact/functions';
import { CountryPicker, useRateLabel } from '@/features/currency/ui/CountryPicker';
import { DiscoveryDialog } from '@/features/discovery/ui/DiscoveryDialog';
import { useWishes } from '@/features/wishlist/ui/wish-store';
import { InfoDialog, openInfo } from './InfoDialog';
import { DEMO_MODE, useShop } from './shop-context';

export function BrandMark() {
  return (
    <svg viewBox="0 0 38 38" aria-hidden="true">
      <path d="M5 30V9c6-1 11 0 14 4 3-4 8-5 14-4v21c-6-1-11 0-14 4-3-4-8-5-14-4Z" />
      <path d="M19 13v21M11 3l8 5 8-5" />
    </svg>
  );
}

const NAV_MAIN = [
  { label: () => m.nav_all(), search: {} },
  { label: () => m.nav_new(), search: { selection: 'nouveautes' as const } },
  { label: () => m.nav_selection(), search: { selection: 'selection' as const } },
  { label: () => m.nav_packs(), search: { type: 'pack' as const } },
];

function Header() {
  const { viewer } = useShop();
  const lines = useCart();
  const wishes = useWishes();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [q, setQ] = useState('');
  const query = (location.search as { q?: string }).q ?? '';

  useEffect(() => setQ(query), [query]);
  useEffect(() => setMenuOpen(false), [location.href]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const accountHref = viewer && isStaff(viewer.role) ? '/admin' : '/mon-compte';
  const isCurrent = (search: object) => location.pathname === '/catalogue' && JSON.stringify(location.search) === JSON.stringify(search);

  function submit(e: FormEvent) {
    e.preventDefault();
    const value = q.trim();
    void navigate({ to: '/catalogue', search: value ? { q: value } : {} });
  }

  return (
    <header className="header">
      <div className="header-main wrap">
        <Link to="/" className="brand" aria-label={m.brand_home_label()}>
          <BrandMark />
          <span>
            {m.brand_name()}
            <span className="brand-sub">{m.brand_tagline()}</span>
          </span>
        </Link>
        <form className="search" id="search-form" role="search" onSubmit={submit}>
          <label className="sr-only" htmlFor="search">
            {m.search_label()}
          </label>
          <Icon name="search" />
          <input id="search" name="q" placeholder={m.search_placeholder()} autoComplete="off" value={q} onChange={(e) => setQ(e.target.value)} />
          <button aria-label={m.search_submit()} type="submit">
            <Icon name="arrow" />
          </button>
        </form>
        <div className="header-actions">
          <Link to={accountHref} className="icon-button" aria-label={m.account_label()}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="7" r="4" />
              <path d="M4 21v-2a8 8 0 0 1 16 0v2" />
            </svg>
            <span className="desktop-label">{m.account_label()}</span>
          </Link>
          <Link to="/favoris" className="icon-button" aria-label={m.wishes_label()}>
            <Icon name="heart" />
            <span className="desktop-label">{m.wishes_short()}</span>
            <span id="wish-count" className="count" hidden={!wishes.length}>
              {wishes.length}
            </span>
          </Link>
          <button
            type="button"
            className="icon-button cart-toggle"
            aria-label={m.cart_open()}
            onClick={() => {
              cartOpen.set(true);
              trackEvent('cart.open', { items: countItems(lines) });
            }}
          >
            <Icon name="bag" />
            <span className="desktop-label">{m.cart_short()}</span>
            <span id="cart-count" className="count">
              {countItems(lines)}
            </span>
          </button>
          <button type="button" className="icon-button menu-toggle" aria-label={m.menu_open()} aria-expanded={menuOpen} onClick={() => setMenuOpen((o) => !o)}>
            <Icon name="menu" />
          </button>
        </div>
      </div>
      <nav className={`nav wrap${menuOpen ? ' open' : ''}`} aria-label={m.nav_label()}>
        <div>
          {NAV_MAIN.map((item) => (
            <Link key={item.label()} to="/catalogue" search={item.search} activeOptions={{ includeSearch: true }} aria-current={isCurrent(item.search) ? 'page' : undefined}>
              {item.label()}
            </Link>
          ))}
        </div>
        <div>
          <Link to="/editeurs" aria-current={location.pathname === '/editeurs' ? 'page' : undefined}>
            {m.nav_publishers()}
          </Link>
          <Link to="/maison" aria-current={location.pathname === '/maison' ? 'page' : undefined}>
            {m.nav_about()} <Icon name="arrow" />
          </Link>
        </div>
      </nav>
    </header>
  );
}

function Newsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  async function submit(e: FormEvent) {
    e.preventDefault();
    try {
      await subscribeNewsletter({ data: { email, source: 'footer' } });
      setStatus(m.newsletter_done());
      setEmail('');
      trackEvent('newsletter.subscribe', { source: 'footer' });
    } catch {
      setStatus(m.newsletter_failed());
    }
  }
  return (
    <div className="newsletter wrap">
      <div>
        <h2>
          {m.newsletter_title_1()}
          <br />
          {m.newsletter_title_2()}
        </h2>
        <p>{m.newsletter_body()}</p>
      </div>
      <form id="newsletter-form" onSubmit={submit}>
        <label htmlFor="newsletter-email">{m.newsletter_label()}</label>
        <div className="newsletter-input">
          <input type="email" id="newsletter-email" placeholder={m.email_placeholder()} required value={email} onChange={(e) => setEmail(e.target.value)} />
          <button type="submit" aria-label={m.newsletter_submit()}>
            <Icon name="arrow" />
          </button>
        </div>
        <small>{m.newsletter_note()}</small>
        <p id="newsletter-status" role="status">
          {status}
        </p>
      </form>
    </div>
  );
}

function Footer() {
  const rateLabel = useRateLabel();
  const { shop } = useShop();
  return (
    <footer>
      <div className="currency-note wrap">
        <p id="currency-note-text">{rateLabel}</p>
        <a href="https://frankfurter.dev/" target="_blank" rel="noopener noreferrer">
          {m.rates_source()} <span aria-hidden="true">↗</span>
        </a>
      </div>
      <Newsletter />
      <div className="footer-main wrap">
        <Link to="/" className="brand footer-brand">
          <span>
            {m.brand_name()}
            <span className="brand-sub">{m.brand_footer_tagline()}</span>
          </span>
        </Link>
        <div>
          <h3>{m.footer_shop()}</h3>
          <Link to="/catalogue">{m.nav_all()}</Link>
          <Link to="/editeurs">{m.footer_publishers()}</Link>
          <Link to="/maison">{m.footer_story()}</Link>
        </div>
        <div>
          <h3>{m.footer_help()}</h3>
          <Link to="/aide">{m.footer_faq()}</Link>
          <Link to="/aide" hash="livraison">
            {m.footer_delivery()}
          </Link>
          <Link to="/contact">{m.footer_contact()}</Link>
        </div>
        <div className="footer-note">
          <p>
            {m.footer_note_1()}
            <br />
            {m.footer_note_2()}
          </p>
          <Link to="/catalogue">
            {m.footer_find()} <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
      <div className="footer-bottom wrap">
        <span>{DEMO_MODE ? m.footer_copyright_demo() : m.footer_copyright({ city: shop.city })}</span>
        <span>{DEMO_MODE ? m.footer_fictive() : shop.email}</span>
        <Link to="/admin">{m.footer_admin()} ↗</Link>
        <button
          type="button"
          className="text-button"
          onClick={() =>
            openInfo(
              m.legal_title(),
              <>
                <p>{m.legal_p1()}</p>
                <p>{DEMO_MODE ? m.legal_p2_demo() : m.legal_p2()}</p>
                <p>{m.legal_p3()}</p>
              </>,
            )
          }
        >
          {m.footer_info()}
        </button>
      </div>
    </footer>
  );
}

export function ShopLayout({ children }: { children: ReactNode }) {
  useEffect(() => loadCart(), []);
  const location = useLocation();
  useEffect(() => {
    if (location.hash) document.getElementById(location.hash)?.scrollIntoView();
    else window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname, location.hash]);
  useStore(cartOpen, false);

  return (
    <>
      <a
        className="skip-link"
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById('main')?.focus();
        }}
      >
        {m.skip_link()}
      </a>
      <div className="announcement">
        <span>{DEMO_MODE ? m.announcement_demo() : m.announcement()}</span>
        <CountryPicker />
      </div>
      <Header />
      <main id="main" tabIndex={-1} key={location.pathname} className="route-enter">
        {children}
      </main>
      <Footer />
      <CartDrawer />
      <DiscoveryDialog />
      <InfoDialog />
      <Toast id="toast" />
      <IconSprite />
    </>
  );
}
