'use client';

import React, { useState, useEffect, useMemo } from 'react';
import NextImage from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { MOCK_PRODUCTS } from '@/lib/mock-data';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const filteredProducts = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return MOCK_PRODUCTS.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)) ||
        p.collections.some((c) => c.toLowerCase().includes(q))
    );
  }, [query]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center pt-20 px-4 sm:px-6"
          onClick={onClose}
        >
          <div
            className="w-full max-w-2xl bg-neutral-950 border border-neutral-800 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input Bar */}
            <div className="flex items-center px-6 py-4 border-b border-neutral-800">
              <svg className="w-5 h-5 text-neutral-400 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                autoFocus
                placeholder="Search raw silk, contour slips, seamless bralettes..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent text-sm text-white placeholder:text-neutral-500 focus:outline-none tracking-wide"
              />
              <button
                onClick={onClose}
                className="text-neutral-500 hover:text-white p-1 text-xs uppercase font-mono tracking-widest"
              >
                ESC
              </button>
            </div>

            {/* Results or Suggestions */}
            <div className="max-h-[60vh] overflow-y-auto p-6">
              {query.trim() === '' ? (
                <div className="space-y-4">
                  <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-400 font-mono block">
                    Popular Searches
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {['Silk Slip', 'Zero-Pressure Bralette', 'Contour Brief', 'Modal Camisole', 'Core Essentials'].map(
                      (item) => (
                        <button
                          key={item}
                          onClick={() => setQuery(item)}
                          className="px-3 py-1.5 bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 hover:text-white hover:border-neutral-700 transition-colors uppercase tracking-wider"
                        >
                          {item}
                        </button>
                      )
                    )}
                  </div>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <p className="text-xs uppercase tracking-widest text-neutral-400">
                    No results found for &quot;{query}&quot;
                  </p>
                  <p className="text-[11px] text-neutral-500 font-light">
                    Try searching for &quot;silk&quot;, &quot;bralette&quot;, or &quot;sculpt&quot;.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-400 font-mono block mb-2">
                    Archive Results ({filteredProducts.length})
                  </span>
                  {filteredProducts.map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.handle}`}
                      onClick={onClose}
                      className="group flex items-center gap-4 p-3 border border-neutral-900 hover:border-neutral-700 hover:bg-neutral-900/50 transition-all"
                    >
                      <div className="relative w-12 h-16 bg-neutral-900 overflow-hidden flex-shrink-0">
                        <NextImage
                          src={product.featuredImage?.url || product.images[0].url}
                          alt={product.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs uppercase tracking-widest text-white truncate font-medium group-hover:text-neutral-200">
                          {product.title}
                        </h4>
                        <p className="text-[11px] text-neutral-400 font-light truncate mt-0.5">
                          {product.collections[0]?.replace('-', ' ') || 'Studio'}
                        </p>
                      </div>
                      <span className="text-xs font-mono text-neutral-300">
                        ${product.price.amount.toFixed(2)}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
