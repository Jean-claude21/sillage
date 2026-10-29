import { createFileRoute } from '@tanstack/react-router';
import { demoBooks } from '@/platform/demo-catalogue';
import { fetchAdminBook } from '@/features/catalog/admin-functions';
import { BookEdit } from '@/features/catalog/ui/admin/CatalogueAdmin';

const covers = demoBooks.map((b) => ({ cover: b.cover, title: b.title }));

export const Route = createFileRoute('/admin/catalogue/$bookId')({
  loader: ({ params }) => fetchAdminBook({ data: { id: params.bookId } }),
  component: BookRoute,
});

function BookRoute() {
  const { book, publishers } = Route.useLoaderData();
  return <BookEdit key={book?.id ?? 'new'} book={book} publishers={publishers} covers={covers} />;
}
