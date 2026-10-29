import { Fragment, type ReactNode } from 'react';

/**
 * Editorial text with the two marks the design uses: "\n" breaks the line, *words* are set in the
 * italic display face. Messages and editable contents stay plain text, never HTML.
 */
export function Rich({ text }: { text: string }): ReactNode {
  return text.split('\n').map((line, i) => (
    <Fragment key={i}>
      {i > 0 && <br />}
      {line.split(/(\*[^*]+\*)/).map((part, j) =>
        part.startsWith('*') && part.endsWith('*') && part.length > 2 ? (
          <em key={j}>{part.slice(1, -1)}</em>
        ) : (
          <Fragment key={j}>{part}</Fragment>
        ),
      )}
    </Fragment>
  ));
}

/** The same text without its marks, for titles, previews and metadata. */
export function plain(text: string): string {
  return text.replace(/\*/g, '').replace(/\n/g, ' ');
}
