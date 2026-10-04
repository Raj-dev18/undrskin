import { getProducts } from '@/lib/shopify';
import { StorefrontExperience } from '@/components/home/storefront-experience';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const products = await getProducts({});

  return <StorefrontExperience products={products} />;
}
