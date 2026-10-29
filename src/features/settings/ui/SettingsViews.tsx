import { Link, useRouter } from '@tanstack/react-router';
import { useState, type FormEvent, type ReactNode } from 'react';
import { WIcon } from '@/lib/icons';
import { initials } from '@/lib/text';
import { plain } from '@/lib/rich';
import { toast } from '@/lib/toast';
import * as m from '@/paraglide/messages.js';
import type { Book } from '@/features/catalog/domain/book';
import { roleLabel } from '@/features/workspace/ui/WorkspaceShell';
import { ContentHead, Panel } from '@/features/workspace/ui/parts';
import type { SettingsValues } from '../domain/settings';
import { saveSettings, setMemberRole } from '../functions';

type Tab = 'boutique' | 'livraison' | 'paiements' | 'equipe';

interface Props {
  tab: Tab;
  settings: SettingsValues;
  team: { id: string; name: string; email: string; role: string }[];
  paymentProvider: string;
}

export function SettingsView({ tab, settings, team, paymentProvider }: Props) {
  const router = useRouter();
  const nav: [Tab, string][] = [
    ['boutique', m.ws_settings_shop()],
    ['livraison', m.ws_delivery()],
    ['paiements', m.ws_settings_payments()],
    ['equipe', m.ws_settings_team()],
  ];

  async function save(change: Parameters<typeof saveSettings>[0]['data'], done: string) {
    try {
      await saveSettings({ data: change });
      toast(done);
      await router.invalidate();
    } catch {
      toast(m.ws_save_failed());
    }
  }

  function onSubmit(handler: (data: FormData) => void) {
    return (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      handler(new FormData(e.currentTarget));
    };
  }
  const get = (data: FormData, k: string) => String(data.get(k) ?? '').trim();

  let body: ReactNode = null;
  if (tab === 'boutique') {
    body = (
      <form
        onSubmit={onSubmit((d) =>
          void save({ key: 'shop', value: { name: get(d, 'name'), email: get(d, 'email'), phone: get(d, 'phone'), city: get(d, 'city') } }, m.ws_info_saved()),
        )}
      >
        <div className="form-section">
          <h2>{m.ws_shop_info()}</h2>
          <div className="form-grid">
            <label className="field full">
              {m.ws_shop_name()}
              <input name="name" defaultValue={settings.shop.name} required maxLength={100} />
            </label>
            <label className="field">
              {m.ws_contact_email()}
              <input type="email" name="email" defaultValue={settings.shop.email} required />
            </label>
            <label className="field">
              {m.field_phone()}
              <input name="phone" defaultValue={settings.shop.phone} maxLength={80} />
            </label>
            <label className="field">
              {m.ws_city_country()}
              <input name="city" defaultValue={settings.shop.city} required maxLength={100} />
            </label>
            <label className="field">
              {m.ws_reference_currency()}
              <input value="F CFA · XOF" disabled />
            </label>
          </div>
          <div className="inline-notice">
            <WIcon name="info" />
            {m.ws_shop_info_notice()}
          </div>
        </div>
        <div className="form-footer">
          <button className="btn" type="submit">
            <WIcon name="check" />
            {m.ws_save_info()}
          </button>
        </div>
      </form>
    );
  }
  if (tab === 'livraison') {
    body = (
      <form
        onSubmit={onSubmit((d) =>
          void save(
            {
              key: 'delivery',
              value: {
                lome: Number(get(d, 'lome')),
                outside: Number(get(d, 'outside')),
                couriers: get(d, 'couriers')
                  .split('\n')
                  .map((s) => s.trim())
                  .filter(Boolean),
              },
            },
            m.ws_fees_saved(),
          ),
        )}
      >
        <div className="form-section">
          <h2>{m.ws_delivery_settings_title()}</h2>
          <p className="muted small">{m.ws_delivery_settings_intro()}</p>
          <div className="form-grid section-gap">
            <label className="field">
              {m.ws_fee_lome()}
              <input name="lome" type="number" min={0} max={999999} defaultValue={settings.delivery.lome} required />
            </label>
            <label className="field">
              {m.ws_fee_outside()}
              <input name="outside" type="number" min={0} max={999999} defaultValue={settings.delivery.outside} required />
            </label>
            <label className="field full">
              {m.ws_couriers()}
              <textarea name="couriers" defaultValue={settings.delivery.couriers.join('\n')} />
              <small>{m.ws_couriers_hint()}</small>
            </label>
          </div>
          <div className="inline-notice">
            <WIcon name="truck" />
            {m.ws_delivery_settings_notice()}
          </div>
        </div>
        <div className="form-footer">
          <button className="btn" type="submit">
            {m.ws_save_fees()}
          </button>
        </div>
      </form>
    );
  }
  if (tab === 'paiements') {
    body = (
      <form
        onSubmit={onSubmit((d) =>
          void save({ key: 'payments', value: { mobileMoney: d.has('mobileMoney'), card: d.has('card'), cashOnDelivery: d.has('cashOnDelivery') } }, m.ws_payments_saved()),
        )}
      >
        <div className="form-section">
          <h2>{m.ws_payment_methods_title()}</h2>
          {(
            [
              ['mobileMoney', m.method_mobile_money(), m.ws_mm_hint(), settings.payments.mobileMoney],
              ['card', m.method_card(), m.ws_card_hint(), settings.payments.card],
              ['cashOnDelivery', m.method_cash(), m.ws_cash_hint(), settings.payments.cashOnDelivery],
            ] as const
          ).map(([name, label, hint, on]) => (
            <label className="toggle-row" key={name}>
              <span>
                <strong>{label}</strong>
                <p>{hint}</p>
              </span>
              <input name={name} type="checkbox" defaultChecked={on} />
            </label>
          ))}
          <div className={`inline-notice ${paymentProvider === 'simulated' ? 'warning' : ''}`}>
            <WIcon name="info" />
            {paymentProvider === 'simulated' ? m.ws_provider_simulated() : m.ws_provider_live()}
          </div>
        </div>
        <div className="form-footer">
          <button className="btn" type="submit">
            {m.ws_save_choices()}
          </button>
        </div>
      </form>
    );
  }
  if (tab === 'equipe') {
    body = <TeamTab team={team} onChanged={() => void router.invalidate()} />;
  }

  return (
    <>
      <ContentHead title={m.ws_settings_title()} description={m.ws_settings_intro()} />
      <div className="settings-layout">
        <nav className="settings-nav" aria-label={m.ws_settings_nav()}>
          {nav.map(([id, t]) => (
            <Link key={id} to="/admin/parametres" search={{ onglet: id }} className={tab === id ? 'active' : ''}>
              {t}
            </Link>
          ))}
        </nav>
        <section className="panel">{body}</section>
      </div>
    </>
  );
}

