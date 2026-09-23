'use client';

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { MOCK_COLLECTIONS } from '@/lib/mock-data';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSearch: () => void;
}

export function MobileNav({ isOpen, onClose, onOpenSearch }: MobileNavProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm lg:hidden"
        >
          <div className="fixed inset-y-0 left-0 w-full max-w-xs bg-neutral-950 border-r border-neutral-900 p-6 flex flex-col justify-between shadow-2xl">
            <div className="space-y-8">
              <div className="flex items-center justify-between border-b border-neutral-900 pb-4">
                <Link
                  href="/"
                  onClick={onClose}
                  className="font-extralight tracking-[0.28em] text-lg text-white uppercase"
                >
                  UNDRSKIN
                </Link>
                <button
                  onClick={onClose}
                  aria-label="Close navigation"
                  className="p-2 text-neutral-400 hover:text-white"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Search Shortcut */}
              <button
                onClick={() => {
                  onClose();
                  onOpenSearch();
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 bg-neutral-900 border border-neutral-800 text-neutral-400 text-xs tracking-wider uppercase hover:border-neutral-700 transition-colors"
              >
                <span>Search Silhouettes...</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {/* Collections Navigation */}
              <nav className="space-y-6">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-400 font-mono block mb-3">
                    Collections
                  </span>
                  <ul className="space-y-3 pl-1">
                    <li>
                      <Link
                        href="/collections"
                        onClick={onClose}
                        className="text-sm font-light uppercase tracking-widest text-neutral-300 hover:text-white transition-colors block"
                      >
                        All Silhouettes
                      </Link>
                    </li>
                    {MOCK_COLLECTIONS.map((c) => (
                      <li key={c.handle}>
                        <Link
                          href={`/collections/${c.handle}`}
                          onClick={onClose}
                          className="text-sm font-light uppercase tracking-widest text-neutral-400 hover:text-white transition-colors block"
                        >
                          {c.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-neutral-900">
                  <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-400 font-mono block mb-3">
                    Information
                  </span>
                  <ul className="space-y-3 pl-1 text-xs uppercase tracking-widest text-neutral-400">
                    <li>
                      <Link href="/faq" onClick={onClose} className="hover:text-white transition-colors">
                        Client Care & FAQ
                      </Link>
                    </li>
                    <li>
                      <Link href="/collections/core-essentials" onClick={onClose} className="hover:text-white transition-colors">
                        Material Philosophy
                      </Link>
                    </li>
                  </ul>
                </div>
              </nav>
            </div>

            {/* Bottom Currency & Contact */}
            <div className="border-t border-neutral-900 pt-6 space-y-3">
              <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono">
                <span>CURRENCY</span>
                <span className="text-white">USD ($)</span>
              </div>
              <p className="text-[11px] text-neutral-400 font-light">
                concierge@undrskin.studio
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
