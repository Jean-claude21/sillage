// The shop's icons: one hidden sprite, drawn once by the layout, used by name (as in the mockup).

export type ShopIconName = 'search' | 'arrow' | 'heart' | 'bag' | 'close' | 'menu' | 'book' | 'check' | 'truck' | 'leaf';

export function Icon({ name }: { name: ShopIconName }) {
  return (
    <svg aria-hidden="true">
      <use href={`#i-${name}`} />
    </svg>
  );
}

export function IconSprite() {
  return (
    <svg className="svg-library" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <symbol id="i-search" viewBox="0 0 24 24">
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 5 5" />
      </symbol>
      <symbol id="i-arrow" viewBox="0 0 24 24">
        <path d="M4 12h16m-6-6 6 6-6 6" />
      </symbol>
      <symbol id="i-heart" viewBox="0 0 24 24">
        <path d="M20 5c-2.2-2-5.8-1.5-8 1-2.2-2.5-5.8-3-8-1-3 3-1 6 1 8l7 7 7-7c2-2 4-5 1-8Z" />
      </symbol>
      <symbol id="i-bag" viewBox="0 0 24 24">
        <path d="M4 7h16l1 14H3L4 7Z" />
        <path d="M8 8V6a4 4 0 0 1 8 0v2" />
      </symbol>
      <symbol id="i-close" viewBox="0 0 24 24">
        <path d="m5 5 14 14M19 5 5 19" />
      </symbol>
      <symbol id="i-menu" viewBox="0 0 24 24">
        <path d="M3 6h18M3 12h18M3 18h18" />
      </symbol>
      <symbol id="i-book" viewBox="0 0 24 24">
        <path d="M12 5c-3-2-6-2-10-1v15c4-1 7-1 10 1 3-2 6-2 10-1V4c-4-1-7-1-10 1Zm0 0v15" />
      </symbol>
      <symbol id="i-check" viewBox="0 0 24 24">
        <path d="m4 12 5 5L20 6" />
      </symbol>
      <symbol id="i-truck" viewBox="0 0 24 24">
        <path d="M2 5h12v12H2zM14 9h4l4 5v3h-8" />
        <circle cx="6" cy="18" r="2" />
        <circle cx="18" cy="18" r="2" />
      </symbol>
      <symbol id="i-leaf" viewBox="0 0 24 24">
        <path d="M20 3C8 2 2 8 5 15s17 6 15-12ZM4 21 16 9" />
      </symbol>
    </svg>
  );
}

// The workspaces' icons: inline paths, as in the mockup's workspace.js.
const paths = {
  grid: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
  bag: 'M4 7h16l1 14H3L4 7Zm4 0V6a4 4 0 0 1 8 0v1',
  book: 'M12 5C8 3 5 3 2 4v15c4-1 7-1 10 1 3-2 6-2 10-1V4c-3-1-6-1-10 1Zm0 0v15',
  box: 'm3 7 9-5 9 5v10l-9 5-9-5V7Zm0 0 9 5 9-5M12 12v10M7 4l10 6',
  users: 'M16 21v-2a6 6 0 0 0-12 0v2M20 21v-2a5 5 0 0 0-3-4M10 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM17 3a4 4 0 0 1 0 8',
  truck: 'M2 5h12v12H2zM14 9h4l4 5v3h-8M6 16a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM18 16a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z',
  wallet: 'M3 6V4h16v4M3 8h18v13H3V8Zm12 4h6v5h-6v-5Zm2 2h1',
  layers: 'm2 7 10-5 10 5-10 5L2 7Zm0 5 10 5 10-5M2 17l10 5 10-5',
  settings: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM9 2h6l1 4 4 1 2 5-3 3 1 4-5 3-3-2-4 2-5-3 1-4-3-3 2-5 4-1 2-4Z',
  heart: 'M20 5c-2.2-2-5.8-1.5-8 1-2.2-2.5-5.8-3-8-1-3 3-1 6 1 8l7 7 7-7c2-2 4-5 1-8Z',
  pin: 'M12 22s8-7 8-14a8 8 0 0 0-16 0c0 7 8 14 8 14Zm0-17a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z',
  user: 'M4 21v-2a8 8 0 0 1 16 0v2M12 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z',
  life: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 6a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM5 5l4 4m6 6 4 4M19 5l-4 4m-6 6-4 4',
  arrow: 'M4 12h16m-6-6 6 6-6 6',
  left: 'M20 12H4m6-6-6 6 6 6',
  chev: 'm9 5 7 7-7 7',
  down: 'm6 9 6 6 6-6',
  menu: 'M3 6h18M3 12h18M3 18h18',
  close: 'm6 6 12 12M18 6 6 18',
  search: 'M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm5 12 6 6',
  bell: 'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM9 21h6',
  external: 'M14 3h7v7m0-7L10 14M10 3H3v18h18v-7',
  plus: 'M12 4v16M4 12h16',
  download: 'M12 3v12m-5-5 5 5 5-5M3 16v5h18v-5',
  check: 'm4 12 5 5L20 6',
  clock: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 4v6l4 2',
  info: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 8v7m0-11v1',
  edit: 'm15 3 6 6-12 12H3v-6L15 3Zm-2 2 6 6',
  calendar: 'M3 5h18v17H3V5ZM7 2v6m10-6v6M3 11h18',
  mail: 'M3 5h18v14H3V5Zm0 0 9 8 9-8',
  trash: 'M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7',
  file: 'M14 2H4v20h16V8l-6-6Zm0 0v6h6M8 13h8M8 17h6',
  refresh: 'M20 8a8 8 0 0 0-14-3L3 8m0-5v5h5M4 16a8 8 0 0 0 14 3l3-3m0 5v-5h-5',
  store: 'M3 9h18l-2-6H5L3 9Zm0 0v3c2 2 4 2 6 0 2 2 4 2 6 0 2 2 4 2 6 0V9M5 14v8h14v-8M10 22v-6h4v6',
  logout: 'M15 3h6v18h-6M10 17l5-5-5-5M15 12H3',
} as const;

export type WorkspaceIconName = keyof typeof paths;

export function WIcon({ name }: { name: WorkspaceIconName }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d={paths[name]} />
    </svg>
  );
}
