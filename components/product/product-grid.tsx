import React from 'react';
import { Product } from '@/types/product';
import { ProductCard } from './product-card';

interface ProductGridProps {
  products: Product[];
  emptyMessage?: string;
}

export function ProductGrid({
  products,
  emptyMessage = 'No products found matching your criteria.',
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="py-24 text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-full border border-neutral-800 flex items-center justify-center text-neutral-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-xs uppercase tracking-widest text-neutral-400">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-12">
      {products.map((product, idx) => (
        <ProductCard
          key={product.id}
          product={product}
          priority={idx < 4}
        />
      ))}
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-12">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse space-y-3">
          <div className="w-full aspect-[3/4] bg-neutral-900" />
          <div className="h-3 bg-neutral-900 w-3/4" />
          <div className="h-3 bg-neutral-900 w-1/4" />
        </div>
      ))}
    </div>
  );
}
