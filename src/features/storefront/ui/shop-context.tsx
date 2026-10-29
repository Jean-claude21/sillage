import { createContext, useContext, type ReactNode } from 'react';
import type { ShopData } from '@/features/catalog/functions';
import type { Viewer } from '@/features/auth/session.server';

export interface ShopContextValue extends ShopData {
  viewer: Viewer | null;
}

const ShopContext = createContext<ShopContextValue | null>(null);

export function ShopProvider({ value, children }: { value: ShopContextValue; children: ReactNode }) {
  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

/** The published books, the publishers and the public settings, read once by the shop layout. */
export function useShop(): ShopContextValue {
  const value = useContext(ShopContext);
  if (!value) throw new Error('useShop outside the shop layout');
  return value;
}

/** True while the catalogue is the mockup's fictive one: the demo notes stay visible. */
export const DEMO_MODE = (import.meta.env.VITE_DEMO_MODE as string | undefined) !== '0';
