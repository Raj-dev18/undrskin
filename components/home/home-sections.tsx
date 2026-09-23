'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import NextImage from 'next/image';
import { Product, Collection, FAQItem, Review } from '@/types/product';
import { ProductGrid } from '@/components/product/product-grid';

interface HomeSectionsProps {
  products: Product[];
  collections: Collection[];
  faqs: FAQItem[];
  reviews: Review[];
}

export function HomeSections({ products, collections, faqs, reviews }: HomeSectionsProps) {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [openFaq, setOpenFaq] = useState<string | null>(faqs[0]?.id || null);

  const filteredProducts = activeTab === 'all'
    ? products
    : products.filter((p) => p.collections.includes(activeTab));

  return (
    <div className="space-y-24 sm:space-y-32 py-16 sm:py-24">
      {/* Featured Silhouettes Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-400 font-mono">
              The Seasonal Archive
            </span>
            <h2 className="text-2xl sm:text-3xl font-light text-white tracking-tight uppercase mt-1">
              Curated Silhouettes
            </h2>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setActiveTab('all')}
              className={`text-xs uppercase tracking-widest px-3 py-1.5 border transition-all ${
                activeTab === 'all'
                  ? 'border-white text-white bg-neutral-900'
                  : 'border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              All Pieces
            </button>
            <button
              onClick={() => setActiveTab('core-essentials')}
              className={`text-xs uppercase tracking-widest px-3 py-1.5 border transition-all ${
                activeTab === 'core-essentials'
                  ? 'border-white text-white bg-neutral-900'
                  : 'border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              Core
            </button>
            <button
              onClick={() => setActiveTab('silk-modal')}
              className={`text-xs uppercase tracking-widest px-3 py-1.5 border transition-all ${
                activeTab === 'silk-modal'
                  ? 'border-white text-white bg-neutral-900'
                  : 'border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              Silk
            </button>
            <button
              onClick={() => setActiveTab('contour-sculpt')}
              className={`text-xs uppercase tracking-widest px-3 py-1.5 border transition-all ${
                activeTab === 'contour-sculpt'
                  ? 'border-white text-white bg-neutral-900'
                  : 'border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              Sculpt
            </button>
          </div>
        </div>

        <ProductGrid products={filteredProducts} />

        <div className="mt-12 text-center">
          <Link
            href="/collections"
            className="inline-block px-8 py-3 border border-neutral-700 hover:border-white text-xs uppercase tracking-widest text-white transition-colors"
          >
            View Full Lookbook
          </Link>
        </div>
      </section>

      {/* Brand Material Philosophy Editorial */}
      <section className="bg-neutral-900/40 border-y border-neutral-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 relative aspect-[4/5] bg-neutral-900 overflow-hidden">
            <NextImage
              src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1200"
              alt="UNDRSKIN Material Philosophy"
              fill
              className="object-cover"
            />
          </div>
          <div className="lg:col-span-6 space-y-6 lg:pl-6">
            <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-400 font-mono">
              Material Integrity
            </span>
            <h2 className="text-3xl sm:text-4xl font-extralight text-white uppercase tracking-tight leading-tight">
              An intimate canvas <br />
              <span className="font-light italic font-serif">of absolute softness.</span>
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 font-light leading-relaxed">
              We reject rigid underwires, abrasive hardware, and petrochemical blends that trap heat.
              UNDRSKIN pieces are engineered with zero-pressure seam technology and breathable micro-modal fibers that mimic cellular elasticity.
            </p>
            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-neutral-800">
              <div>
                <span className="block font-mono text-xl text-white">100%</span>
                <span className="text-[11px] uppercase tracking-wider text-neutral-400">OEKO-TEX Certified</span>
              </div>
              <div>
                <span className="block font-mono text-xl text-white">0.0g</span>
                <span className="text-[11px] uppercase tracking-wider text-neutral-400">Unnecessary Hardware</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Collections Grid Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center max-w-xl mx-auto">
          <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-400 font-mono">
            Structured Archives
          </span>
          <h2 className="text-2xl sm:text-3xl font-light text-white tracking-tight uppercase mt-1">
            Collections
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {collections.map((col) => (
            <Link
              key={col.id}
              href={`/collections/${col.handle}`}
              className="group relative aspect-[3/4] bg-neutral-900 overflow-hidden flex flex-col justify-end p-6 border border-neutral-900"
            >
              {col.image && (
                <NextImage
                  src={col.image.url}
                  alt={col.image.altText || col.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out opacity-80 group-hover:opacity-90"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
              <div className="relative z-10 space-y-1">
                <span className="text-[9px] uppercase tracking-[0.25em] text-neutral-400 font-mono">
                  Collection
                </span>
                <h3 className="text-base font-light text-white uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                  {col.title}
                </h3>
                <p className="text-[11px] text-neutral-400 line-clamp-2 font-light">
                  {col.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Verified Reviews Carousel / Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-400 font-mono">
              Client Impressions
            </span>
            <h2 className="text-2xl sm:text-3xl font-light text-white tracking-tight uppercase mt-1">
              What Clients Wear & Feel
            </h2>
          </div>
          <div className="text-xs text-neutral-400 font-mono">
            ★ 4.9 AVERAGE RATING FROM 1,400+ VERIFIED PATRONS
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.slice(0, 3).map((rev) => (
            <div
              key={rev.id}
              className="p-6 bg-neutral-900/30 border border-neutral-800/80 space-y-4"
            >
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-white">{rev.author}</span>
                <span className="text-neutral-500 font-mono">{rev.date}</span>
              </div>
              <div className="text-xs text-neutral-300 tracking-wider">
                {'★'.repeat(rev.rating)}
              </div>
              <h4 className="text-xs font-semibold text-neutral-200">{rev.title}</h4>
              <p className="text-xs text-neutral-400 font-light leading-relaxed">
                "{rev.content}"
              </p>
              {rev.fitFeedback && (
                <div className="text-[10px] uppercase tracking-wider text-neutral-400 pt-2 border-t border-neutral-800">
                  Fit: <span className="text-neutral-300">{rev.fitFeedback}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Accordion FAQ on Homepage */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-400 font-mono">
            Concierge Assistance
          </span>
          <h2 className="text-2xl sm:text-3xl font-light text-white tracking-tight uppercase mt-1">
            Common Inquiries
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.slice(0, 4).map((faq) => {
            const isOpen = openFaq === faq.id;
            return (
              <div
                key={faq.id}
                className="border border-neutral-800 bg-neutral-900/20 transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                  className="w-full p-5 flex items-center justify-between text-left text-xs uppercase tracking-widest text-neutral-200 hover:text-white"
                >
                  <span className="pr-4">{faq.question}</span>
                  <span className="font-mono text-base text-neutral-500">
                    {isOpen ? '−' : '+'}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-neutral-400 font-light leading-relaxed border-t border-neutral-800/40">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/faq"
            className="text-xs uppercase tracking-widest text-neutral-400 hover:text-white underline underline-offset-4"
          >
            Visit Complete FAQ & Care Guide
          </Link>
        </div>
      </section>
    </div>
  );
}
