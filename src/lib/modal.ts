import { useEffect, useRef } from 'react';

/**
 * Drives a native <dialog> from React state: opens it as a modal, closes it on Escape or a click
 * on the backdrop, and keeps the page from scrolling behind it (as the mockup does).
 */
export function useDialog(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDialogElement>(null);
  const close = useRef(onClose);
  close.current = onClose;

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
    document.body.style.overflow = document.querySelector('dialog[open]') ? 'hidden' : '';
  }, [open]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const onDialogClose = () => {
      document.body.style.overflow = document.querySelector('dialog[open]') ? 'hidden' : '';
      close.current();
    };
    const onClick = (e: MouseEvent) => {
      if (e.target !== dialog) return;
      const r = dialog.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close();
    };
    dialog.addEventListener('close', onDialogClose);
    dialog.addEventListener('click', onClick);
    return () => {
      dialog.removeEventListener('close', onDialogClose);
      dialog.removeEventListener('click', onClick);
    };
  }, []);

  return ref;
}
