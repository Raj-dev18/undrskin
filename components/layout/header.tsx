'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Collection } from '@/types/product';
import { useCart } from '@/components/cart/cart-context';
import { MobileNav } from '@/components/layout/mobile-nav';
import { SearchModal } from '@/components/ui/search-modal';

interface HeaderProps {
  collections?: Collection[];
}

export function Header({ collections = [] }: HeaderProps) {
  const { cart, openCart } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Display first 4 collections or standard directory
  const navCollections = collections.slice(0, 4);

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled
            ? 'bg-neutral-950/85 backdrop-blur-md border-b border-neutral-900 shadow-sm'
            : 'bg-transparent border-b border-white/5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Mobile menu trigger */}
            <div className="flex items-center lg:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 -ml-2 text-neutral-300 hover:text-white"
                aria-label="Open navigation menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              </button>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8 text-xs uppercase tracking-[0.2em] text-neutral-300">
              <Link href="/collections" className="hover:text-white transition-colors">
                All Silhouettes
              </Link>
              {navCollections.map((col) => (
                <Link
                  key={col.handle}
                  href={`/collections/${col.handle}`}
                  className="hover:text-white transition-colors"
                >
                  {col.title}
                </Link>
              ))}
              <Link href="/faq" className="hover:text-white transition-colors">
                Client Care
              </Link>
            </nav>

            {/* Logo */}
            <div className="flex justify-center">
              <Link
                href="/"
                className="font-extralight tracking-[0.35em] text-xl sm:text-2xl text-white uppercase hover:opacity-90 transition-opacity"
              >
                UNDRSKIN
              </Link>
            </div>

            {/* Actions: Search & Bag */}
            <div className="flex items-center space-x-4 sm:space-x-6 text-xs uppercase tracking-widest text-neutral-300">
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 text-neutral-300 hover:text-white transition-colors flex items-center space-x-1"
                aria-label="Search items"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="hidden sm:inline">Search</span>
              </button>

              <Link
                href="/account"
                className="p-2 text-neutral-300 hover:text-white transition-colors flex items-center space-x-1"
                aria-label="Account"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
                <span className="hidden sm:inline">Account</span>
              </Link>

              <button
                onClick={openCart}
                className="p-2 text-neutral-300 hover:text-white transition-colors flex items-center space-x-1"
                aria-label="Open cart"
              >
                <span>Bag</span>
                <span className="text-xs font-mono font-medium ml-0.5">
                  ({cart.totalQuantity})
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <MobileNav
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onOpenSearch={() => setSearchOpen(true)}
        collections={collections}
      />

      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </>
  );
}
