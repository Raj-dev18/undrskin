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
  publicToken?: string;
}

export function ReviewsSection({
  reviews = [],
  rating = 0,
  reviewCount = 0,
  productTitle = 'Garment',
  widgetHtml,
  shopDomain = 'f7gwna-cx.myshopify.com',
  publicToken,
}: ReviewsSectionProps) {
  const [filterRating, setFilterRating] = useState<number | null>(null);

  const isRealPublicToken =
    Boolean(publicToken) &&
    publicToken !== 'your_judgeme_public_token' &&
    !publicToken!.startsWith('your_') &&
    publicToken!.trim().length > 0;

  useEffect(() => {
    if (typeof window !== 'undefined' && shopDomain) {
      (window as any).jdgm = (window as any).jdgm || {};
      (window as any).jdgm.SHOP_DOMAIN = shopDomain;
      (window as any).jdgm.PLATFORM = 'shopify';
      if (isRealPublicToken) {
        (window as any).jdgm.PUBLIC_TOKEN = publicToken;
      }
    }
  }, [shopDomain, publicToken, isRealPublicToken]);

  const [visibleCount, setVisibleCount] = useState<number>(6);

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

  const paginatedReviews = displayReviews.slice(0, visibleCount);

  // Star breakdown calculation
  const starCounts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => {
    const s = Math.max(1, Math.min(5, Math.round(Number(r.rating) || 5)));
    starCounts[s] = (starCounts[s] || 0) + 1;
  });

  return (
    <section id="reviews" className="mt-24 pt-16 border-t border-neutral-900 scroll-mt-16">
      {/* Judge.me Client Preloader Script */}
      {isRealPublicToken && (
        <>
          <script
            id="judgeme-config"
            dangerouslySetInnerHTML={{
              __html: `window.jdgm=window.jdgm||{};window.jdgm.SHOP_DOMAIN=${JSON.stringify(shopDomain)};window.jdgm.PLATFORM='shopify';window.jdgm.PUBLIC_TOKEN=${JSON.stringify(publicToken)};`,
            }}
          />
          <Script
            src="https://cdn.judge.me/widget_preloader.js"
            strategy="afterInteractive"
          />
        </>
      )}

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
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-8 gap-4">
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

      {/* Optional Compact Star Breakdown Bar if reviews exist */}
      {reviews.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 bg-neutral-900/30 border border-neutral-800/60 mb-8 rounded text-xs font-mono text-neutral-400">
          {[5, 4, 3, 2, 1].map((s) => {
            const pct = Math.round((starCounts[s] / reviews.length) * 100);
            return (
              <div key={s} className="flex items-center gap-2">
                <span className="text-[10px] text-neutral-500">{s}★</span>
                <div className="flex-1 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-neutral-300 rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-[10px] text-neutral-500">{pct}%</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Render review cards with consistent heights */}
      {reviews.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {paginatedReviews.map((rev) => (
              <div
                key={rev.id}
                className="p-6 bg-neutral-900/40 border border-neutral-800/80 rounded flex flex-col justify-between h-full space-y-4"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      {rev.author && (
                        <span className="text-xs font-medium text-white block">{rev.author}</span>
                      )}
                      {rev.verifiedBuyer && (
                        <span className="text-[10px] text-emerald-400 uppercase tracking-wider font-mono">
                          ✓ Verified Patron
                        </span>
                      )}
                    </div>
                    {rev.date && (
                      <span className="text-[11px] text-neutral-500 font-mono">{rev.date}</span>
                    )}
                  </div>

                  <div className="text-xs text-[#ffcc00] tracking-wider mb-2">
                    {'★'.repeat(rev.rating)}
                    <span className="text-neutral-700">{'★'.repeat(Math.max(0, 5 - rev.rating))}</span>
                  </div>

                  {rev.title && rev.title.trim().toLowerCase() !== 'review' && (
                    <h4 className="text-xs font-semibold text-neutral-200 mb-2">{rev.title}</h4>
                  )}

                  {rev.content && (
                    <p className="text-xs text-neutral-400 font-light leading-relaxed">
                      &ldquo;{rev.content}&rdquo;
                    </p>
                  )}
                </div>

                {rev.fitFeedback && (
                  <p className="text-[10px] uppercase tracking-wider text-neutral-400 pt-3 border-t border-neutral-800/60 font-mono">
                    Fit: <span className="text-neutral-300">{rev.fitFeedback}</span>
                  </p>
                )}
              </div>
            ))}
          </div>

          {displayReviews.length > visibleCount && (
            <div className="text-center mb-12">
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => prev + 6)}
                className="px-6 py-2.5 border border-neutral-800 hover:border-neutral-600 text-xs font-mono uppercase tracking-widest text-neutral-300 transition-colors"
              >
                View More Reviews ({displayReviews.length - visibleCount} remaining)
              </button>
            </div>
          )}
        </>
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
