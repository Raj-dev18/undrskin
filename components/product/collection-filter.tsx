'use client';

import React from 'react';
import { Collection } from '@/types/product';

export interface CollectionFilterProps {
  categories: Collection[];
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  activeSort: string;
  onSelectSort: (sort: string) => void;
  inStockOnly: boolean;
  onToggleInStock: (val: boolean) => void;
  productCount: number;
}

export function CollectionFilter({
  categories,
  activeCategory,
  onSelectCategory,
  activeSort,
  onSelectSort,
  inStockOnly,
  onToggleInStock,
  productCount,
}: CollectionFilterProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 py-6 border-b border-neutral-900 mb-8">
      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
        <button
          onClick={() => onSelectCategory('all')}
          className={`px-4 py-2 text-xs uppercase tracking-widest whitespace-nowrap border transition-all ${
            activeCategory === 'all'
              ? 'border-white text-white bg-neutral-900'
              : 'border-neutral-800 text-neutral-400 hover:text-white'
          }`}
        >
          All products ({productCount})
        </button>
        {categories.map((col) => (
          <button
            key={col.handle}
            onClick={() => onSelectCategory(col.handle)}
            className={`px-4 py-2 text-xs uppercase tracking-widest whitespace-nowrap border transition-all ${
              activeCategory === col.handle
                ? 'border-white text-white bg-neutral-900'
                : 'border-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            {col.title}
          </button>
        ))}
      </div>

      {/* Filter by Stock & Sort Select */}
      <div className="flex items-center flex-wrap gap-4 text-xs uppercase tracking-widest text-neutral-400 self-end lg:self-auto">
        <label className="flex items-center space-x-2 cursor-pointer select-none text-[11px] font-mono">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => onToggleInStock(e.target.checked)}
            className="w-3.5 h-3.5 rounded bg-neutral-900 border-neutral-700 text-white focus:ring-0 cursor-pointer accent-white"
          />
          <span className="text-neutral-300">In Stock Only</span>
        </label>

        <div className="flex items-center space-x-2">
          <label htmlFor="sort-select" className="text-[11px] font-mono">
            Sort:
          </label>
          <select
            id="sort-select"
            value={activeSort}
            onChange={(e) => onSelectSort(e.target.value)}
            className="bg-neutral-900 border border-neutral-800 text-neutral-200 text-xs px-3 py-1.5 focus:outline-none focus:border-neutral-600 uppercase tracking-wider"
          >
            <option value="featured">Featured Curations</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="bestsellers">Bestsellers</option>
            <option value="rating">Client Rating</option>
          </select>
        </div>
      </div>
    </div>
  );
}
