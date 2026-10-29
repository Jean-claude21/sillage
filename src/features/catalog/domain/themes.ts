import * as m from '@/paraglide/messages.js';

/** The five reading universes of the shop, in the order the mockup shows them. */
export const THEME_IDS = ['litterature', 'jeunesse', 'savoirs', 'pratique', 'inspiration'] as const;
export type ThemeId = (typeof THEME_IDS)[number];

export function isTheme(value: string): value is ThemeId {
  return (THEME_IDS as readonly string[]).includes(value);
}

export function themeLabel(id: string): string {
  switch (id) {
    case 'litterature':
      return m.theme_litterature();
    case 'jeunesse':
      return m.theme_jeunesse();
    case 'savoirs':
      return m.theme_savoirs();
    case 'pratique':
      return m.theme_pratique();
    case 'inspiration':
      return m.theme_inspiration();
    default:
      return id;
  }
}
