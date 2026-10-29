import { createStore, useStore } from './store';

const message = createStore<{ text: string; visible: boolean }>({ text: '', visible: false });
let timer: ReturnType<typeof setTimeout> | undefined;

/** A short confirmation at the bottom of the screen, read aloud by screen readers. */
export function toast(text: string, duration = 3300): void {
  message.set({ text, visible: true });
  clearTimeout(timer);
  timer = setTimeout(() => message.set((m) => ({ ...m, visible: false })), duration);
}

export function Toast({ id }: { id?: string }) {
  const { text, visible } = useStore(message, { text: '', visible: false });
  return (
    <div id={id} role="status" className={`toast${visible ? ' visible' : ''}`}>
      {text}
    </div>
  );
}
