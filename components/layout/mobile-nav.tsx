'use client';

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSearch?: () => void;
}

export function MobileNav({ isOpen, onClose, onOpenSearch }: MobileNavProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        >
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-y-0 left-0 w-full max-w-xs bg-[#F1E9DF] text-[#302824] border-r border-[#302824]/15 p-6 flex flex-col justify-between shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-8">
              {/* Header inside mobile drawer */}
              <div className="flex items-center justify-between border-b border-[#302824]/15 pb-4">
                <Link
                  href="/"
                  onClick={onClose}
                  className="flex items-center space-x-2"
                >
                  <img
                    src="https://undrskin.in/cdn/shop/files/Gemini_Generated_Image_5wr4kj5wr4kj5wr4_1.png?v=1784465127"
                    alt="UndrSkin"
                    className="h-9 w-auto object-contain"
                  />
                </Link>
                <button
                  onClick={onClose}
                  aria-label="Close navigation"
                  className="p-2 text-[#302824]/70 hover:text-[#302824] transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Navigation Items (The 4 brand navigation items) */}
              <nav className="space-y-6">
                <span className="text-[10px] uppercase tracking-[0.28em] text-[#302824]/60 font-mono block mb-4">
                  Navigation
                </span>
                <ul className="space-y-5">
                  <li>
                    <Link
                      href="/"
                      onClick={onClose}
                      className="text-base font-medium uppercase tracking-[0.2em] text-[#302824] hover:text-[#7E1626] transition-colors flex items-center justify-between"
                    >
                      <span>HOME</span>
                      <span className="text-xs text-[#302824]/40 font-mono">01</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/collections"
                      onClick={onClose}
                      className="text-base font-medium uppercase tracking-[0.2em] text-[#302824] hover:text-[#7E1626] transition-colors flex items-center justify-between"
                    >
                      <span>HIPSTER</span>
                      <span className="text-xs text-[#302824]/40 font-mono">02</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/#reviews"
                      onClick={onClose}
                      className="text-base font-medium uppercase tracking-[0.2em] text-[#302824] hover:text-[#7E1626] transition-colors flex items-center justify-between"
                    >
                      <span>YOUR VOICE</span>
                      <span className="text-xs text-[#302824]/40 font-mono">03</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/faq"
                      onClick={onClose}
                      className="text-base font-medium uppercase tracking-[0.2em] text-[#302824] hover:text-[#7E1626] transition-colors flex items-center justify-between"
                    >
                      <span>FAQ &amp; HELP</span>
                      <span className="text-xs text-[#302824]/40 font-mono">04</span>
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>

            {/* Bottom Currency & Account Link */}
            <div className="border-t border-[#302824]/15 pt-6 space-y-4">
              <Link
                href="/account"
                onClick={onClose}
                className="flex items-center space-x-2 text-xs uppercase tracking-widest text-[#302824]/80 hover:text-[#7E1626] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>My Account</span>
              </Link>
              <div className="flex items-center justify-between text-[11px] text-[#302824]/60 font-mono">
                <span>CURRENCY</span>
                <span className="text-[#302824] font-bold">INR (₹)</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
