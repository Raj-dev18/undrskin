import { notFound } from 'next/navigation';
import { getProducts, getCollections, getCollectionByHandle } from '@/lib/shopify';
import { CollectionsClient } from '@/components/product/collections-client';

interface Props {
  params: Promise<{ handle: string }>;
}

export async function generateMetadata({ params}: Props) {
  const { handle } = await params;
  const collection = await getCollectionByHandle(handle);
  if (!collection) return { title: 'Collection — UNDRSKIN' };
  return{
    title: `${collection.title} — UNDRSKIN`,
    description: collection.description,
  };
}

export default async function CollectionDetailPage({ params }: Props) {
  const { handle } = await params;
  const [collection, products, collections] = await Promise.all([
    getCollectionByHandle(handle),
    getProducts({ collection: handle }),
    getCollections(),
  ]);

  if (!collection) {
    notFound();
  }

  return (
    <CollectionsClient
      initialProducts={products}
      collections={collections}
      initialCategory={handle}
      collectionTitle={collection.title}
      collectionDescription={collection.description}
    />
  );
}
