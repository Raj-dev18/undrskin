import Link from 'next/link';
import { Metadata } from 'next';
import { searchProducts } from '@/lib/shopify';
import { ProductGrid } from '@/components/product/product-grid';

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `Search: "${q}" — UNDRSKIN` : 'Search Silhouettes — UNDRSKIN',
    description: 'Search architectural second-skin lingerie, contour slips, and modal foundations.',
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = '' } = await searchParams;
  const cleanQuery = q.trim();

  const products = cleanQuery ? await searchProducts(cleanQuery) : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-xs uppercase tracking-widest text-neutral-500 mb-6">
        <Link href="/" className="hover:text-white transition-colors">
          Home
        </Link>
        <span>/</span>
        <span className="text-white">Search Archive</span>
      </nav>

      {/* Header & Query Input */}
      <div className="max-w-2xl mb-12">
        <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-400 font-mono">
          Global Silhouette Search
        </span>
        <h1 className="text-3xl sm:text-4xl font-light text-white tracking-tight uppercase mt-2">
          {cleanQuery ? `Results for "${cleanQuery}"` : 'Explore the Archive'}
        </h1>
        <p className="mt-3 text-xs sm:text-sm text-neutral-400 font-light leading-relaxed">
          {cleanQuery
            ? `Displaying ${products.length} architectural piece${products.length === 1 ? '' : 's'} matching your query.`
            : 'Enter search terms such as "silk", "sculpt", "bralette", or "modal" to discover foundational silhouettes.'}
        </p>

        {/* Search Bar Form */}
        <form action="/search" method="GET" className="mt-6 flex gap-2">
          <input
            type="search"
            name="q"
            defaultValue={cleanQuery}
            placeholder="Search raw silk, contour slips, seamless bralettes..."
            className="flex-1 bg-neutral-900 border border-neutral-800 text-xs px-4 py-3 text-white placeholder:text-neutral-500 focus:outline-none focus:border-white transition-colors"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-white text-black text-xs uppercase tracking-widest font-medium hover:bg-neutral-200 transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Product Results Grid */}
      {cleanQuery ? (
        <ProductGrid
          products={products}
          emptyMessage={`No silhouettes found matching "${cleanQuery}". Try exploring our full collection.`}
        />
      ) : (
        <div className="py-16 border-t border-neutral-900">
          <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-400 font-mono block mb-4">
            Curated Themes
          </span>
          <div className="flex flex-wrap gap-2.5">
            {['Silk', 'Sculpt', 'Modal', 'Bralette', 'Bodysuit', 'Brief'].map((term) => (
              <Link
                key={term}
                href={`/search?q=${encodeURIComponent(term)}`}
                className="px-4 py-2 bg-neutral-900/60 border border-neutral-800 text-xs text-neutral-300 hover:text-white hover:border-neutral-600 transition-colors uppercase tracking-wider"
              >
                {term}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
