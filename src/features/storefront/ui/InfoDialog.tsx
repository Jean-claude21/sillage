import type { ReactNode } from 'react';
import { Icon } from '@/lib/icons';
import { useDialog } from '@/lib/modal';
import { createStore, useStore } from '@/lib/store';
import * as m from '@/paraglide/messages.js';

const info = createStore<{ title: string; body: ReactNode } | null>(null);

export function openInfo(title: string, body: ReactNode): void {
  info.set({ title, body });
}

export function closeInfo(): void {
  info.set(null);
}

/** The mockup's information modal: a title and a few paragraphs. */
export function InfoDialog() {
  const value = useStore(info, null);
  const ref = useDialog(Boolean(value), () => info.set(null));
  return (
    <dialog id="info-dialog" className="modal" aria-labelledby="info-title" ref={ref}>
      <button type="button" className="icon-button modal-close" aria-label={m.close()} onClick={closeInfo}>
        <Icon name="close" />
      </button>
      <div id="info-content">
        {value && (
          <>
            <h2 id="info-title">{value.title}</h2>
            {value.body}
          </>
        )}
      </div>
    </dialog>
  );
}
