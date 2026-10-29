/** Lower case, without accents: "Économie" and "economie" match. */
export function fold(value: string): string {
  return value.toLocaleLowerCase('fr').normalize('NFD').replace(/[̀-ͯ]/g, '');
}

/** "Afi Mensah" → "AM". */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

/** A readable identifier from a title: "La maison des marées" → "la-maison-des-marees". */
export function slugify(value: string): string {
  return fold(value)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/** Whole F CFA amounts, as the workspace shows them. */
export function formatXof(amount: number): string {
  return `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(amount)} F CFA`;
}

export function formatNumber(amount: number): string {
  return new Intl.NumberFormat('fr-FR').format(amount);
}

export function formatDate(value: Date | string): string {
  const d = typeof value === 'string' ? new Date(value) : value;
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Africa/Lome' }).format(d);
}

export function formatTime(value: Date | string): string {
  const d = typeof value === 'string' ? new Date(value) : value;
  return new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Lome' }).format(d);
}
