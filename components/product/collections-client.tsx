'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Product, Collection } from '@/types/product';
import { ProductGrid } from '@/components/product/product-grid';
import { CollectionFilter } from '@/components/product/collection-filter';

interface CollectionsClientProps {
  initialProducts: Product[];
  collections: Collection[];
  initialCategory?: string;
  collectionTitle?: string;
  collectionDescription?: string;
}

export function CollectionsClient({
  initialProducts,
  collections,
  initialCategory = 'all',
  collectionTitle = 'All Silhouettes',
  collectionDescription = 'Explore our complete library of high-recovery second-skin foundation pieces, slips, and essentials.',
}: CollectionsClientProps) {
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory);
  const [activeSort, setActiveSort] = useState<string>('featured');

  let filtered =
    activeCategory === 'all'
      ? initialProducts
      : initialProducts.filter((p) => p.collections.includes(activeCategory));

  if (activeSort === 'price-asc') {
    filtered = [...filtered].sort((a, b) => a.price.amount - b.price.amount);
  } else if (activeSort === 'price-desc') {
    filtered = [...filtered].sort((a, b) => b.price.amount - a.price.amount);
  } else if (activeSort === 'bestsellers') {
    filtered = [...filtered].sort((a, b) => b.reviewCount - a.reviewCount);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-xs uppercase tracking-widest text-neutral-500 mb-6">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <span>/</span>
        <span className="text-neutral-300">Collections</span>
        {activeCategory !== 'all' && (
          <>
            <span>/</span>
            <span className="text-white capitalize">{activeCategory.replace('-', ' ')}</span>
          </>
        )}
      </nav>

      {/* Header */}
      <div className="max-w-2xl mb-8">
        <h1 className="text-3xl sm:text-4xl font-light text-white tracking-tight uppercase">
          {collectionTitle}
        </h1>
        <p className="mt-3 text-xs sm:text-sm text-neutral-400 font-light leading-relaxed">
          {collectionDescription}
        </p>
      </div>

      {/* Filter and Sort Bar */}
      <CollectionFilter
        categories={collections}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        activeSort={activeSort}
        onSelectSort={setActiveSort}
        productCount={filtered.length}
      />

      {/* Products Grid */}
      <div className="mt-10">
        <ProductGrid products={filtered} />
      </div>
    </div>
  );
}
