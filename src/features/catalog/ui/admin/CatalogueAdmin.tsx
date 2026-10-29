import { Link, useNavigate, useRouter } from '@tanstack/react-router';
import { useRef, useState, type FormEvent } from 'react';
import { WIcon } from '@/lib/icons';
import { fold, formatXof } from '@/lib/text';
import { toast } from '@/lib/toast';
import * as m from '@/paraglide/messages.js';
import { ContentHead, Empty, Panel, SearchInput, SelectFilter } from '@/features/workspace/ui/parts';
import { saveBook, saveStock, uploadCover } from '../../admin-functions';
import { coverUrl, type Book, type Publisher } from '../../domain/book';
import { THEME_IDS, themeLabel } from '../../domain/themes';
import { prepareCover } from './prepare-cover';

function StockBadge({ book }: { book: Book }) {
  return (
    <span className={`status ${book.stock === 0 ? 'danger' : book.stock <= book.threshold ? 'warning' : ''}`}>
      {book.stock === 0 ? m.ws_out() : m.ws_available({ count: book.stock })}
    </span>
  );
}

/** The catalogue and the stocks: one table, two readings, as in the mockup. */
export function CatalogueView({ books, publishers, stocks = false, initialPublisher = '' }: { books: Book[]; publishers: Publisher[]; stocks?: boolean; initialPublisher?: string }) {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [publisher, setPublisher] = useState(initialPublisher);
  const [tab, setTab] = useState<'' | 'low'>('');
  const [draft, setDraft] = useState<Record<string, string>>({});
  const low = books.filter((b) => b.active && b.stock <= b.threshold);
  const list = books.filter(
    (b) =>
      (!q || fold(`${b.title} ${b.author} ${b.isbn}`).includes(fold(q))) &&
      (!category || b.theme === category) &&
      (!publisher || b.publisherId === publisher) &&
      (!stocks || tab !== 'low' || b.stock <= b.threshold),
  );
  const clear = () => {
    setQ('');
    setCategory('');
    setPublisher('');
  };

  async function save(b: Book) {
    const value = Number(draft[b.id] ?? b.stock);
    if (!Number.isInteger(value) || value < 0) {
      toast(m.ws_stock_invalid());
      return;
    }
    await saveStock({ data: { id: b.id, stock: value } });
    toast(m.ws_stock_saved());
    await router.invalidate();
  }

  return (
    <>
      <ContentHead
        title={stocks ? m.ws_stocks_title() : m.ws_catalog_title()}
        description={stocks ? m.ws_stocks_intro() : m.ws_catalog_intro()}
        actions={
          stocks ? (
            <Link to="/admin/catalogue" className="btn secondary">
              <WIcon name="book" />
              {m.ws_see_catalog()}
            </Link>
          ) : (
            <Link to="/admin/catalogue/$bookId" params={{ bookId: 'nouveau' }} className="btn">
              <WIcon name="plus" />
              {m.ws_add_book()}
            </Link>
          )
        }
      />
      <section className="panel">
        {stocks ? (
          <div className="tabs section-gap">
            <button type="button" className={tab !== 'low' ? 'active' : ''} onClick={() => setTab('')}>
              {m.ws_all_refs()}
            </button>
            <button type="button" className={tab === 'low' ? 'active' : ''} onClick={() => setTab('low')}>
              {m.ws_to_watch()} <span>{low.length}</span>
            </button>
          </div>
        ) : null}
        <div className="view-tools">
          <SearchInput value={q} onChange={setQ} placeholder={m.ws_catalog_search()} />
          <div className="actions">
            <SelectFilter id="category" label={m.ws_all_genres()} value={category} onChange={setCategory} choices={THEME_IDS.map((id) => [id, themeLabel(id)])} />
            {!stocks ? (
              <SelectFilter id="publisher" label={m.ws_all_publishers()} value={publisher} onChange={setPublisher} choices={publishers.map((p) => [p.id, p.name])} />
            ) : null}
          </div>
        </div>
        {list.length ? (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th scope="col">{m.ws_col_book()}</th>
                  <th scope="col">{stocks ? m.ws_col_stock_available() : m.ws_col_genre()}</th>
                  <th scope="col">{stocks ? m.ws_col_threshold() : m.ws_col_price()}</th>
                  <th scope="col">{stocks ? m.ws_col_situation() : m.ws_col_stock()}</th>
                  <th scope="col">{stocks ? '' : m.ws_col_visibility()}</th>
                  <th scope="col">
                    <span className="sr-only">{m.ws_col_action()}</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {list.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <Link className="table-book" to="/admin/catalogue/$bookId" params={{ bookId: b.id }}>
                        <img src={coverUrl(b.cover)} alt="" width="30" height="44" />
                        <div>
                          <strong>{b.title}</strong>
                          <span>
                            {b.author} · {b.publisherName}
                          </span>
                        </div>
                      </Link>
                    </td>
                    {stocks ? (
                      <>
                        <td>
                          <label className="sr-only" htmlFor={`stock-${b.id}`}>
                            {m.ws_stock_of({ title: b.title })}
                          </label>
                          <input
                            className="stock-input"
                            id={`stock-${b.id}`}
                            type="number"
                            min={0}
                            max={999999}
                            value={draft[b.id] ?? String(b.stock)}
                            onChange={(e) => setDraft((d) => ({ ...d, [b.id]: e.target.value }))}
                          />
                        </td>
                        <td>{m.ws_copies({ count: b.threshold })}</td>
                        <td>
                          <StockBadge book={b} />
                        </td>
                        <td>
                          <button type="button" className="btn secondary small" onClick={() => void save(b)}>
                            {m.ws_save()}
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>{themeLabel(b.theme)}</td>
                        <td className="price-nowrap">{formatXof(b.priceXof)}</td>
                        <td>
                          <StockBadge book={b} />
                        </td>
                        <td>
                          <span className={`status ${b.active ? '' : 'neutral'}`}>{b.active ? m.ws_published() : m.ws_draft()}</span>
                        </td>
                      </>
                    )}
                    <td>
                      <Link className="icon-btn" to="/admin/catalogue/$bookId" params={{ bookId: b.id }} aria-label={m.ws_edit_title({ title: b.title })}>
                        <WIcon name="edit" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty
            title={m.ws_catalog_empty_title()}
            description={m.ws_catalog_empty_body()}
            action={
              <button type="button" className="btn secondary" onClick={clear}>
                {m.filters_reset()}
              </button>
            }
          />
        )}
        <div className="table-footer">
          <span>{m.ws_refs_count({ count: list.length })}</span>
          <span>{stocks ? m.ws_threshold_hint() : m.ws_price_hint()}</span>
        </div>
      </section>
    </>
  );
}

export function BookEdit({ book, publishers, covers }: { book: Book | null; publishers: Publisher[]; covers: { cover: string; title: string }[] }) {
  const navigate = useNavigate();
  const isNew = !book;
  const [cover, setCover] = useState(book?.cover ?? covers[0]?.cover ?? '');
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  /** Reduces the chosen picture in the browser, stores it, and keeps its address for the form. */
  async function pick(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      const prepared = await prepareCover(file).catch(() => null);
      if (!prepared) {
        toast(m.ws_cover_invalid());
        return;
      }
      const result = await uploadCover({ data: { contentType: prepared.contentType, base64: prepared.base64 } });
      if (!result.ok) {
        toast(m.ws_cover_invalid());
        return;
      }
      setCover(result.url);
      setPreview(prepared.preview);
      toast(m.ws_cover_uploaded());
    } catch {
      toast(m.ws_cover_failed());
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = '';
    }
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const get = (k: string) => String(data.get(k) ?? '').trim();
    const num = (k: string) => Number(get(k));
    const values = { priceXof: num('price'), stock: num('stock'), threshold: num('threshold'), pages: num('pages') };
    if (Object.values(values).some((n) => !Number.isInteger(n) || n < 0)) {
      toast(m.ws_numbers_invalid());
      return;
    }
    setBusy(true);
    try {
      await saveBook({
        data: {
          id: book?.id,
          title: get('title'),
          subtitle: get('subtitle'),
          author: get('author'),
          publisherId: get('publisher'),
          theme: get('theme') as (typeof THEME_IDS)[number],
          kind: data.has('pack') ? 'pack' : 'book',
          isbn: get('isbn'),
          description: get('description'),
          excerpt: get('excerpt'),
          cover,
          active: data.has('active'),
          isNew: data.has('new'),
          inSelection: data.has('selection'),
          ...values,
        },
      });
      toast(m.ws_book_saved());
      void navigate({ to: '/admin/catalogue' });
    } catch {
      toast(m.ws_save_failed());
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Link to="/admin/catalogue" className="back-link">
        <WIcon name="left" />
        {m.back_to_catalog()}
      </Link>
      <ContentHead title={isNew ? m.ws_new_book_title() : book.title} description={isNew ? m.ws_new_book_intro() : m.ws_edit_book_intro()} />
      <form onSubmit={(e) => void submit(e)}>
        <div className="detail-grid">
          <div className="panel">
            <div className="form-section">
              <h2>{m.ws_book_info()}</h2>
              <div className="form-grid">
                <label className="field full">
                  {m.ws_field_title()}
                  <input name="title" defaultValue={book?.title} required maxLength={150} placeholder={m.ws_field_title_placeholder()} />
                </label>
                <label className="field full">
                  {m.ws_field_subtitle()}
                  <input name="subtitle" defaultValue={book?.subtitle} maxLength={200} />
                </label>
                <label className="field">
                  {m.ws_field_author()}
                  <input name="author" defaultValue={book?.author} required maxLength={120} />
                </label>
                <label className="field">
                  {m.ws_field_publisher()}
                  <select name="publisher" defaultValue={book?.publisherId ?? publishers[0]?.id}>
                    {publishers.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  {m.ws_col_genre()}
                  <select name="theme" defaultValue={book?.theme ?? 'litterature'}>
                    {THEME_IDS.map((id) => (
                      <option key={id} value={id}>
                        {themeLabel(id)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  {m.ws_field_isbn()}
                  <input name="isbn" defaultValue={book?.isbn} maxLength={40} placeholder="978-…" />
                </label>
                <label className="field full">
                  {m.ws_field_description()}
                  <textarea name="description" defaultValue={book?.description} required maxLength={3000} placeholder={m.ws_field_description_placeholder()} />
                </label>
                <label className="field full">
                  {m.ws_field_excerpt()}
                  <textarea name="excerpt" defaultValue={book?.excerpt} maxLength={1500} />
                </label>
              </div>
            </div>
            <div className="form-section">
              <h2>{m.ws_price_availability()}</h2>
              <div className="form-grid">
                <label className="field">
                  {m.ws_field_price()}
                  <input type="number" name="price" min={0} max={10000000} step={1} defaultValue={book?.priceXof ?? ''} required />
                  <small>{m.ws_field_price_hint()}</small>
                </label>
                <label className="field">
                  {m.ws_field_stock()}
                  <input type="number" name="stock" min={0} max={999999} step={1} defaultValue={book?.stock ?? 0} required />
                </label>
                <label className="field">
                  {m.ws_col_threshold()}
                  <input type="number" name="threshold" min={0} max={999999} step={1} defaultValue={book?.threshold ?? 4} required />
                </label>
                <label className="field">
                  {m.detail_pages()}
                  <input type="number" name="pages" min={1} max={99999} defaultValue={book?.pages || 200} required />
                </label>
              </div>
            </div>
            <div className="form-footer">
              <span className="small muted">{m.ws_book_footer()}</span>
              <Link to="/admin/catalogue" className="btn secondary">
                {m.ws_cancel()}
              </Link>
              <button className="btn" type="submit" disabled={busy || uploading}>
                <WIcon name="check" />
                {m.ws_save_book()}
              </button>
            </div>
          </div>
          <div className="panel-stack">
            <Panel title={m.ws_cover()} sub={m.ws_cover_sub()}>
              <div className="cover-preview">
                <img src={preview ?? coverUrl(cover)} alt={m.ws_cover_preview()} width="146" height="215" />
              </div>
              <input type="hidden" name="cover" value={cover} />
              <input ref={fileInput} id="cover-file" type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/heic" className="sr-only" onChange={(e) => void pick(e.target.files?.[0])} />
              <button type="button" className="btn secondary" style={{ width: '100%' }} disabled={uploading} onClick={() => fileInput.current?.click()}>
                <WIcon name="download" />
                {uploading ? m.ws_cover_uploading() : m.ws_cover_choose()}
              </button>
              <p className="progress-note">{m.ws_cover_note()}</p>
              <label className="field section-gap">
                {m.ws_cover_pick()}
                <select
                  value={covers.some((c) => c.cover === cover) ? cover : ''}
                  onChange={(e) => {
                    if (!e.target.value) return;
                    setCover(e.target.value);
                    setPreview(null);
                  }}
                >
                  <option value="">{m.ws_cover_own()}</option>
                  {covers.map((v) => (
                    <option key={v.cover} value={v.cover}>
                      {v.title}
                    </option>
                  ))}
                </select>
              </label>
            </Panel>
            <Panel title={m.ws_visibility()}>
              <label className="choice-row">
                <input name="active" type="checkbox" defaultChecked={book?.active ?? false} />
                {m.ws_visible_in_shop()}
              </label>
              <label className="choice-row">
                <input name="new" type="checkbox" defaultChecked={book?.isNew ?? false} />
                {m.ws_mark_new()}
              </label>
              <label className="choice-row">
                <input name="selection" type="checkbox" defaultChecked={book?.inSelection ?? false} />
                {m.ws_add_selection()}
              </label>
              <label className="choice-row">
                <input name="pack" type="checkbox" defaultChecked={book?.kind === 'pack'} />
                {m.ws_is_pack()}
              </label>
            </Panel>
          </div>
        </div>
      </form>
    </>
  );
}
