/** Who may open which part of the bookshop's management. */
export type Role = 'customer' | 'owner' | 'catalog' | 'delivery';

export type Area =
  | 'overview'
  | 'orders'
  | 'catalog'
  | 'stocks'
  | 'customers'
  | 'publishers'
  | 'deliveries'
  | 'payments'
  | 'content'
  | 'settings';

const ACCESS: Record<Exclude<Role, 'customer'>, readonly Area[]> = {
  owner: ['overview', 'orders', 'catalog', 'stocks', 'customers', 'publishers', 'deliveries', 'payments', 'content', 'settings'],
  catalog: ['overview', 'catalog', 'stocks', 'publishers', 'content'],
  delivery: ['overview', 'orders', 'deliveries'],
};

export const STAFF_ROLES = ['owner', 'catalog', 'delivery'] as const;

export function isStaff(role: string | null | undefined): role is Exclude<Role, 'customer'> {
  return (STAFF_ROLES as readonly string[]).includes(role ?? '');
}

export function can(role: string | null | undefined, area: Area): boolean {
  return isStaff(role) && ACCESS[role].includes(area);
}
