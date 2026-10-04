'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface BackButtonProps {
  label?: string;
  fallbackUrl?: string;
  className?: string;
}

export function BackButton({ label = 'Back', fallbackUrl = '/', className = '' }: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackUrl);
    }
  };

  return (
    <button
      onClick={handleBack}
      className={`inline-flex items-center space-x-2 text-xs uppercase tracking-widest text-neutral-400 hover:text-white transition-colors group cursor-pointer py-1 ${className}`}
      aria-label="Go back to previous page"
    >
      <span className="text-sm transition-transform duration-200 group-hover:-translate-x-1 font-mono">←</span>
      <span className="font-mono text-[11px]">{label}</span>
    </button>
  );
}
