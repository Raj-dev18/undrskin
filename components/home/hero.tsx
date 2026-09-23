'use client';

import React from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';

const ThreeCanvas = dynamic(
  () => import('@/components/ui/three-canvas').then((mod) => mod.ThreeCanvas),
  { ssr: false }
);

export function Hero() {
  return (
    <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden bg-neutral-950 px-4 sm:px-6 lg:px-8">
      {/* Dynamic Three.js ambient accent */}
      <ThreeCanvas />

      {/* Radial soft ambient background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.04)_0%,transparent_70%)] pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-6"
        >
          <span className="inline-block text-[10px] sm:text-xs uppercase tracking-[0.35em] text-neutral-400 font-mono">
            Fall / Winter 2026 Architectural Intimates
          </span>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extralight tracking-tight text-white uppercase leading-[1.08]">
            Second skin, <br />
            <span className="font-light italic font-serif">first nature.</span>
          </h1>

          <p className="max-w-xl mx-auto text-xs sm:text-sm text-neutral-400 font-light leading-relaxed">
            Engineered foundational garments crafted from weightless raw silk and Lenzing Modal.
            Designed to sculpt without constraint.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/collections"
              className="w-full sm:w-auto px-8 py-3.5 bg-white text-black text-xs uppercase tracking-widest font-medium hover:bg-neutral-200 transition-all text-center"
            >
              Explore Collection
            </Link>
            <Link
              href="/collections/core-essentials"
              className="w-full sm:w-auto px-8 py-3.5 border border-neutral-700 text-white text-xs uppercase tracking-widest hover:border-white transition-all text-center"
            >
              Core Essentials
            </Link>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center space-y-2 pointer-events-none"
        >
          <span className="text-[9px] uppercase tracking-[0.3em] text-neutral-400 font-mono">
            Scroll to Discover
          </span>
          <div className="w-[1px] h-8 bg-gradient-to-b from-neutral-500 to-transparent animate-pulse" />
        </motion.div>
      </div>
    </section>
  );
}
