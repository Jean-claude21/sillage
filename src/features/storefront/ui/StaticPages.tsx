import { Link } from '@tanstack/react-router';
import { useEffect, useState, type FormEvent } from 'react';
import { Icon } from '@/lib/icons';
import * as m from '@/paraglide/messages.js';
import { trackEvent } from '@/features/analytics/track';
import { sendContactMessage } from '@/features/contact/functions';
import { openDiscovery } from '@/features/discovery/ui/DiscoveryDialog';
import { DemoNote, PageIntro, PublisherLogo } from './parts';
import { useShop } from './shop-context';

export function PublishersPage() {
  const { publishers, books } = useShop();
  return (
    <>
      <PageIntro title={m.publishers_title()} description={m.publishers_intro()} crumb={m.nav_publishers()} />
      <div className="publisher-cards wrap">
        {publishers.map((p) => (
          <article className="publisher-card" key={p.id}>
            <div className="publisher-logo">
              <PublisherLogo publisher={p} />
            </div>
            <p>{p.blurb}</p>
            <Link className="text-link" to="/catalogue" search={{ editeur: p.id }} onClick={() => trackEvent('publisher.view', { publisher: p.id })}>
              {m.publishers_discover({ count: books.filter((b) => b.publisherId === p.id).length })} <Icon name="arrow" />
            </Link>
          </article>
        ))}
      </div>
      <div className="wrap page-content">
        <h2>{m.publishers_join_title()}</h2>
        <p>{m.publishers_join_body()}</p>
        <Link className="button" to="/contact">
          {m.publishers_join_link()} <Icon name="arrow" />
        </Link>
      </div>
      <DemoNote />
    </>
  );
}

export function AboutPage() {
  return (
    <>
      <PageIntro title={m.about_title()} description={m.about_intro()} crumb={m.nav_about()} />
      <div className="wrap page-content">
        <h2>{m.about_h1()}</h2>
        <p>{m.about_p1()}</p>
        <p>{m.about_p2()}</p>
        <h2>{m.about_h2()}</h2>
        <p>{m.about_p3()}</p>
        <Link className="button" to="/editeurs">
          {m.about_link()} <Icon name="arrow" />
        </Link>
      </div>
      <DemoNote />
    </>
  );
}

export function HelpPage() {
  const { delivery } = useShop();
  const money = (n: number) => `${new Intl.NumberFormat('fr-FR').format(n)} F CFA`;
  useEffect(() => {
    if (location.hash === '#livraison') {
      const d = document.getElementById('livraison') as HTMLDetailsElement | null;
      if (d) {
        d.open = true;
        d.scrollIntoView();
      }
    }
  }, []);
  return (
    <>
      <PageIntro title={m.help_title()} description={m.help_intro()} crumb={m.footer_faq()} />
      <div className="wrap page-content faq">
        <details open>
          <summary>{m.help_q1()}</summary>
          <p>{m.help_a1()}</p>
          <button type="button" className="text-link text-button" onClick={openDiscovery}>
            {m.help_guide()} <Icon name="arrow" />
          </button>
        </details>
        <details id="livraison">
          <summary>{m.help_q2()}</summary>
          <p>{m.help_a2({ lome: money(delivery.lome), outside: money(delivery.outside) })}</p>
        </details>
        <details>
          <summary>{m.help_q3()}</summary>
          <p>{m.help_a3()}</p>
        </details>
        <details>
          <summary>{m.help_q4()}</summary>
          <p>{m.help_a4()}</p>
        </details>
        <details>
          <summary>{m.help_q5()}</summary>
          <p>{m.help_a5()}</p>
        </details>
        <details>
          <summary>{m.help_q6()}</summary>
          <p>{m.help_a6()}</p>
          <Link to="/contact" className="text-link">
            {m.help_contact_link()} <Icon name="arrow" />
          </Link>
        </details>
      </div>
      <DemoNote />
    </>
  );
}

export function ContactPage() {
  const [status, setStatus] = useState('');
  const [sending, setSending] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setSending(true);
    try {
      await sendContactMessage({
        data: { name: String(data.get('name') ?? ''), email: String(data.get('email') ?? ''), message: String(data.get('message') ?? '') },
      });
      setStatus(m.contact_sent());
      trackEvent('contact.submit', { topic: 'general' });
      form.reset();
    } catch {
      setStatus(m.contact_failed());
    } finally {
      setSending(false);
    }
  }
  return (
    <>
      <PageIntro title={m.contact_title()} description={m.contact_intro()} crumb={m.footer_contact()} />
      <div className="wrap page-content">
        <form className="contact-form" id="contact-form" onSubmit={submit}>
          <label>
            {m.contact_name()}
            <input name="name" autoComplete="name" required maxLength={100} placeholder={m.contact_name_placeholder()} />
          </label>
          <label>
            {m.email_label()}
            <input type="email" name="email" autoComplete="email" required placeholder={m.email_placeholder()} />
          </label>
          <label>
            {m.contact_message()}
            <textarea name="message" required minLength={10} maxLength={4000} placeholder={m.contact_message_placeholder()} />
          </label>
          <small>{m.contact_note()}</small>
          <button className="button" type="submit" disabled={sending}>
            {m.contact_submit()} <Icon name="arrow" />
          </button>
          <p role="status" id="contact-status">
            {status}
          </p>
        </form>
      </div>
      <DemoNote />
    </>
  );
}
