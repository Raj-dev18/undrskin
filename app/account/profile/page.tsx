'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    altPhone: '',
    address: '',
  });
  const [isSaved, setIsSaved] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    // Load from local storage for mock persistence
    const saved = localStorage.getItem('undrskin_profile');
    if (saved) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData(JSON.parse(saved));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.phone) return;
    
    setIsSending(true);
    setOtpError('');
    try {
      const res = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formData.phone })
      });
      if (!res.ok) throw new Error('Failed to send OTP');
      setShowOtp(true);
    } catch (err) {
      setOtpError('Error sending OTP. Please check your number.');
    } finally {
      setIsSending(false);
    }
  };

  const verifyOTPAndSave = async () => {
    setIsSending(true);
    setOtpError('');
    try {
      const res = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formData.phone, code: otpCode })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invalid OTP');
      }

      localStorage.setItem('undrskin_profile', JSON.stringify(formData));
      setIsSaved(true);
      setShowOtp(false);
      setTimeout(() => {
        router.push('/account');
      }, 1500);
    } catch (err: any) {
      setOtpError(err.message || 'Invalid OTP');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
      <div className="mb-12">
        <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-400 font-mono block mb-4">
          Client Profile
        </span>
        <h1 className="text-3xl font-light text-white tracking-[0.2em] uppercase">Complete Your Profile</h1>
        <p className="mt-4 text-sm text-neutral-400 font-light">
          Please provide your delivery and contact details for a seamless checkout experience.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-neutral-400">Full Name</label>
            <input
              required
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-neutral-900 border border-neutral-800 text-sm px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-neutral-400">Primary Phone Number</label>
            <input
              required
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-neutral-900 border border-neutral-800 text-sm px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-neutral-400">Alternative Number (Optional)</label>
            <input
              type="tel"
              value={formData.altPhone}
              onChange={(e) => setFormData({ ...formData, altPhone: e.target.value })}
              className="w-full bg-neutral-900 border border-neutral-800 text-sm px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-neutral-400">Primary Delivery Address</label>
            <textarea
              required
              rows={3}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full bg-neutral-900 border border-neutral-800 text-sm px-4 py-3 text-white focus:outline-none focus:border-white transition-colors resize-none"
            />
          </div>
        </div>

        <div className="pt-6">
          <button
            type="submit"
            disabled={isSending || showOtp}
            className="w-full sm:w-auto px-8 py-3.5 bg-white text-black text-xs uppercase tracking-widest font-medium hover:bg-neutral-200 transition-colors disabled:opacity-50"
          >
            {isSaved ? 'Details Saved ✓' : isSending && !showOtp ? 'Sending OTP...' : 'Save & Verify Phone'}
          </button>
        </div>

        {showOtp && (
          <div className="mt-8 p-6 border border-neutral-800 bg-neutral-900/50">
            <h3 className="text-sm uppercase tracking-widest text-white mb-2">Verify Your Number</h3>
            <p className="text-xs text-neutral-400 mb-4">We sent a secure code to {formData.phone}</p>
            
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="6-digit code"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="w-full max-w-[200px] bg-neutral-900 border border-neutral-700 text-sm px-4 py-3 text-white focus:outline-none focus:border-white transition-colors text-center font-mono tracking-widest"
                maxLength={6}
              />
              <button
                type="button"
                onClick={verifyOTPAndSave}
                disabled={otpCode.length !== 6 || isSending}
                className="px-8 py-3 bg-white text-black text-xs uppercase tracking-widest font-medium hover:bg-neutral-200 transition-colors disabled:opacity-50"
              >
                {isSending ? 'Verifying...' : 'Verify'}
              </button>
            </div>
            {otpError && <p className="text-xs text-red-400 mt-3">{otpError}</p>}
          </div>
        )}
      </form>
    </div>
  );
}
