import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getProducts, getCollections, getCollectionByHandle } from '@/lib/shopify';
import { CollectionsClient } from '@/components/product/collections-client';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ handle: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const collection = await getCollectionByHandle(handle);
  if (!collection) {
    return { title: 'Collection Not Found — UNDRSKIN' };
  }
  return {
    title: `${collection.title} — UNDRSKIN`,
    description: collection.description,
    openGraph: {
      title: `${collection.title} — UNDRSKIN`,
      description: collection.description,
      images: collection.image?.url ? [{ url: collection.image.url }] : [],
    },
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
