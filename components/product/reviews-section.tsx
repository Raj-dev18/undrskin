'use client';

import React, { useState } from 'react';
import { Review } from '@/types/product';

interface ReviewsSectionProps {
  reviews?: Review[];
  rating?: number;
  reviewCount?: number;
  productTitle?: string;
}

export function ReviewsSection({
  reviews = [],
  rating = 4.9,
  reviewCount = 0,
  productTitle = 'Garment',
}: ReviewsSectionProps) {
  const [filterRating, setFilterRating] = useState<number | null>(null);

  const displayReviews = filterRating
    ? reviews.filter((r) => r.rating === filterRating)
    : reviews;

  return (
    <section className="mt-24 pt-16 border-t border-neutral-900">
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-10 gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-400 font-mono">
            Client Experiences
          </span>
          <h2 className="text-2xl font-light text-white tracking-tight uppercase mt-1">
            Reviews & Impressions ({reviewCount || reviews.length})
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-lg font-mono text-white">★ {rating}</span>
            <span className="text-xs text-neutral-400">/ 5.0 Overall</span>
          </div>

          {reviews.length > 0 && (
            <div className="flex items-center gap-1 text-[11px] font-mono border-l border-neutral-800 pl-3">
              <button
                onClick={() => setFilterRating(null)}
                className={`px-2 py-0.5 border ${
                  filterRating === null ? 'border-white text-white' : 'border-neutral-800 text-neutral-500'
                }`}
              >
                All
              </button>
              {[5, 4].map((star) => (
                <button
                  key={star}
                  onClick={() => setFilterRating(filterRating === star ? null : star)}
                  className={`px-2 py-0.5 border ${
                    filterRating === star ? 'border-white text-white' : 'border-neutral-800 text-neutral-500'
                  }`}
                >
                  {star}★
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="p-8 bg-neutral-900/20 border border-neutral-800 text-center space-y-2">
          <p className="text-xs uppercase tracking-widest text-neutral-300">
            Be the first to review {productTitle}
          </p>
          <p className="text-[11px] text-neutral-500 font-light">
            Verified client impressions are synced after delivery confirmation.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayReviews.map((rev) => (
            <div
              key={rev.id}
              className="p-6 bg-neutral-900/40 border border-neutral-800/80 space-y-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-medium text-white block">{rev.author}</span>
                  {rev.verifiedBuyer && (
                    <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-mono">
                      ✓ Verified Patron
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-neutral-500 font-mono">{rev.date}</span>
              </div>

              <div className="text-xs text-neutral-300 tracking-wider">
                {'★'.repeat(rev.rating)}
              </div>

              <h4 className="text-xs font-semibold text-neutral-200">{rev.title}</h4>

              <p className="text-xs text-neutral-400 font-light leading-relaxed">
                "{rev.content}"
              </p>

              {rev.fitFeedback && (
                <p className="text-[10px] uppercase tracking-wider text-neutral-400 pt-2 border-t border-neutral-800 font-mono">
                  Fit: <span className="text-neutral-300">{rev.fitFeedback}</span>
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
