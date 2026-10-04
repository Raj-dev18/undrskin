'use client';

import React from 'react';
import Link from 'next/link';
import { Collection } from '@/types/product';

interface FooterProps {
  collections?: Collection[];
}

export function Footer({ collections = [] }: FooterProps) {
  return (
    <footer className="site-footer bg-[#A6C7B7] text-[#302824] border-t border-[#302824]/15 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-8 md:gap-12 pb-16 border-b border-[#302824]/15">

          <div className="col-span-2 md:col-span-3 space-y-4">
            <img
              src="https://undrskin.in/cdn/shop/files/Gemini_Generated_Image_5wr4kj5wr4kj5wr4_1.png?v=1784465127"
              alt="UndrSkin"
              className="h-10 w-auto object-contain"
            />
            <p className="text-xs leading-relaxed text-[#302824]/80 font-light max-w-sm">
              Skin-first bamboo essentials designed for softness, breathability, and everyday comfort.
            </p>
            <span className="inline-block text-[10px] tracking-[0.2em] uppercase text-[#302824]/60 font-mono">
              Made in India · 95% Bamboo · 5% Spandex
            </span>
          </div>

          <div className="col-span-1 md:col-span-2 space-y-3">
            <h4 className="text-xs uppercase tracking-[0.22em] text-[#302824] font-medium">Shop</h4>
            <ul className="space-y-2.5 text-xs font-light text-[#302824]/80">
              <li>
                <Link href="/collections" className="hover:text-[#7E1626] transition-colors">
                  All Collections
                </Link>
              </li>
              <li>
                <Link href="/#trios" className="hover:text-[#7E1626] transition-colors">
                  The Four Trios
                </Link>
              </li>
              <li>
                <Link href="/#buy" className="hover:text-[#7E1626] transition-colors">
                  Bamboo Hipster
                </Link>
              </li>
              <li>
                <Link href="/#reviews" className="hover:text-[#7E1626] transition-colors">
                  Client Reviews
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-span-1 md:col-span-2 space-y-3">
            <h4 className="text-xs uppercase tracking-[0.22em] text-[#302824] font-medium">Help</h4>
            <ul className="space-y-2.5 text-xs font-light text-[#302824]/80">
              <li>
                <Link href="/faq" className="hover:text-[#7E1626] transition-colors">
                  FAQ &amp; Care Guide
                </Link>
              </li>
              <li>
                <Link href="/policies/shipping" className="hover:text-[#7E1626] transition-colors">
                  Shipping &amp; Delivery
                </Link>
              </li>
              <li>
                <Link href="/policies/refunds" className="hover:text-[#7E1626] transition-colors">
                  Returns &amp; Refunds
                </Link>
              </li>
              <li>
                <Link href="/policies/contact" className="hover:text-[#7E1626] transition-colors">
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-span-1 md:col-span-2 space-y-3">
            <h4 className="text-xs uppercase tracking-[0.22em] text-[#302824] font-medium">Policies</h4>
            <ul className="space-y-2.5 text-xs font-light text-[#302824]/80">
              <li><Link href="/policies/privacy" className="hover:text-[#7E1626] transition-colors">Privacy Policy</Link></li>
              <li><Link href="/policies/terms" className="hover:text-[#7E1626] transition-colors">Terms of Service</Link></li>
              <li><Link href="/policies/shipping" className="hover:text-[#7E1626] transition-colors">Shipping Policy</Link></li>
              <li><Link href="/policies/refunds" className="hover:text-[#7E1626] transition-colors">Refund &amp; Return Policy</Link></li>
              <li><Link href="/policies/legal" className="hover:text-[#7E1626] transition-colors">Legal Notice</Link></li>
              <li><Link href="/policies/contact" className="hover:text-[#7E1626] transition-colors">Contact Information</Link></li>
            </ul>
          </div>

          <div className="col-span-1 md:col-span-3 space-y-4">
            <h4 className="text-xs uppercase tracking-[0.22em] text-[#302824] font-medium">Elsewhere</h4>
            <p className="text-xs text-[#302824]/80 font-light leading-relaxed">
              Available directly or via our official marketplace storefronts.
            </p>
            <div className="flex flex-col space-y-2 text-xs text-[#302824]/85">
              <a href="https://www.amazon.in/stores/UndrSkin/page/061AD50D-1279-42A1-AB1F-50E480F55AAB" target="_blank" rel="noopener noreferrer" className="hover:text-[#7E1626] transition-colors">Amazon Store ↗</a>
              <a href="https://www.instagram.com/undrskin.in/" target="_blank" rel="noopener noreferrer" className="hover:text-[#7E1626] transition-colors">Instagram ↗</a>
              <a href="https://www.linkedin.com/company/undrskin/" target="_blank" rel="noopener noreferrer" className="hover:text-[#7E1626] transition-colors">LinkedIn ↗</a>
              <a href="https://www.facebook.com/people/Undrskin-Apparels/61574395374430/" target="_blank" rel="noopener noreferrer" className="hover:text-[#7E1626] transition-colors">Facebook ↗</a>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] font-light text-[#302824]/70 gap-4">
          <p>© {new Date().getFullYear()} UNDRSKIN STUDIO INC. ALL RIGHTS RESERVED.</p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link href="/policies/terms" className="hover:text-[#302824] transition-colors">TERMS OF SERVICE</Link>
            <Link href="/policies/privacy" className="hover:text-[#302824] transition-colors">PRIVACY POLICY</Link>
            <Link href="/policies/refunds" className="hover:text-[#302824] transition-colors">REFUND POLICY</Link>
            <Link href="/policies/shipping" className="hover:text-[#302824] transition-colors">SHIPPING POLICY</Link>
            <Link href="/policies/legal" className="hover:text-[#302824] transition-colors">LEGAL NOTICE</Link>
            <Link href="/policies/contact" className="hover:text-[#302824] transition-colors">CONTACT</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
