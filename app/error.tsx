'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log technical error server-side / console without displaying raw stack to customers
    console.error('Captured Application Error:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-20 space-y-6">
      <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-500 font-mono">
        Transmission Interrupted
      </span>
      <h1 className="text-2xl sm:text-3xl font-light text-white tracking-widest uppercase">
        Temporary Connection Disruption
      </h1>
      <p className="text-xs text-neutral-400 font-light max-w-md leading-relaxed">
        Our studio catalog is currently updating its archive connection. Please retry or return to the main gallery.
      </p>
      <div className="pt-4 flex flex-wrap justify-center gap-4">
        <button
          onClick={() => reset()}
          className="px-6 py-3 bg-white text-black text-xs uppercase tracking-widest font-medium hover:bg-neutral-200 transition-colors"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="px-6 py-3 border border-neutral-700 text-white text-xs uppercase tracking-widest hover:border-white transition-colors"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
