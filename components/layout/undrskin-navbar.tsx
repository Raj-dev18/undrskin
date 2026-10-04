'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/components/cart/cart-context';
import { MobileNav } from '@/components/layout/mobile-nav';

const DESKTOP_NAV_LINKS = [
  { label: 'THE FABRIC', href: '/#fabric' },
  { label: 'THE FIT', href: '/#fit' },
  { label: 'BUY', href: '/#trios' },
  { label: 'YOUR VOICE', href: '/#reviews' },
  { label: 'HIPSTER', href: '/collections' },
];

export function UndrSkinNavbar() {
  const { cart, openCart } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header
        className={`site-header sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled
            ? 'bg-[#F1E9DF]/90 border-b border-[#302824]/15 shadow-xs'
            : 'bg-[#F1E9DF]/80 border-b border-[#302824]/10'
        }`}
        style={{
          WebkitBackdropFilter: 'blur(18px) saturate(130%)',
          backdropFilter: 'blur(18px) saturate(130%)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Left: Mobile Hamburger Toggle (Mobile) or Logo (Desktop) */}
            <div className="flex items-center space-x-4">
              {/* Mobile Hamburger Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 text-[#302824] hover:text-[#7E1626] transition-colors focus:outline-none"
                aria-label="Open navigation menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5" />
                </svg>
              </button>

              {/* Desktop Logo on Left */}
              <div className="hidden lg:flex items-center">
                <Link href="/" className="flex items-center space-x-2.5 hover:opacity-90 transition-opacity" aria-label="UndrSkin home">
                  <img
                    src="https://undrskin.in/cdn/shop/files/Gemini_Generated_Image_5wr4kj5wr4kj5wr4_1.png?v=1784465127"
                    alt="UndrSkin"
                    className="h-10 sm:h-12 w-auto object-contain"
                  />
                </Link>
              </div>
            </div>

            {/* Center: Mobile Large Centered Brand Logo (Mobile) or Desktop Nav Links */}
            <div className="flex items-center justify-center">
              {/* Mobile Logo Centered */}
              <div className="lg:hidden flex items-center justify-center">
                <Link href="/" className="flex items-center hover:opacity-90 transition-opacity" aria-label="UndrSkin home">
                  <img
                    src="https://undrskin.in/cdn/shop/files/Gemini_Generated_Image_5wr4kj5wr4kj5wr4_1.png?v=1784465127"
                    alt="UndrSkin"
                    className="h-10 sm:h-12 w-auto object-contain"
                  />
                </Link>
              </div>

              {/* Desktop Center Navigation Links */}
              <nav className="hidden lg:flex items-center space-x-8 text-xs uppercase tracking-[0.22em] font-mono text-[#302824]/80">
                {DESKTOP_NAV_LINKS.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="relative py-1 text-[#302824]/80 hover:text-[#7E1626] transition-colors group"
                  >
                    <span>{link.label}</span>
                    <span className="absolute left-0 right-full bottom-0 h-px bg-[#B96F73] transition-all duration-300 group-hover:right-0" />
                  </Link>
                ))}
              </nav>
            </div>

            {/* Right: User Account Icon + Shopping Bag Icon with Count Badge */}
            <div className="flex items-center space-x-4">
              {/* Account Profile Icon */}
              <Link
                href="/account"
                className="p-1.5 text-[#302824]/85 hover:text-[#7E1626] transition-colors"
                aria-label="Account profile"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </Link>

              {/* Shopping Bag Icon with Badge */}
              <button
                onClick={openCart}
                className="relative p-1.5 text-[#302824]/85 hover:text-[#7E1626] transition-colors cursor-pointer"
                aria-label={`Open shopping bag (${cart.totalQuantity} items)`}
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
                </svg>
                {cart.totalQuantity > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-4.5 h-4.5 px-1 rounded-full bg-[#302824] text-[#F1E9DF] text-[10px] font-mono font-bold flex items-center justify-center">
                    {cart.totalQuantity}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer (4 Navigation Items: HOME, HIPSTER, YOUR VOICE, FAQ & HELP) */}
      <MobileNav isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  );
}
