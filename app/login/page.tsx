'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: `+91${cleanPhone.slice(-10)}` }),
      });
      const data = await res.json();
      if (data.success) {
        setStep('otp');
      } else {
        setError(data.error || 'Failed to send OTP code. Please try again.');
      }
    } catch {
      setError('Network error sending OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!otp || otp.length < 4) {
      setError('Please enter a valid 4 to 6-digit OTP code.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: `+91${phone.replace(/[^0-9]/g, '').slice(-10)}`, code: otp }),
      });
      const data = await res.json();
      if (data.success) {
        router.push('/account/profile');
      } else {
        setError(data.error || 'Invalid OTP code. Please check and try again.');
      }
    } catch {
      setError('Network error verifying OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] bg-[#A6C7B7] flex flex-col items-center justify-center py-16 px-4">
      <div className="w-full max-w-md bg-[#F1E9DF] text-[#302824] p-8 sm:p-10 rounded-2xl shadow-xl border border-[#302824]/15 space-y-8">
        <div className="text-center space-y-2">
          <img
            src="https://undrskin.in/cdn/shop/files/Gemini_Generated_Image_5wr4kj5wr4kj5wr4_1.png?v=1784465127"
            alt="UndrSkin"
            className="h-10 mx-auto object-contain mb-3"
          />
          <h2 className="text-xl sm:text-2xl font-light tracking-[0.2em] uppercase text-[#302824]">
            Client Account Access
          </h2>
          <p className="text-xs text-[#302824]/70 font-light">
            Sign in to manage shipping details, order history, and express checkout.
          </p>
        </div>

        {/* OAuth Providers: Google & Apple */}
        <div className="space-y-3 pt-2">
          <form
            action={async () => {
              window.location.href = '/api/auth/signin/google';
            }}
          >
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-[#302824] text-[#F1E9DF] hover:bg-[#7E1626] transition-colors text-xs uppercase tracking-[0.18em] font-medium rounded-xl shadow-xs"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
          </form>

          <form
            action={async () => {
              window.location.href = '/api/auth/signin/apple';
            }}
          >
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white text-[#302824] border border-[#302824]/20 hover:bg-[#F0ECE1] transition-colors text-xs uppercase tracking-[0.18em] font-medium rounded-xl shadow-xs"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.04 2.26-.74 3.58-.79 1.69-.1 2.95.66 3.78 1.93-3.17 1.87-2.58 6.07.6 7.31-.69 1.6-1.5 3.04-2.9 4.67a12.87 12.87 0 0 1-1.07-1.15zM12.03 7.25c-.15-3.47 3.09-6.31 6.18-6.15.22 3.5-3.22 6.55-6.18 6.15z"/>
              </svg>
              Continue with Apple
            </button>
          </form>
        </div>

        <div className="relative flex items-center justify-center my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#302824]/15" />
          </div>
          <div className="relative bg-[#F1E9DF] px-4 text-[10px] uppercase tracking-[0.2em] text-[#302824]/60 font-mono">
            Or Sign In via Phone OTP
          </div>
        </div>

        {error && (
          <div className="p-3 bg-[#7E1626]/10 border border-[#7E1626]/20 text-[#7E1626] text-xs rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Mobile OTP Form */}
        {step === 'phone' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] font-mono text-[#302824]/70 mb-1.5">
                Mobile Phone Number
              </label>
              <div className="flex rounded-xl overflow-hidden border border-[#302824]/20 bg-white">
                <span className="px-3.5 py-3 bg-[#E8DEC8] text-xs font-mono font-medium text-[#302824] border-r border-[#302824]/15 flex items-center">
                  +91
                </span>
                <input
                  type="tel"
                  required
                  placeholder="98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 text-sm text-[#302824] bg-white focus:outline-none"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#B96F73] text-white hover:bg-[#7E1626] transition-colors text-xs uppercase tracking-[0.2em] font-medium rounded-xl shadow-xs disabled:opacity-50"
            >
              {loading ? 'Sending OTP...' : 'Send Verification OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] font-mono text-[#302824]/70 mb-1.5">
                Enter OTP Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-4 py-3 text-base text-center font-mono tracking-widest text-[#302824] bg-white border border-[#302824]/20 rounded-xl focus:outline-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep('phone')}
                className="w-1/3 py-3 bg-[#E8DEC8] text-[#302824] text-xs uppercase tracking-wider font-medium rounded-xl"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-2/3 py-3 bg-[#7E1626] text-[#F1E9DF] hover:bg-[#302824] transition-colors text-xs uppercase tracking-wider font-medium rounded-xl disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify & Access'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
