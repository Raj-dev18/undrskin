import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { getProductByHandle, getProducts, getFAQs } from '@/lib/shopify';
import { ProductGallery } from '@/components/product/product-gallery';
import { ProductDetails } from '@/components/product/product-details';
import { ProductRecommendations } from '@/components/product/product-recommendations';
import { ReviewsSection } from '@/components/product/reviews-section';
import { ProductFaqPreview } from '@/components/product/product-faq-preview';
import { MOCK_REVIEWS } from '@/lib/mock-data';

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
    description: product.description.slice(0, 160) || 'Architectural luxury second-skin piece by UNDRSKIN.',
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
  const [product, allProducts, faqs] = await Promise.all([
    getProductByHandle(handle),
    getProducts(),
    getFAQs(),
  ]);

  if (!product) {
    notFound();
  }

  // Schema.org Product JSON-LD for rich snippets
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: product.images.map((img) => img.url),
    offers: {
      '@type': 'Offer',
      price: product.price.amount,
      priceCurrency: product.price.currencyCode,
      availability: product.availableForSale
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
  };

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
            Silhouettes
          </Link>
          <span>/</span>
          <span className="text-white truncate">{product.title}</span>
        </nav>

        {/* Main 2-column Product Display */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
          <div className="lg:col-span-7">
            <ProductGallery images={product.images} title={product.title} />
          </div>

          <div className="lg:col-span-5 lg:sticky lg:top-28">
            <ProductDetails product={product} />
          </div>
        </div>

        {/* Client Reviews Section */}
        <ReviewsSection
          reviews={MOCK_REVIEWS}
          rating={product.rating || 4.9}
          reviewCount={product.reviewCount || 48}
          productTitle={product.title}
        />

        {/* Fitting & Care FAQ Preview */}
        <ProductFaqPreview faqs={faqs} />

        {/* Complementary Silhouettes */}
        <ProductRecommendations products={allProducts} currentProductId={product.id} />
      </div>
    </>
  );
}
