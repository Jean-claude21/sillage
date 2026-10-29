import { Link, useLocation } from '@tanstack/react-router';
import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { WIcon, type WorkspaceIconName } from '@/lib/icons';
import { initials } from '@/lib/text';
import { Toast } from '@/lib/toast';
import * as m from '@/paraglide/messages.js';
import { authClient } from '@/features/auth/client';
import { can, type Area } from '@/features/auth/domain/roles';
import { DEMO_MODE } from '@/features/storefront/ui/shop-context';
import { openSheet, Sheet, closeSheet } from './parts';

export interface NavItem {
  to: string;
  icon: WorkspaceIconName;
  label: string;
  count?: number;
  area?: Area;
  exact?: boolean;
}

export interface Notice {
  to: string;
  title: string;
  body: string;
}

interface Props {
  space: 'admin' | 'client';
  viewer: { name: string; role: string };
  nav: NavItem[];
  secondary?: NavItem[];
  notices: Notice[];
  onSearch?: (q: string) => void;
  children: ReactNode;
}

/** The mockup's workspace: side rail, utility bar, demo banner, content, footer. */
export function WorkspaceShell({ space, viewer, nav, secondary = [], notices, onSearch, children }: Props) {
  const admin = space === 'admin';
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const all = [...nav, ...secondary].filter((n) => !n.area || can(viewer.role, n.area));
  const active = all
    .filter((n) => (n.exact ? location.pathname === n.to : location.pathname === n.to || location.pathname.startsWith(`${n.to}/`)))
    .sort((a, b) => b.to.length - a.to.length)[0];
  const profile = admin ? m.ws_team_name() : viewer.name;
  const avatar = admin ? 'S' : initials(viewer.name);

  useEffect(() => {
    setOpen(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
    closeSheet();
  }, [location.pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  function search(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onSearch?.(String(new FormData(e.currentTarget).get('q') ?? '').trim());
  }

  async function signOut() {
    await authClient.signOut();
    window.location.assign('/');
  }

  function showNotices() {
    openSheet(
      m.ws_notices_title(),
      m.ws_notices_intro(),
      notices.length ? (
        notices.map((n) => (
          <Link key={n.to + n.title} className="notification-item" to={n.to} onClick={closeSheet}>
            <strong>{n.title}</strong>
            <p>{n.body}</p>
          </Link>
        ))
      ) : (
        <p className="muted small">{m.ws_notices_empty()}</p>
      ),
    );
  }

  const link = (n: NavItem) => (
    // The router's own "active" class would also light the parents; the rail marks one item only.
    <Link key={n.to} to={n.to} className={active === n ? 'active' : ''} activeProps={{ className: '' }} aria-current={active === n ? 'page' : undefined}>
      <WIcon name={n.icon} />
      <span>{n.label}</span>
      {n.count ? <span className="nav-count">{n.count}</span> : null}
    </Link>
  );

  return (
    <div data-space={space}>
      <a
        className="skip-link"
        href="#content"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById('content')?.focus();
        }}
      >
        {m.skip_link()}
      </a>
      <div className="layout">
        <button type="button" className={`mobile-overlay${open ? ' visible' : ''}`} aria-label={m.ws_close_menu()} onClick={() => setOpen(false)} />
        <aside className={`sidebar${open ? ' open' : ''}`} id="sidebar">
          <Link to="/" className="brand" aria-label={m.ws_back_to_shop_label()}>
            <WIcon name="book" />
            <span className="brand-word">
              {m.brand_name()}
              <small>{admin ? m.ws_admin_tagline() : m.ws_client_tagline()}</small>
            </span>
          </Link>
          <p className="space-label">{admin ? m.ws_admin_label() : m.account_label()}</p>
          <nav className="side-nav" aria-label={admin ? m.ws_admin_nav() : m.ws_client_nav()}>
            {all.filter((n) => nav.includes(n)).map(link)}
            {secondary.length ? <hr className="nav-separator" /> : null}
            {all.filter((n) => secondary.includes(n)).map(link)}
          </nav>
          <div className="side-bottom">
            <Link className="return-link" to="/">
              <WIcon name="store" />
              {m.ws_back_to_shop()} <WIcon name="external" />
            </Link>
            <button type="button" className="return-link" onClick={() => void signOut()} style={{ background: 'none', border: 0, width: '100%', textAlign: 'left' }}>
              <WIcon name="logout" />
              {m.ws_sign_out()}
            </button>
            <div className="workspace-team">
              <span className={`avatar ${admin ? '' : 'peach'}`}>{avatar}</span>
              <div>
                <strong>{profile}</strong>
                <small>{admin ? m.ws_role_label({ role: roleLabel(viewer.role) }) : m.ws_reader_label()}</small>
              </div>
            </div>
          </div>
        </aside>
        <div className="main-area">
          <header className="topbar">
            <button type="button" className="icon-btn mobile-menu" aria-label={m.menu_open()} aria-controls="sidebar" aria-expanded={open} onClick={() => setOpen(true)}>
              <WIcon name="menu" />
            </button>
            <div className="breadcrumbs">
              <span>{admin ? m.ws_admin_crumb() : m.account_label()}</span>
              <WIcon name="chev" />
              <span>{active?.label ?? m.ws_detail()}</span>
            </div>
            {admin && onSearch ? (
              <form className="top-search" onSubmit={search}>
                <WIcon name="search" />
                <label className="sr-only" htmlFor="global-search">
                  {m.ws_global_search_label()}
                </label>
                <input id="global-search" name="q" placeholder={m.ws_global_search_placeholder()} />
                <button type="submit" aria-label={m.search_submit()}>
                  <WIcon name="arrow" />
                </button>
              </form>
            ) : null}
            <div className="top-tools">
              <button type="button" className="icon-btn" aria-label={m.ws_notices_label()} onClick={showNotices}>
                <WIcon name="bell" />
                {notices.length ? <span className="notification-dot" /> : null}
              </button>
              <details className="profile-menu">
                <summary className="profile-button" aria-label={m.ws_profile_menu()}>
                  <span className={`avatar ${admin ? '' : 'peach'}`}>{avatar}</span>
                  <span className="profile-name">{profile}</span>
                  <WIcon name="down" />
                </summary>
                <div className="popover">
                  <p>{viewer.name}</p>
                  {admin ? <Link to="/mon-compte">{m.ws_my_reader_space()}</Link> : null}
                  {!admin && can(viewer.role, 'overview') ? <Link to="/admin">{m.ws_admin_label()}</Link> : null}
                  <Link to="/">{m.ws_visit_shop()}</Link>
                  <button type="button" onClick={() => void signOut()}>
                    {m.ws_sign_out()}
                  </button>
                </div>
              </details>
            </div>
          </header>
          {DEMO_MODE ? (
            <div className="demo-banner">
              <span>
                <WIcon name="info" />
                {m.ws_demo_banner()}
              </span>
            </div>
          ) : null}
          <main id="content" className="content" tabIndex={-1}>
            {children}
          </main>
          <footer className="workspace-footer">
            <span>{admin ? m.ws_footer_admin() : m.ws_footer_client()}</span>
            <span>{m.ws_footer_amounts()}</span>
          </footer>
        </div>
      </div>
      <Sheet />
      <Toast />
    </div>
  );
}

export function roleLabel(role: string): string {
  switch (role) {
    case 'owner':
      return m.role_owner();
    case 'catalog':
      return m.role_catalog();
    case 'delivery':
      return m.role_delivery();
    default:
      return m.role_customer();
  }
}
