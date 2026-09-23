import { getProducts, getCollections, getFAQs } from '@/lib/shopify';
import { MOCK_REVIEWS } from '@/lib/mock-data';
import { Hero } from '@/components/home/hero';
import { HomeSections } from '@/components/home/home-sections';

export default async function HomePage() {
  const [products, collections, faqs] = await Promise.all([ getProducts(), getCollections(), getFAQs() ]);

  return (
    <div className="w-full">
      <Hero />
      <HomeSections
        products={products}
        collections={collections}
        faqs={faqs}
        reviews={MOCK_REVIEWS}
      />
    </div>
  );
}
