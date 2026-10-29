import { Link, useRouter } from '@tanstack/react-router';
import type { FormEvent } from 'react';
import { WIcon } from '@/lib/icons';
import { toast } from '@/lib/toast';
import * as m from '@/paraglide/messages.js';
import { Btn, closeSheet, ContentHead, openSheet } from '@/features/workspace/ui/parts';
import { savePublisher } from '../../admin-functions';
import type { Book, Publisher } from '../../domain/book';

export function PublishersAdmin({ publishers, books }: { publishers: Publisher[]; books: Book[] }) {
  const router = useRouter();

  function form(p?: Publisher) {
    async function submit(e: FormEvent<HTMLFormElement>) {
      e.preventDefault();
      const data = new FormData(e.currentTarget);
      const result = await savePublisher({
        data: { id: p?.id, name: String(data.get('name') ?? ''), email: String(data.get('email') ?? ''), blurb: String(data.get('blurb') ?? '') },
      });
      if (!result.ok) {
        toast(m.ws_publisher_duplicate());
        return;
      }
      closeSheet();
      toast(m.ws_publisher_saved());
      await router.invalidate();
    }
    openSheet(
      p ? m.ws_publisher_edit() : m.ws_publisher_new(),
      m.ws_publisher_sheet_intro(),
      <form className="sheet-form" onSubmit={(e) => void submit(e)}>
        <label className="field">
          {m.ws_publisher_name()}
          <input name="name" defaultValue={p?.name} required maxLength={150} />
        </label>
        <label className="field">
          {m.ws_contact_email()}
          <input name="email" type="email" defaultValue={p?.email} placeholder="partenaire@example.com" required maxLength={150} />
        </label>
        <label className="field">
          {m.ws_publisher_blurb()}
          <textarea name="blurb" defaultValue={p?.blurb} maxLength={400} />
        </label>
        <div className="inline-notice">
          <WIcon name="layers" />
          {m.ws_publisher_notice()}
        </div>
        <button className="btn" type="submit">
          <WIcon name="check" />
          {m.ws_publisher_submit()}
        </button>
      </form>,
    );
  }

  return (
    <>
      <ContentHead
        title={m.ws_publishers_title()}
        description={m.ws_publishers_intro()}
        actions={
          <Btn icon="plus" onClick={() => form()}>
            {m.ws_publisher_add()}
          </Btn>
        }
      />
      <div className="publisher-grid">
        {publishers.map((p) => {
          const list = books.filter((b) => b.publisherId === p.id);
          return (
            <article className="panel publisher-card" key={p.id}>
              <div className="publisher-logo">{p.logoText.replace(/\n/g, ' ')}</div>
              <div className="panel-body">
                <h2>{p.name}</h2>
                <p>{p.email}</p>
                <div className="publisher-facts">
                  <div>
                    <strong>{list.length}</strong>
                    <small>{m.ws_refs()}</small>
                  </div>
                  <div>
                    <strong>{list.reduce((s, b) => s + b.stock, 0)}</strong>
                    <small>{m.ws_copies_label()}</small>
                  </div>
                </div>
                <Link className="btn secondary small" to="/admin/catalogue" search={{ editeur: p.id }}>
                  {m.ws_see_catalog()} <WIcon name="arrow" />
                </Link>
                <button type="button" className="text-btn" style={{ display: 'block', marginTop: 16 }} onClick={() => form(p)}>
                  {m.ws_publisher_edit_link()}
                </button>
              </div>
            </article>
          );
        })}
      </div>
      <div className="inline-notice section-gap">
        <WIcon name="info" />
        {m.ws_publishers_notice()}
      </div>
    </>
  );
}
