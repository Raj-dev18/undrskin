'use client';

import React, { useState } from 'react';
import { FAQItem } from '@/types/product';

interface ClientFaqProps {
  faqs: FAQItem[];
}

export function ClientFaqAccordion({ faqs }: ClientFaqProps) {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [search, setSearch] = useState('');

  const categories = ['All', ...Array.from(new Set(faqs.map((f) => f.category || 'General')))];

  const filtered = faqs.filter((faq) => {
    const matchesCategory = activeCategory === 'All' || (faq.category || 'General') === activeCategory;
    const matchesSearch =
      !search.trim() ||
      faq.question.toLowerCase().includes(search.toLowerCase()) ||
      faq.answer.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Category Pills & Search Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-900">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 text-xs uppercase tracking-wider border transition-all whitespace-nowrap ${
                activeCategory === cat
                  ? 'border-white text-white bg-neutral-900'
                  : 'border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <input
          type="search"
          placeholder="Filter questions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-neutral-900 border border-neutral-800 text-xs px-3.5 py-2 text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-600 sm:w-56"
        />
      </div>

      {/* Accordion Questions */}
      {filtered.length === 0 ? (
        <div className="py-12 text-center text-xs text-neutral-400 font-mono">
          No questions found matching your filter.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((faq) => (
            <details
              key={faq.id}
              className="group bg-neutral-900/30 border border-neutral-800/80 p-6 transition-all duration-300 open:border-neutral-700"
            >
              <summary className="flex items-center justify-between cursor-pointer list-none text-xs uppercase tracking-widest text-neutral-200 group-hover:text-white select-none">
                <span className="pr-6 leading-relaxed font-normal">{faq.question}</span>
                <span className="text-neutral-500 group-hover:text-white transition-transform duration-300 group-open:rotate-45 font-mono text-base flex-shrink-0">
                  +
                </span>
              </summary>
              <div className="mt-4 text-xs font-light text-neutral-400 leading-relaxed pt-4 border-t border-neutral-800/60 space-y-2">
                <p>{faq.answer}</p>
                {faq.category && (
                  <span className="inline-block text-[10px] uppercase tracking-wider font-mono text-neutral-500 pt-1">
                    Category: {faq.category}
                  </span>
                )}
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
