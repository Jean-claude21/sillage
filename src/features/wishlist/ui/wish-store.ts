import { createStore, readLocal, useStore, writeLocal } from '@/lib/store';
import { trackEvent } from '@/features/analytics/track';
import { mergeWishes, saveWish } from '../functions';

// A visitor's wishes live on the device (the mockup's key); a reader's live in their account.
const KEY = 'sillage-wish-v2';

export const wishList = createStore<string[]>([]);
let signedIn = false;
let started = false;

/** Called by the shop layout once it knows who is there. */
export function startWishes(serverIds: string[] | null): void {
  if (typeof window === 'undefined') return;
  const local = readLocal<unknown>(KEY, []);
  const localIds = Array.isArray(local) ? local.filter((x): x is string => typeof x === 'string') : [];
  signedIn = serverIds !== null;
  if (signedIn) {
    const missing = localIds.filter((id) => !serverIds!.includes(id));
    wishList.set([...serverIds!, ...missing]);
    if (missing.length) void mergeWishes({ data: { bookIds: missing } }).then(() => writeLocal(KEY, []));
    else if (localIds.length) writeLocal(KEY, []);
  } else if (!started || wishList.get().length === 0) {
    wishList.set(localIds);
  }
  started = true;
}

export function toggleWish(id: string): boolean {
  const wished = !wishList.get().includes(id);
  const next = wished ? [...wishList.get(), id] : wishList.get().filter((x) => x !== id);
  wishList.set(next);
  if (signedIn) void saveWish({ data: { bookId: id, wished } });
  else writeLocal(KEY, next);
  trackEvent(wished ? 'wishlist.add' : 'wishlist.remove', { book: id });
  return wished;
}

export function useWishes(): string[] {
  return useStore(wishList, []);
}