function TeamTab({ team, onChanged }: { team: Props['team']; onChanged: () => void }) {
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const result = await setMemberRole({ data: { email: String(data.get('email') ?? ''), role: String(data.get('role')) as 'owner' } });
    if (!result.ok) {
      toast(result.reason === 'self' ? m.ws_team_self() : m.ws_team_unknown());
      return;
    }
    toast(m.ws_team_saved());
    e.currentTarget.reset();
    onChanged();
  }
  return (
    <div className="form-section">
      <h2>{m.ws_team_title()}</h2>
      {team.map((p) => (
        <div className="team-row" key={p.id}>
          <span className="avatar">{initials(p.name)}</span>
          <div>
            <strong>{p.name}</strong>
            <small>{p.email}</small>
          </div>
          <span className="status neutral">{roleLabel(p.role)}</span>
        </div>
      ))}
      <form className="sheet-form section-gap" onSubmit={(e) => void submit(e)}>
        <div className="form-grid">
          <label className="field">
            {m.ws_team_email()}
            <input name="email" type="email" required placeholder="prenom@exemple.tg" />
          </label>
          <label className="field">
            {m.ws_team_role()}
            <select name="role" defaultValue="catalog">
              <option value="owner">{m.role_owner()}</option>
              <option value="catalog">{m.role_catalog()}</option>
              <option value="delivery">{m.role_delivery()}</option>
              <option value="customer">{m.ws_team_remove()}</option>
            </select>
          </label>
        </div>
        <div className="inline-notice">
          <WIcon name="info" />
          {m.ws_team_notice()}
        </div>
        <button className="btn" type="submit">
          <WIcon name="check" />
          {m.ws_team_submit()}
        </button>
      </form>
    </div>
  );
}

export function ContentView({ content, books }: { content: SettingsValues['content']; books: Book[] }) {
  const router = useRouter();
  const [title, setTitle] = useState(content.title);
  const [description, setDescription] = useState(content.description);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const selection = new FormData(e.currentTarget).getAll('selection').map(String);
    if (selection.length > 4) {
      toast(m.ws_selection_max());
      return;
    }
    await saveSettings({ data: { key: 'content', value: { title, description, selection } } });
    toast(m.ws_content_saved());
    await router.invalidate();
  }
  return (
    <>
      <ContentHead title={m.ws_content_title()} description={m.ws_content_intro()} />
      <div className="detail-grid">
        <form className="panel" onSubmit={(e) => void submit(e)}>
          <div className="form-section">
            <h2>{m.ws_welcome_message()}</h2>
            <div className="form-grid">
              <label className="field full">
                {m.ws_main_title()}
                <textarea name="title" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={100} style={{ minHeight: 70 }} />
                <small>{m.ws_main_title_hint()}</small>
              </label>
              <label className="field full">
                {m.ws_main_text()}
                <textarea name="description" value={description} onChange={(e) => setDescription(e.target.value)} required maxLength={300} />
              </label>
            </div>
          </div>
          <div className="form-section">
            <h2>{m.ws_shop_selection()}</h2>
            <p className="muted small">{m.ws_shop_selection_hint()}</p>
            {books.map((b) => (
              <label className="choice-row" key={b.id}>
                <input type="checkbox" name="selection" value={b.id} defaultChecked={content.selection.includes(b.id)} />
                {b.title}
              </label>
            ))}
          </div>
          <div className="form-footer">
            <span className="small muted">{m.ws_content_footer()}</span>
            <button className="btn" type="submit">
              {m.ws_publish()}
            </button>
          </div>
        </form>
        <div className="panel-stack">
          <Panel title={m.ws_preview()}>
            <div style={{ background: '#e5ecdc', padding: 25, borderRadius: 6 }}>
              <h2 style={{ fontSize: 26, lineHeight: 1.3 }}>{plain(title)}</h2>
              <p className="small muted" style={{ marginTop: 15 }}>
                {plain(description)}
              </p>
            </div>
          </Panel>
          <Panel title={m.ws_see_site()}>
            <p className="muted small">{m.ws_see_site_body()}</p>
            <a className="btn secondary section-gap" href="/" target="_blank" rel="noopener">
              {m.ws_open_shop()} <WIcon name="external" />
            </a>
          </Panel>
        </div>
      </div>
    </>
  );
}
