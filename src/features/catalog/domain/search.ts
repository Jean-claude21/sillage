import type { CatalogQuery, CatalogSort } from './book';

const SORTS: readonly CatalogSort[] = ['selection', 'prix-asc', 'prix-desc', 'titre'];

/** Reads the catalogue's address (?q=…&theme=…): unknown values are dropped, never trusted. */
export function catalogSearch(search: Record<string, unknown>): CatalogQuery {
  const text = (key: string) => {
    const value = search[key];
    return typeof value === 'string' && value.trim() ? value.trim().slice(0, 120) : undefined;
  };
  const selection = text('selection');
  const tri = text('tri');
  return {
    q: text('q'),
    theme: text('theme'),
    editeur: text('editeur'),
    selection: selection === 'nouveautes' || selection === 'selection' ? selection : undefined,
    type: text('type') === 'pack' ? 'pack' : undefined,
    tri: tri && (SORTS as readonly string[]).includes(tri) && tri !== 'selection' ? (tri as CatalogSort) : undefined,
  };
}
