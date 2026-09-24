'use client';

import React, { useState, useEffect } from 'react';
import Script from 'next/script';
import { Review } from '@/types/product';

interface ReviewsSectionProps {
  reviews?: Review[];
  rating?: number;
  reviewCount?: number;
  productTitle?: string;
  widgetHtml?: string;
  shopDomain?: string;
}

export function ReviewsSection({
  reviews = [],
  rating = 0,
  reviewCount = 0,
  productTitle = 'Garment',
  widgetHtml,
  shopDomain = 'f7gwna-cx.myshopify.com',
}: ReviewsSectionProps) {
  const [filterRating, setFilterRating] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && shopDomain) {
      (window as any).jdgm = (window as any).jdgm || {};
      (window as any).jdgm.SHOP_DOMAIN = shopDomain;
      (window as any).jdgm.PLATFORM = 'shopify';
    }
  }, [shopDomain]);

  const displayReviews = filterRating
    ? reviews.filter((r) => r.rating === filterRating)
    : reviews;

  const count = reviewCount || reviews.length;
  const avgRating =
    rating > 0
      ? rating.toFixed(1)
      : reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : '5.0';

  return (
    <section id="reviews" className="mt-24 pt-16 border-t border-neutral-900 scroll-mt-16">
      {/* Judge.me Client Preloader Script */}
      <Script
        src="https://cdn.judge.me/widget_preloader.js"
        strategy="afterInteractive"
      />

      <style jsx global>{`
        /* Scoped overrides to guarantee Judge.me widget is visible and styled to UNDRSKIN dark luxury */
        .judgeme-widget-embed .jdgm-rev-widg {
          display: block !important;
          background: transparent !important;
          color: #d4d4d4 !important;
          font-family: inherit !important;
        }
        .judgeme-widget-embed .jdgm-temp-hiding-style {
          display: none !important;
        }
        .judgeme-widget-embed .jdgm-write-rev-link {
          display: inline-flex !important;
          align-items: center;
          background-color: #ffffff !important;
          color: #000000 !important;
          padding: 8px 18px !important;
          font-size: 11px !important;
          text-transform: uppercase !important;
          letter-spacing: 0.15em !important;
          font-family: monospace !important;
          font-weight: 500 !important;
          transition: opacity 0.2s ease !important;
          text-decoration: none !important;
          margin-top: 12px !important;
        }
        .judgeme-widget-embed .jdgm-write-rev-link:hover {
          opacity: 0.85 !important;
        }
        .judgeme-widget-embed .jdgm-rev-widg__title {
          font-size: 14px !important;
          font-weight: 300 !important;
          letter-spacing: 0.15em !important;
          text-transform: uppercase !important;
          color: #ffffff !important;
          margin-bottom: 12px !important;
        }
        .judgeme-widget-embed .jdgm-star {
          color: #ffcc00 !important;
        }
        .judgeme-widget-embed .jdgm-star.jdgm--off {
          color: #404040 !important;
        }
        .judgeme-widget-embed .jdgm-rev-widg__summary-text {
          font-size: 12px !important;
          color: #a3a3a3 !important;
          margin-top: 4px !important;
        }
        .judgeme-widget-embed .jdgm-histogram__star {
          color: #d4d4d4 !important;
        }
        .judgeme-widget-embed .jdgm-histogram__bar-content {
          background-color: #ffffff !important;
        }
        .judgeme-widget-embed .jdgm-histogram__bar {
          background-color: #262626 !important;
        }
        .judgeme-widget-embed .jdgm-form {
          background: #121212 !important;
          border: 1px solid #262626 !important;
          padding: 24px !important;
          margin-top: 20px !important;
        }
        .judgeme-widget-embed .jdgm-form input,
        .judgeme-widget-embed .jdgm-form textarea {
          background: #1a1a1a !important;
          border: 1px solid #333333 !important;
          color: #ffffff !important;
          font-size: 12px !important;
        }
      `}</style>

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-10 gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-400 font-mono">
            Client Experiences
          </span>
          <h2 className="text-2xl font-light text-white tracking-tight uppercase mt-1">
            Reviews & Impressions ({count})
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-lg font-mono text-white">★ {count > 0 ? avgRating : '—'}</span>
            <span className="text-xs text-neutral-400">
              {count > 0 ? '/ 5.0 Overall' : 'No ratings yet'}
            </span>
          </div>

          {reviews.length > 0 && (
            <div className="flex items-center gap-1 text-[11px] font-mono border-l border-neutral-800 pl-3">
              <button
                type="button"
                onClick={() => setFilterRating(null)}
                className={`px-2 py-0.5 border transition-colors ${
                  filterRating === null
                    ? 'border-white text-white'
                    : 'border-neutral-800 text-neutral-500 hover:text-neutral-300'
                }`}
              >
                All
              </button>
              {[5, 4, 3].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFilterRating(filterRating === star ? null : star)}
                  className={`px-2 py-0.5 border transition-colors ${
                    filterRating === star
                      ? 'border-white text-white'
                      : 'border-neutral-800 text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  {star}★
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Always render reviews cards if available */}
      {reviews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {displayReviews.map((rev) => (
            <div
              key={rev.id}
              className="p-6 bg-neutral-900/40 border border-neutral-800/80 space-y-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-medium text-white block">{rev.author}</span>
                  {rev.verifiedBuyer && (
                    <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-mono">
                      ✓ Verified Patron
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-neutral-500 font-mono">{rev.date}</span>
              </div>

              <div className="text-xs text-[#ffcc00] tracking-wider">
                {'★'.repeat(rev.rating)}
                <span className="text-neutral-700">{'★'.repeat(Math.max(0, 5 - rev.rating))}</span>
              </div>

              <h4 className="text-xs font-semibold text-neutral-200">{rev.title}</h4>

              <p className="text-xs text-neutral-400 font-light leading-relaxed">
                &ldquo;{rev.content}&rdquo;
              </p>

              {rev.fitFeedback && (
                <p className="text-[10px] uppercase tracking-wider text-neutral-400 pt-2 border-t border-neutral-800 font-mono">
                  Fit: <span className="text-neutral-300">{rev.fitFeedback}</span>
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* Explicit, always-visible empty state when there are 0 reviews */
        <div className="p-8 bg-neutral-900/20 border border-neutral-800 text-center space-y-3 mb-10">
          <p className="text-xs uppercase tracking-widest text-neutral-200">
            Be the first to review {productTitle}
          </p>
          <p className="text-[11px] text-neutral-400 font-light max-w-md mx-auto">
            Verified client impressions are synced after delivery confirmation via Judge.me.
          </p>
        </div>
      )}

      {/* Render Judge.me Interactive Review Widget */}
      {widgetHtml && (
        <div
          className="judgeme-widget-embed pt-6 border-t border-neutral-900/60"
          dangerouslySetInnerHTML={{ __html: widgetHtml }}
        />
      )}
    </section>
  );
}
