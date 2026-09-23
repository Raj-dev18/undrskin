'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FAQItem } from '@/types/product';

interface ProductFaqPreviewProps {
  faqs: FAQItem[];
}

export function ProductFaqPreview({ faqs }: ProductFaqPreviewProps) {
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  if (!faqs || faqs.length === 0) return null;

  return (
    <section className="mt-20 pt-16 border-t border-neutral-900">
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-8 gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-400 font-mono">
            Client Guidance
          </span>
          <h3 className="text-2xl font-light text-white tracking-tight uppercase mt-1">
            Questions & Fitting Advice
          </h3>
        </div>
        <Link
          href="/faq"
          className="text-xs uppercase tracking-widest text-neutral-400 hover:text-white underline underline-offset-4"
        >
          View Full FAQ & Care Guide →
        </Link>
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
                className="w-full p-4 sm:p-5 flex items-center justify-between text-left text-xs uppercase tracking-widest text-neutral-200 hover:text-white"
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
    </section>
  );
}
