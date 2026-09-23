import React from 'react';
import { Product } from '@/types/product';
import { ProductGrid } from './product-grid';

interface ProductRecommendationsProps {
  products: Product[];
  currentProductId: string;
}

export function ProductRecommendations({
  products,
  currentProductId,
}: ProductRecommendationsProps) {
  const filtered = products.filter((p) => p.id !== currentProductId).slice(0, 4);

  if (filtered.length === 0) return null;

  return (
    <section className="mt-24 pt-16 border-t border-neutral-900">
      <div className="mb-10">
        <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-400 font-mono">
          Complete the Ensemble
        </span>
        <h3 className="text-2xl font-light text-white tracking-tight uppercase mt-1">
          Complimentary Silhouettes
        </h3>
      </div>
      <ProductGrid products={filtered} />
    </section>
  );
}
