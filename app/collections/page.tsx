import { getProducts, getCollections } from '@/lib/shopify';
import { CollectionsClient } from '@/components/product/collections-client';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Shop Bamboo Underwear — UNDRSKIN',
  description: 'Explore bamboo underwear packs designed for breathable, comfortable everyday wear.',
};

export default async function CollectionsPage() {
  const [products, collections] = await Promise.all([
    getProducts(),
    getCollections(),
  ]);

  return (
    <CollectionsClient
      initialProducts={products}
      collections={collections}
      initialCategory="all"
    />
  );
}
