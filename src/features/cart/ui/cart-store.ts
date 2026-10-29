import { createStore, readLocal, useStore, writeLocal } from '@/lib/store';
import { addLine, changeQty, sanitizeCart, type CartLine } from '../domain/cart';

// The mockup's key: a basket made on the validated prototype is still there.
const KEY = 'sillage-cart-v2';

export const cart = createStore<CartLine[]>([]);
let loaded = false;

export function loadCart(): void {
  if (loaded || typeof window === 'undefined') return;
  loaded = true;
  cart.set(sanitizeCart(readLocal(KEY, [])));
  window.addEventListener('storage', (e) => {
    if (e.key === KEY) cart.set(sanitizeCart(readLocal(KEY, [])));
  });
}

function save(lines: CartLine[]): void {
  cart.set(lines);
  writeLocal(KEY, lines);
}

export function addToCart(id: string, qty = 1): boolean {
  loadCart();
  const result = addLine(cart.get(), id, qty);
  if (!result.ok) return false;
  save(result.lines);
  return true;
}

export function updateQty(id: string, delta: number): void {
  save(changeQty(cart.get(), id, delta));
}

export function removeFromCart(id: string): void {
  save(cart.get().filter((l) => l.id !== id));
}

export function clearCart(): void {
  save([]);
}

export function useCart(): CartLine[] {
  return useStore(cart, []);
}

/** The cart drawer is opened from the header and from the checkout links. */
export const cartOpen = createStore(false);
