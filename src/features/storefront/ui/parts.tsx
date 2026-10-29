import { Link } from '@tanstack/react-router';
import { Fragment } from 'react';
import { Icon } from '@/lib/icons';
import * as m from '@/paraglide/messages.js';
import type { Publisher } from '@/features/catalog/domain/book';
import { DEMO_MODE } from './shop-context';

export function PageIntro({ title, description, crumb }: { title: string; description?: string; crumb?: string }) {
  return (
    <div className="page-intro wrap">
      <div className="breadcrumb">
        <Link to="/">{m.crumb_home()}</Link>
        <span aria-hidden="true">/</span>
        <span>{crumb ?? m.crumb_shop()}</span>
      </div>
      <h1>{title}</h1>
      {description ? <p>{description}</p> : null}
    </div>
  );
}

export function DemoNote() {
  return DEMO_MODE ? <div className="demo-note">{m.demo_note()}</div> : null;
}

export function Services() {
  return (
    <div className="service-strip wrap">
      <div className="service">
        <Icon name="book" />
        <div>
          <strong>{m.service_1_title()}</strong>
          <span>{m.service_1_body()}</span>
        </div>
      </div>
      <div className="service">
        <Icon name="leaf" />
        <div>
          <strong>{m.service_2_title()}</strong>
          <span>{m.service_2_body()}</span>
        </div>
      </div>
      <div className="service">
        <Icon name="heart" />
        <div>
          <strong>{m.service_3_title()}</strong>
          <span>{m.service_3_body()}</span>
        </div>
      </div>
    </div>
  );
}

/** A publisher's logo, set in type as in the mockup: lines, then a small kicker. */
export function PublisherLogo({ publisher }: { publisher: Publisher }) {
  const lines = publisher.logoText.split('\n');
  return (
    <>
      {lines.map((line, i) => (
        <Fragment key={i}>
          {i > 0 && <br />}
          {line}
        </Fragment>
      ))}
      {publisher.logoKicker ? <small>{publisher.logoKicker}</small> : null}
    </>
  );
}
