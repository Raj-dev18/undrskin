'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/components/cart/cart-context';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_LINKS = [
  { label: 'THE FABRIC', href: '/#fabric', targetId: 'fabric' },
  { label: 'THE FIT', href: '/#fit', targetId: 'fit' },
  { label: 'BUY', href: '/#trios', targetId: 'trios' },
  { label: 'YOUR VOICE', href: '/#reviews', targetId: 'reviews' },
  { label: 'HIPSTER', href: '/collections', targetId: null },
];

export function UndrSkinNavbar() {
  const { cart, openCart } = useCart();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // The home page uses the canonical embedded UndrSkin experience, which
  // owns its own single navbar. Other routes use this shared shell navbar.
  if (pathname === '/') return null;

  const handleNavClick = (link: typeof NAV_LINKS[0], e: React.MouseEvent) => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header
        className={`site-header sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled
            ? 'bg-[#F1E9DF]/26 border-b border-[#302824]/16 shadow-xs'
            : 'bg-[#F1E9DF]/14 border-b border-[#F1E9DF]/30'
        }`}
        style={{
          WebkitBackdropFilter: 'blur(18px) saturate(130%)',
          backdropFilter: 'blur(18px) saturate(130%)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo on Left */}
            <div className="flex items-center">
              <Link
                href="/"
                className="flex items-center space-x-2.5 hover:opacity-90 transition-opacity"
                aria-label="UndrSkin home"
              >
                <img
                  src="https://undrskin.in/cdn/shop/files/Gemini_Generated_Image_5wr4kj5wr4kj5wr4_1.png?v=1784465127"
                  alt="UndrSkin"
                  className="h-9 sm:h-11 w-auto object-contain"
                />
              </Link>
            </div>

            {/* Center Reference Nav Links (Desktop) */}
            <nav className="hidden lg:flex items-center space-x-8 text-xs uppercase tracking-[0.22em] font-mono text-[#302824]/80">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleNavClick(link, e)}
                  className="relative py-1 text-[#302824]/75 hover:text-[#7E1626] transition-colors group"
                >
                  <span>{link.label}</span>
                  <span className="absolute left-0 right-full bottom-0 h-px bg-[#B96F73] transition-all duration-300 group-hover:right-0" />
                </Link>
              ))}
            </nav>

            {/* Right: BAG Button + Mobile Toggle */}
            <div className="flex items-center space-x-3">
              {/* Reference Pill Bag Button */}
              <button
                onClick={openCart}
                className="inline-flex items-center space-x-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full border border-[rgba(48,40,36,0.22)] bg-transparent hover:border-[#B96F73] hover:bg-[#B96F73]/10 text-xs font-mono uppercase tracking-[0.18em] text-[#302824] transition-all cursor-pointer"
                aria-label={`Open shopping bag (${cart.totalQuantity} items)`}
              >
                <span className="font-medium text-[11px] sm:text-xs">BAG</span>
                <span className="min-w-4.5 h-4.5 px-1.5 rounded-full bg-[#7E1626] text-[#F3E4DD] text-[10px] font-mono font-bold flex items-center justify-center">
                  {cart.totalQuantity}
                </span>
              </button>

              {/* Mobile Menu Hamburger */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-lg text-[#302824]/70 hover:text-[#302824] hover:bg-[#302824]/5 transition-colors"
                aria-label="Open mobile navigation menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Clean Mobile Slide-Out Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            key="mobile-nav-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-y-0 left-0 w-full max-w-xs bg-[#F1E9DF] text-[#302824] p-6 shadow-2xl flex flex-col justify-between border-r border-[rgba(48,40,36,0.15)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-6 border-b border-[rgba(48,40,36,0.12)]">
                  <Link href="/" onClick={() => setMobileMenuOpen(false)} aria-label="UndrSkin home">
                    <img
                      src="https://undrskin.in/cdn/shop/files/Gemini_Generated_Image_5wr4kj5wr4kj5wr4_1.png?v=1784465127"
                      alt="UndrSkin"
                      className="h-8 w-auto object-contain"
                    />
                  </Link>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1 rounded-full text-[#302824]/60 hover:text-[#302824]"
                    aria-label="Close navigation menu"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Navigation Links */}
                <nav className="py-6 flex flex-col space-y-4">
                  {NAV_LINKS.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      onClick={(e) => handleNavClick(link, e)}
                      className="text-xs uppercase tracking-[0.22em] font-mono py-2 text-[#302824]/80 hover:text-[#7E1626] transition-colors border-b border-[rgba(48,40,36,0.06)]"
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Drawer Footer Actions */}
              <div className="pt-6 border-t border-[rgba(48,40,36,0.12)] space-y-3 font-mono text-xs">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openCart();
                  }}
                  className="w-full py-3 rounded-xl bg-[#302824] text-[#F1E9DF] text-xs uppercase tracking-widest font-semibold flex items-center justify-center space-x-2"
                >
                  <span>Shopping Bag</span>
                  <span>({cart.totalQuantity})</span>
                </button>
                <p className="text-[10px] text-center text-[#302824]/60 tracking-wider">
                  Skin-first essentials · Bamboo comfort
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
