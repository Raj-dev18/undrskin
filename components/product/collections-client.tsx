'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
  collectionTitle = 'Shop the collection',
  collectionDescription = 'Explore breathable bamboo underwear packs made for everyday comfort.',
}: CollectionsClientProps) {
  const visibleCollections = collections.filter((collection) => !/home page|default example/i.test(collection.title));
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory);
  const [activeSort, setActiveSort] = useState<string>('featured');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);

  const filtered = useMemo(() => {
    let result =
      activeCategory === 'all'
        ? initialProducts
        : initialProducts.filter((p) => p.collections.includes(activeCategory));

    if (inStockOnly) {
      result = result.filter((p) => p.availableForSale);
    }

    if (activeSort === 'price-asc') {
      result = [...result].sort((a, b) => a.price.amount - b.price.amount);
    } else if (activeSort === 'price-desc') {
      result = [...result].sort((a, b) => b.price.amount - a.price.amount);
    } else if (activeSort === 'bestsellers') {
      result = [...result].sort((a, b) => b.reviewCount - a.reviewCount);
    } else if (activeSort === 'rating') {
      result = [...result].sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [initialProducts, activeCategory, inStockOnly, activeSort]);

  return (
    <div className="collections-page max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-xs uppercase tracking-widest text-neutral-500 mb-6">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <span>/</span>
        <Link href="/collections" className="hover:text-white transition-colors">Collections</Link>
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
        categories={visibleCollections}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        activeSort={activeSort}
        onSelectSort={setActiveSort}
        inStockOnly={inStockOnly}
        onToggleInStock={setInStockOnly}
        productCount={filtered.length}
      />

      {/* Products Grid */}
      <div className="mt-10">
        <ProductGrid
          products={filtered}
          emptyMessage="No products found in this collection."
        />
      </div>
    </div>
  );
}
