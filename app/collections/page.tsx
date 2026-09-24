import { getProducts, getCollections } from '@/lib/shopify';
import { CollectionsClient } from '@/components/product/collections-client';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'All Silhouettes — UNDRSKIN',
  description: 'Explore the complete archive of minimal second-skin garments, slips, and underwire-free bralettes.',
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
