import { Link } from '@tanstack/react-router';
import { useState, type FormEvent } from 'react';
import { Icon } from '@/lib/icons';
import * as m from '@/paraglide/messages.js';
import { trackEvent } from '@/features/analytics/track';
import { PageIntro } from '@/features/storefront/ui/parts';
import { authClient } from '../client';

/** Only addresses of this site: a link can never send a reader elsewhere after signing in. */
function safeRedirect(value: string | undefined, fallback: string): string {
  return value && value.startsWith('/') && !value.startsWith('//') ? value : fallback;
}

export function SignInPage({ redirect }: { redirect?: string }) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setBusy(true);
    setError('');
    const { data: result, error: failure } = await authClient.signIn.email({
      email: String(data.get('email') ?? ''),
      password: String(data.get('password') ?? ''),
    });
    setBusy(false);
    if (failure || !result) {
      setError(m.auth_sign_in_failed());
      return;
    }
    trackEvent('account.signin', { source: redirect ?? 'direct' });
    const role = (result.user as { role?: string }).role ?? 'customer';
    window.location.assign(safeRedirect(redirect, role === 'customer' ? '/mon-compte' : '/admin'));
  }
  return (
    <>
      <PageIntro title={m.auth_sign_in_title()} description={m.auth_sign_in_intro()} crumb={m.account_label()} />
      <div className="wrap auth-layout">
        <form className="contact-form" onSubmit={submit}>
          <label>
            {m.email_label()}
            <input name="email" type="email" autoComplete="email" required placeholder={m.email_placeholder()} />
          </label>
          <label>
            {m.auth_password()}
            <input name="password" type="password" autoComplete="current-password" required minLength={8} />
          </label>
          {error ? (
            <p className="form-error" role="alert">
              {error}
            </p>
          ) : null}
          <button className="button" type="submit" disabled={busy}>
            {m.auth_sign_in_submit()} <Icon name="arrow" />
          </button>
        </form>
        <p className="auth-switch">
          {m.auth_no_account()}{' '}
          <Link to="/inscription" search={{ redirect }}>
            {m.auth_create_account()}
          </Link>
        </p>
      </div>
    </>
  );
}

export function SignUpPage({ redirect }: { redirect?: string }) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setBusy(true);
    setError('');
    const { error: failure } = await authClient.signUp.email({
      name: String(data.get('name') ?? '').trim(),
      email: String(data.get('email') ?? ''),
      password: String(data.get('password') ?? ''),
    });
    setBusy(false);
    if (failure) {
      setError(failure.status === 422 ? m.auth_email_taken() : m.auth_sign_up_failed());
      return;
    }
    trackEvent('account.signup', { source: redirect ?? 'direct' });
    window.location.assign(safeRedirect(redirect, '/mon-compte'));
  }
  return (
    <>
      <PageIntro title={m.auth_sign_up_title()} description={m.auth_sign_up_intro()} crumb={m.account_label()} />
      <div className="wrap auth-layout">
        <form className="contact-form" onSubmit={submit}>
          <label>
            {m.field_full_name()}
            <input name="name" autoComplete="name" required minLength={2} maxLength={100} />
          </label>
          <label>
            {m.email_label()}
            <input name="email" type="email" autoComplete="email" required placeholder={m.email_placeholder()} />
          </label>
          <label>
            {m.auth_password()}
            <input name="password" type="password" autoComplete="new-password" required minLength={8} />
            <small>{m.auth_password_hint()}</small>
          </label>
          {error ? (
            <p className="form-error" role="alert">
              {error}
            </p>
          ) : null}
          <button className="button" type="submit" disabled={busy}>
            {m.auth_sign_up_submit()} <Icon name="arrow" />
          </button>
        </form>
        <p className="auth-switch">
          {m.auth_have_account()}{' '}
          <Link to="/connexion" search={{ redirect }}>
            {m.auth_sign_in_link()}
          </Link>
        </p>
      </div>
    </>
  );
}
