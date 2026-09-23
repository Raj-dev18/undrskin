'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-neutral-950 text-neutral-400 border-t border-neutral-900 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-16 border-b border-neutral-900">

          <div className="md:col-span-4 space-y-4">
            <span className="font-extralight tracking-[0.3em] text-lg text-white uppercase inline-block">
              UNDRSKIN
            </span>
            <p className="text-xs leading-relaxed text-neutral-400 font-light max-w-sm">
              An architectural exploration of foundational dressing. We design body-hugging minimalist second-skin layers that breathe, mold, and adapt effortlessly to everyday life.
            </p>
            <div className="pt-2">
              <span className="inline-block text-[11px] uppercase tracking-widest text-neutral-500 border border-neutral-800 px-2.5 py-1">
                OEKO-TEX® & Carbon Neutral
              </span>
            </div>
          </div>


          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs uppercase tracking-[0.2em] text-neutral-200 font-medium">Collections</h4>
            <ul className="space-y-2.5 text-xs font-light">
              <li>
                <Link href="/collections" className="hover:text-white transition-colors">
                  All Silhouettes
                </Link>
              </li>
              <li>
                <Link href="/collections/core-essentials" className="hover:text-white transition-colors">
                  Core Essentials
                </Link>
              </li>
              <li>
                <Link href="/collections/silk-modal" className="hover:text-white transition-colors">
                  Silk & Modal
                </Link>
              </li>
              <li>
                <Link href="/collections/contour-sculpt" className="hover:text-white transition-colors">
                  Contour Sculpt
                </Link>
              </li>
              <li>
                <Link href="/collections/new-arrivals" className="hover:text-white transition-colors">
                  New Arrivals
                </Link>
              </li>
            </ul>
          </div>


          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs uppercase tracking-[0.2em] text-neutral-200 font-medium">Client Care</h4>
            <ul className="space-y-2.5 text-xs font-light">
              <li>
                <Link href="/faq" className="hover:text-white transition-colors">
                  FAQ & Care Guide
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition-colors">
                  Shipping & Delivery
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition-colors">
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <a href="mailto:care@undrskin.studio" className="hover:text-white transition-colors">
                  care@undrskin.studio
                </a>
              </li>
            </ul>
          </div>


          <div className="md:col-span-4 space-y-4">
            <h4 className="text-xs uppercase tracking-[0.2em] text-neutral-200 font-medium">Privilege List</h4>
            <p className="text-xs text-neutral-400 font-light leading-relaxed">
              Subscribe to receive intimate access to limited capsule releases, private previews, and material dispatches.
            </p>
            {subscribed ? (
              <p className="text-xs text-neutral-300 font-light italic">
                Welcome to the inner circle. Your confirmation has been dispatched.
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="bg-neutral-900 border border-neutral-800 text-xs px-3.5 py-2.5 text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500 w-full"
                />
                <button
                  type="submit"
                  className="bg-neutral-100 hover:bg-white text-neutral-950 text-xs uppercase tracking-widest font-medium px-5 py-2.5 transition-colors whitespace-nowrap"
                >
                  Join
                </button>
              </form>
            )}
          </div>
        </div>


        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] font-light text-neutral-500 gap-4">
          <p>© {new Date().getFullYear()} UNDRSKIN STUDIO INC. ALL RIGHTS RESERVED.</p>
          <div className="flex items-center space-x-6">
            <span>TERMS OF SERVICE</span>
            <span>PRIVACY DISCLOSURE</span>
            <span>ACCESSIBILITY</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
