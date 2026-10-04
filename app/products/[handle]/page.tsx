import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { getProductByHandle, getProducts, getFAQs } from '@/lib/shopify';
import { getJudgeMeProductReviews } from '@/lib/judgeme';
import { ProductView } from '@/components/product/product-view';
import { ProductRecommendations } from '@/components/product/product-recommendations';
import { ReviewsSection } from '@/components/product/reviews-section';
import { ProductFaqPreview } from '@/components/product/product-faq-preview';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ handle: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProductByHandle(handle);

  if (!product) {
    return {
      title: 'Product Not Found — UNDRSKIN',
    };
  }

  const primaryImage = product.featuredImage?.url || product.images[0]?.url;

  return {
    title: `${product.title} — UNDRSKIN`,
    description: product.description.slice(0, 160) || 'A bamboo underwear essential by UNDRSKIN.',
    openGraph: {
      title: `${product.title} — UNDRSKIN`,
      description: product.description.slice(0, 160),
      images: primaryImage ? [{ url: primaryImage }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.title} — UNDRSKIN`,
      description: product.description.slice(0, 160),
      images: primaryImage ? [primaryImage] : [],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { handle } = await params;
  const product = await getProductByHandle(handle);

  if (!product) {
    notFound();
  }

  // Concurrently fetch catalog recommendations, FAQs, and live Judge.me reviews
  const [allProducts, faqs, judgeMeData] = await Promise.all([
    getProducts(),
    getFAQs(),
    getJudgeMeProductReviews(product.id, product.handle),
  ]);

  // Synchronize product model with dynamic Judge.me reviews and rating
  if (judgeMeData) {
    product.rating = judgeMeData.rating;
    product.reviewCount = judgeMeData.reviewCount;
    product.reviews = judgeMeData.reviews;
    product.judgeMeWidgetHtml = judgeMeData.widgetHtml;
  }

  // Schema.org Product JSON-LD for rich snippets
  const jsonLdImages = product.images.length > 0
    ? product.images.map((img) => img.url)
    : product.featuredImage?.url
    ? [product.featuredImage.url]
    : [];

  const jsonLd: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: jsonLdImages,
    offers: {
      '@type': 'Offer',
      price: product.price.amount,
      priceCurrency: product.price.currencyCode,
      availability: product.availableForSale
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
  };

  if (product.reviewCount > 0) {
    jsonLd.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    };
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-xs uppercase tracking-widest text-neutral-400 mb-8">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/collections" className="hover:text-white transition-colors">
            Shop
          </Link>
          <span>/</span>
          <span className="text-white truncate">{product.title}</span>
        </nav>

        {/* Coordinated 2-column Product Display */}
        <ProductView product={product} />

        {/* Client Reviews Section */}
        <ReviewsSection
          reviews={judgeMeData.reviews}
          rating={judgeMeData.rating}
          reviewCount={judgeMeData.reviewCount}
          productTitle={product.title}
          widgetHtml={judgeMeData.widgetHtml}
          shopDomain={process.env.JUDGEME_SHOP_DOMAIN || process.env.SHOPIFY_STORE_DOMAIN || 'f7gwna-cx.myshopify.com'}
          publicToken={process.env.JUDGEME_PUBLIC_TOKEN}
        />

        {/* Fitting & Care FAQ Preview */}
        <ProductFaqPreview faqs={faqs} />

        {/* Related products */}
        <ProductRecommendations products={allProducts} currentProductId={product.id} />
      </div>
    </>
  );
}
