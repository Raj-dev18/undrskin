import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProductByHandle, getProducts } from '@/lib/shopify';
import { ProductGallery } from '@/components/product/product-gallery';
import { ProductDetails } from '@/components/product/product-details';
import { ProductRecommendations } from '@/components/product/product-recommendations';

interface Props {
  params: Promise<{ handle: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { handle } = await params;
  const product = await getProductByHandle(handle);
  if (!product) return { title: 'Product — UNDRSKIN' };
  return {
    title: `${product.title} — UNDRSKIN`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: Props) {
  const { handle } = await params;
  const [product, allProducts] = await Promise.all([
    getProductByHandle(handle),
    getProducts(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-xs uppercase tracking-widest text-neutral-400 mb-8">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <span>/</span>
        <Link href="/collections" className="hover:text-white transition-colors">Silhouettes</Link>
        <span>/</span>
        <span className="text-white truncate">{product.title}</span>
      </nav>

      {/* Main product layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
        <div className="lg:col-span-7">
          <ProductGallery images={product.images} title={product.title} />
        </div>

        <div className="lg:col-span-5 lg:sticky lg:top-28">
          <ProductDetails product={product} />
        </div>
      </div>

      {/* Customer Reviews Section */}
      {product.reviews && product.reviews.length > 0 && (
        <section className="mt-24 pt-16 border-t border-neutral-900">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-10 gap-4">
            <div>
              <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-400 font-mono">
                Client Experiences
              </span>
              <h2 className="text-2xl font-light text-white tracking-tight uppercase mt-1">
                Reviews & Impressions ({product.reviewCount})
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-mono text-white">★ {product.rating}</span>
              <span className="text-xs text-neutral-400">/ 5.0 Overall</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {product.reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-6 bg-neutral-900/40 border border-neutral-800/80 space-y-4"
              >
                <div className="flex justify-between items-start">
                  <span className="text-xs font-medium text-white">{rev.author}</span>
                  <span className="text-[11px] text-neutral-400">{rev.date}</span>
                </div>
                <div className="text-xs text-neutral-300 tracking-wider">
                  {'★'.repeat(rev.rating)}
                </div>
                <h4 className="text-xs font-semibold text-neutral-200">{rev.title}</h4>
                <p className="text-xs text-neutral-400 font-light leading-relaxed">
                  {rev.content}
                </p>
                {rev.fitFeedback && (
                  <p className="text-[10px] uppercase tracking-wider text-neutral-400 pt-2 border-t border-neutral-800">
                    Fit: <span className="text-neutral-300">{rev.fitFeedback}</span>
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recommendations */}
      <ProductRecommendations products={allProducts} currentProductId={product.id} />
    </div>
  );
}
