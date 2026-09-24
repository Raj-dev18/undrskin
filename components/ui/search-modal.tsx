'use client';

import React, { useState, useEffect } from 'react';
import NextImage from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '@/types/product';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (!isOpen) {
      setQuery('');
      setResults([]);
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Debounced live search
  useEffect(() => {
    if (!query.trim()) {
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.products || []);
        }
      } catch (err) {
        console.error('Search fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onClose();
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

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
            <form onSubmit={handleSubmit} className="flex items-center px-6 py-4 border-b border-neutral-800">
              <svg className="w-5 h-5 text-neutral-400 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                autoFocus
                placeholder="Search raw silk, contour slips, seamless bralettes..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (!e.target.value.trim()) {
                    setResults([]);
                    setIsLoading(false);
                  }
                }}
                className="w-full bg-transparent text-sm text-white placeholder:text-neutral-500 focus:outline-none tracking-wide"
              />
              {isLoading && (
                <div className="w-4 h-4 border border-neutral-500 border-t-white rounded-full animate-spin mr-3" />
              )}
              <button
                type="button"
                onClick={onClose}
                className="text-neutral-500 hover:text-white p-1 text-xs uppercase font-mono tracking-widest"
              >
                ESC
              </button>
            </form>

            {/* Results or Suggestions */}
            <div className="max-h-[60vh] overflow-y-auto p-6">
              {query.trim() === '' ? (
                <div className="space-y-4">
                  <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-400 font-mono block">
                    Curated Themes
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {['Silk', 'Sculpt', 'Modal', 'Bralette', 'Bodysuit', 'Brief'].map(
                      (item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => setQuery(item)}
                          className="px-3 py-1.5 bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 hover:text-white hover:border-neutral-700 transition-colors uppercase tracking-wider"
                        >
                          {item}
                        </button>
                      )
                    )}
                  </div>
                </div>
              ) : isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4 p-3 border border-neutral-900 animate-pulse">
                      <div className="w-12 h-16 bg-neutral-900" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-neutral-900 w-1/2" />
                        <div className="h-2 bg-neutral-900 w-1/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : results.length === 0 ? (
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
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-400 font-mono block">
                      Live Results ({results.length})
                    </span>
                    <button
                      onClick={handleSubmit}
                      className="text-[10px] uppercase tracking-wider text-neutral-400 hover:text-white underline underline-offset-2"
                    >
                      View All on Search Page →
                    </button>
                  </div>
                  {results.map((product) => (
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
