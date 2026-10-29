import type { ReactNode } from 'react';
import { WIcon, type WorkspaceIconName } from '@/lib/icons';
import { useDialog } from '@/lib/modal';
import { createStore, useStore } from '@/lib/store';
import * as m from '@/paraglide/messages.js';
import { deliveryBadge, paymentBadge } from '@/features/orders/domain/order';

// The workspaces' building blocks, one per pattern of the mockup's workspace.js.

export function ContentHead({ title, description, actions }: { title: ReactNode; description: ReactNode; actions?: ReactNode }) {
  return (
    <div className="page-heading">
      <div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {actions ? <div className="actions">{actions}</div> : null}
    </div>
  );
}

export function Panel({ title, sub, link, children }: { title: ReactNode; sub?: ReactNode; link?: ReactNode; children: ReactNode }) {
  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <h2>{title}</h2>
          {sub ? <p>{sub}</p> : null}
        </div>
        {link}
      </div>
      <div className="panel-body">{children}</div>
    </section>
  );
}

export function Empty({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="empty">
      <WIcon name="book" />
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}

export function DeliveryBadge({ status }: { status: string }) {
  const [label, tone] = deliveryBadge(status);
  return <span className={`status ${tone}`}>{label}</span>;
}

export function PaymentBadge({ status }: { status: string }) {
  const [label, tone] = paymentBadge(status);
  return <span className={`status ${tone}`}>{label}</span>;
}

export function Btn({
  children,
  kind = '',
  icon,
  ...props
}: { kind?: string; icon?: WorkspaceIconName } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" className={`btn ${kind}`} {...props}>
      {icon ? <WIcon name={icon} /> : null}
      {children}
    </button>
  );
}

export function SearchInput({ value, onChange, placeholder, id = 'view-search' }: { value: string; onChange: (v: string) => void; placeholder: string; id?: string }) {
  return (
    <div className="filter-search">
      <WIcon name="search" />
      <label className="sr-only" htmlFor={id}>
        {placeholder}
      </label>
      <input id={id} placeholder={placeholder} value={value} autoComplete="off" onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

export function SelectFilter({
  id,
  label,
  value,
  choices,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  choices: [string, string][];
  onChange: (v: string) => void;
}) {
  return (
    <>
      <label className="sr-only" htmlFor={`filter-${id}`}>
        {label}
      </label>
      <select className="filter-select" id={`filter-${id}`} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">{label}</option>
        {choices.map(([v, t]) => (
          <option key={v} value={v}>
            {t}
          </option>
        ))}
      </select>
    </>
  );
}

// The side sheet: forms and confirmations open there, as in the mockup.
const sheet = createStore<{ title: string; description: string; body: ReactNode } | null>(null);

export function openSheet(title: string, description: string, body: ReactNode): void {
  sheet.set({ title, description, body });
}

export function closeSheet(): void {
  sheet.set(null);
}

export function Sheet() {
  const value = useStore(sheet, null);
  const ref = useDialog(Boolean(value), () => sheet.set(null));
  return (
    <dialog id="sheet" aria-labelledby="sheet-title" ref={ref}>
      <div className="sheet-head">
        <div>
          <h2 id="sheet-title">{value?.title}</h2>
          <p id="sheet-description">{value?.description}</p>
        </div>
        <button type="button" className="icon-btn" aria-label={m.ws_close_sheet()} onClick={closeSheet}>
          <WIcon name="close" />
        </button>
      </div>
      <div id="sheet-body">{value?.body}</div>
    </dialog>
  );
}

/** Triggers a download of text built in the browser (exports, receipts). */
export function download(name: string, content: string, type: string): void {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
