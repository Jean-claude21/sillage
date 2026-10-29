import { useSyncExternalStore } from 'react';

/** A tiny shared state for the browser, read by React without a provider. */
export interface Store<T> {
  get(): T;
  set(next: T | ((previous: T) => T)): void;
  subscribe(listener: () => void): () => void;
}

export function createStore<T>(initial: T): Store<T> {
  let value = initial;
  const listeners = new Set<() => void>();
  return {
    get: () => value,
    set(next) {
      value = typeof next === 'function' ? (next as (previous: T) => T)(value) : next;
      listeners.forEach((listener) => listener());
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

/** The server always draws the initial value; the device's value arrives after hydration. */
export function useStore<T>(store: Store<T>, initial: T): T {
  return useSyncExternalStore(store.subscribe, store.get, () => initial);
}

export function readLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : ((JSON.parse(raw) as T) ?? fallback);
  } catch {
    return fallback;
  }
}

export function writeLocal(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Private browsing or blocked storage: the page keeps working for this visit.
  }
}
