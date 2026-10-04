'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setMessage('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    setMessage(null);

    try {
      // Send magic link or process login request
      const res = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: email }),
      });
      const data = await res.json();
      if (data.success || res.ok) {
        setMessage('Check your email for the access code.');
        setTimeout(() => {
          onClose();
          router.push('/account/profile');
        }, 1200);
      } else {
        // Fallback: direct to profile/account
        onClose();
        router.push('/account/profile');
      }
    } catch {
      onClose();
      router.push('/account/profile');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    window.location.href = '/api/auth/signin/google';
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          transition={{ type: 'tween', duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-md bg-white text-neutral-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-neutral-100 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with Title and Close X */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-neutral-900 tracking-tight">
              Sign in or create account
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-neutral-100 text-neutral-600 hover:bg-neutral-200 flex items-center justify-center transition-colors"
              aria-label="Close sign in dialog"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Continue with Google Pill Button */}
          <button
            onClick={handleGoogleSignIn}
            type="button"
            className="w-full py-3.5 px-6 rounded-full bg-[#EFEFEF] hover:bg-[#E5E5E5] text-neutral-900 font-medium text-sm sm:text-base flex items-center justify-center gap-3 transition-colors border border-transparent shadow-2xs"
          >
            <svg className="w-5 h-5 flex-none" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* OR Divider Line */}
          <div className="relative flex items-center justify-center my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200" />
            </div>
            <div className="relative bg-white px-3 text-xs uppercase tracking-widest text-neutral-400 font-mono">
              OR
            </div>
          </div>

          {/* Email Input Field with Right Arrow inside */}
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="relative w-full">
              <input
                type="email"
                required
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-full py-3.5 pl-6 pr-14 border border-neutral-300 text-sm sm:text-base text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 bg-white transition-colors"
              />
              <button
                type="submit"
                disabled={loading}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[#302824] hover:bg-[#7E1626] text-white flex items-center justify-center transition-colors disabled:opacity-50"
                aria-label="Submit email"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
            </div>
          </form>

          {message && (
            <p className="mt-3 text-xs text-center text-emerald-600 font-medium">
              {message}
            </p>
          )}

          {/* Bottom Action Pill Buttons: Orders | Profile */}
          <div className="grid grid-cols-2 gap-3 mt-6">
            <button
              onClick={() => {
                onClose();
                router.push('/cart');
              }}
              type="button"
              className="w-full py-3 px-4 rounded-full border border-neutral-300 hover:border-neutral-400 text-sm font-medium text-neutral-800 flex items-center justify-center gap-2 hover:bg-neutral-50 transition-colors"
            >
              <svg className="w-4 h-4 text-neutral-600" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
              </svg>
              <span>Orders</span>
            </button>

            <button
              onClick={() => {
                onClose();
                router.push('/account/profile');
              }}
              type="button"
              className="w-full py-3 px-4 rounded-full border border-neutral-300 hover:border-neutral-400 text-sm font-medium text-neutral-800 flex items-center justify-center gap-2 hover:bg-neutral-50 transition-colors"
            >
              <svg className="w-4 h-4 text-neutral-600" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Profile</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
