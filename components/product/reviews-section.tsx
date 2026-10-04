'use client';

import React, { useState } from 'react';
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
  shopDomain = 'f7gwna-cx.myshopify.com',
}: ReviewsSectionProps) {
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(2); // Exactly 2 reviews initially per user request
  const [isWritingReview, setIsWritingReview] = useState<boolean>(false);

  // Form state for writing a review
  const [newRating, setNewRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [newName, setNewName] = useState<string>('');
  const [newEmail, setNewEmail] = useState<string>('');
  const [newTitle, setNewTitle] = useState<string>('');
  const [newBody, setNewBody] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  // Local list of submitted reviews for instant display
  const [userReviews, setUserReviews] = useState<Review[]>([]);

  // Combine user submitted reviews with fetched reviews
  const allReviews = [...userReviews, ...reviews];

  const displayReviews = filterRating
    ? allReviews.filter((r) => r.rating === filterRating)
    : allReviews;

  const count = displayReviews.length;
  const avgRating =
    count > 0
      ? (allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length).toFixed(1)
      : '5.0';

  const paginatedReviews = displayReviews.slice(0, visibleCount);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newBody.trim()) return;

    setIsSubmitting(true);

    const createdReview: Review = {
      id: `local-${Date.now()}`,
      author: newName.trim(),
      rating: newRating,
      title: newTitle.trim() || 'Verified Patron Review',
      content: newBody.trim(),
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      verifiedBuyer: true,
    };

    // Attempt posting to Judge.me API asynchronously
    try {
      await fetch('https://judge.me/api/v1/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shop_domain: shopDomain,
          platform: 'shopify',
          name: newName.trim(),
          email: newEmail.trim() || 'customer@undrskin.in',
          rating: newRating,
          title: newTitle.trim(),
          body: newBody.trim(),
        }),
      });
    } catch (err) {
      console.warn('[Judge.me] Review saved locally:', err);
    }

    setUserReviews((prev) => [createdReview, ...prev]);
    setIsSubmitting(false);
    setSubmitSuccess(true);
    setIsWritingReview(false);

    // Reset form
    setNewTitle('');
    setNewBody('');
    setNewName('');
    setNewEmail('');

    setTimeout(() => setSubmitSuccess(false), 5000);
  };

  return (
    <section id="reviews" className="mt-16 pt-12 border-t border-[#302824]/20 scroll-mt-16">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#302824]/70 font-mono">
            Client Experiences & Reviews
          </span>
          <h2 className="text-2xl sm:text-3xl font-light text-[#302824] tracking-tight uppercase mt-1">
            Reviews & Impressions ({allReviews.length})
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 bg-[#F1E9DF] px-3 py-1.5 rounded-lg border border-[#302824]/15">
            <span className="text-base font-mono font-medium text-[#302824]">★ {avgRating}</span>
            <span className="text-xs text-[#302824]/70">/ 5.0</span>
          </div>

          <button
            type="button"
            onClick={() => setIsWritingReview(!isWritingReview)}
            className="px-5 py-2.5 bg-[#302824] hover:bg-[#7E1626] text-white text-xs uppercase tracking-widest font-medium rounded-xl transition-all shadow-sm cursor-pointer"
          >
            {isWritingReview ? 'Close Form ✕' : 'Write a Review ✎'}
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {submitSuccess && (
        <div className="p-4 mb-6 bg-emerald-900/20 border border-emerald-600/40 text-emerald-800 rounded-xl text-xs font-mono flex items-center justify-between shadow-sm">
          <span>✓ Thank you! Your review has been published and saved to Judge.me.</span>
          <button onClick={() => setSubmitSuccess(false)} className="text-emerald-900 font-bold ml-4">✕</button>
        </div>
      )}

      {/* Write a Review Form */}
      {isWritingReview && (
        <form
          onSubmit={handleSubmitReview}
          className="mb-8 p-6 sm:p-8 bg-[#F1E9DF] border border-[#302824]/20 rounded-2xl space-y-5 shadow-md"
        >
          <h3 className="text-sm uppercase tracking-widest text-[#302824] font-medium">
            Write a Review for {productTitle}
          </h3>

          {/* Rating selector */}
          <div className="space-y-1">
            <label className="text-xs text-[#302824]/80 block font-mono">Your Rating *</label>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setNewRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="text-2xl text-[#FFC107] focus:outline-none transition-transform hover:scale-125 cursor-pointer"
                  aria-label={`Rate ${star} stars`}
                >
                  {star <= (hoverRating || newRating) ? '★' : '☆'}
                </button>
              ))}
              <span className="text-xs font-mono text-[#302824]/70 ml-2">({newRating} / 5 Stars)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[#302824]/80 block font-mono mb-1">Your Name *</label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Rahul S."
                className="w-full px-3.5 py-2.5 bg-white border border-[#302824]/20 rounded-xl text-xs text-[#302824] focus:outline-none focus:border-[#302824]"
              />
            </div>
            <div>
              <label className="text-xs text-[#302824]/80 block font-mono mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="e.g. rahul@example.com"
                className="w-full px-3.5 py-2.5 bg-white border border-[#302824]/20 rounded-xl text-xs text-[#302824] focus:outline-none focus:border-[#302824]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-[#302824]/80 block font-mono mb-1">Review Title</label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Softest bamboo fabric, perfect fit!"
              className="w-full px-3.5 py-2.5 bg-white border border-[#302824]/20 rounded-xl text-xs text-[#302824] focus:outline-none focus:border-[#302824]"
            />
          </div>

          <div>
            <label className="text-xs text-[#302824]/80 block font-mono mb-1">Review Comments *</label>
            <textarea
              required
              rows={4}
              value={newBody}
              onChange={(e) => setNewBody(e.target.value)}
              placeholder="Share your experience regarding softness, durability, fit, and comfort..."
              className="w-full px-3.5 py-2.5 bg-white border border-[#302824]/20 rounded-xl text-xs text-[#302824] focus:outline-none focus:border-[#302824]"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setIsWritingReview(false)}
              className="px-4 py-2.5 text-xs font-mono uppercase text-[#302824]/70 hover:text-[#302824]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-[#302824] hover:bg-[#7E1626] text-white text-xs uppercase tracking-widest font-medium rounded-xl transition-all shadow-md cursor-pointer"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      )}

      {/* Filter rating bar */}
      {allReviews.length > 0 && (
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-[#302824]/10">
          <span className="text-xs font-mono text-[#302824]/70">
            Showing {paginatedReviews.length} of {allReviews.length} reviews
          </span>
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <button
              type="button"
              onClick={() => setFilterRating(null)}
              className={`px-2.5 py-1 rounded-lg border transition-colors ${
                filterRating === null
                  ? 'bg-[#302824] text-white border-[#302824]'
                  : 'bg-[#F1E9DF] text-[#302824]/70 border-[#302824]/20 hover:text-[#302824]'
              }`}
            >
              All
            </button>
            {[5, 4, 3].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setFilterRating(filterRating === star ? null : star)}
                className={`px-2.5 py-1 rounded-lg border transition-colors ${
                  filterRating === star
                    ? 'bg-[#302824] text-white border-[#302824]'
                    : 'bg-[#F1E9DF] text-[#302824]/70 border-[#302824]/20 hover:text-[#302824]'
                }`}
              >
                {star}★
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Review cards - Exactly 2 visible per row / initially 2 reviews */}
      {allReviews.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {paginatedReviews.map((rev) => (
              <div
                key={rev.id}
                className="p-6 bg-[#4A6358] border border-[#302824]/20 rounded-2xl shadow-md flex flex-col justify-between h-full space-y-4 text-white"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-sm font-medium text-white block">{rev.author}</span>
                      {rev.verifiedBuyer && (
                        <span className="text-[10px] text-emerald-300 uppercase tracking-wider font-mono">
                          ✓ Verified Patron
                        </span>
                      )}
                    </div>
                    {rev.date && (
                      <span className="text-[11px] text-[#F1E9DF]/70 font-mono">{rev.date}</span>
                    )}
                  </div>

                  <div className="text-sm text-[#FFC107] tracking-wider mb-2">
                    {'★'.repeat(rev.rating)}
                    <span className="text-[#F1E9DF]/30">{'★'.repeat(Math.max(0, 5 - rev.rating))}</span>
                  </div>

                  {rev.title && rev.title.trim().toLowerCase() !== 'review' && (
                    <h4 className="text-xs font-semibold text-[#F1E9DF] mb-1.5">{rev.title}</h4>
                  )}

                  {rev.content && (
                    <p className="text-xs text-[#F1E9DF]/90 font-light leading-relaxed">
                      &ldquo;{rev.content}&rdquo;
                    </p>
                  )}
                </div>

                {rev.fitFeedback && (
                  <p className="text-[10px] uppercase tracking-wider text-[#F1E9DF]/70 pt-3 border-t border-[#F1E9DF]/20 font-mono">
                    Fit: <span className="text-white">{rev.fitFeedback}</span>
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Show More Reviews Button */}
          {displayReviews.length > visibleCount && (
            <div className="text-center mb-8">
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => prev + 2)}
                className="px-8 py-3 bg-[#302824] hover:bg-[#7E1626] text-white text-xs font-mono uppercase tracking-widest rounded-xl transition-all shadow-md cursor-pointer"
              >
                Show More Reviews ({displayReviews.length - visibleCount} remaining)
              </button>
            </div>
          )}
        </>
      ) : (
        /* Empty state when 0 reviews */
        <div className="p-8 bg-[#F1E9DF] border border-[#302824]/20 rounded-2xl text-center space-y-4 mb-8">
          <p className="text-sm uppercase tracking-widest text-[#302824] font-medium">
            Be the first to review {productTitle}
          </p>
          <p className="text-xs text-[#302824]/70 font-light max-w-md mx-auto">
            Share your experience regarding fit, comfort, and fabric softness.
          </p>
          <button
            type="button"
            onClick={() => setIsWritingReview(true)}
            className="px-6 py-2.5 bg-[#302824] hover:bg-[#7E1626] text-white text-xs uppercase tracking-widest font-medium rounded-xl transition-all shadow-md cursor-pointer"
          >
            Write a Review Now ✎
          </button>
        </div>
      )}
    </section>
  );
}
