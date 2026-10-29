import { createFileRoute } from '@tanstack/react-router';
import * as m from '@/paraglide/messages.js';
import { coverUrl } from '@/features/catalog/domain/book';
import { ProductPage } from '@/features/catalog/ui/ProductPage';

export const Route = createFileRoute('/_shop/livres/$bookId')({
  head: ({ matches, params }) => {
    const shop = matches.find((match) => (match.routeId as string) === '/_shop')?.loaderData as
      | { books: { id: string; title: string; author: string; description: string; cover: string }[] }
      | undefined;
    const book = shop?.books.find((b) => b.id === params.bookId);
    if (!book) return { meta: [{ title: m.meta_title() }] };
    return {
      meta: [
        { title: m.title_book({ title: book.title }) },
        { name: 'description', content: book.description.slice(0, 160) },
        { property: 'og:title', content: book.title },
        { property: 'og:image', content: coverUrl(book.cover) },
      ],
    };
  },
  component: BookRoute,
});

function BookRoute() {
  return <ProductPage bookId={Route.useParams().bookId} />;
}
