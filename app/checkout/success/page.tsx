'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');
  const paymentId = searchParams.get('payment_id');

  const [savedOrder, setSavedOrder] = useState<any>(null);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('undrskin_last_order');
      if (stored) {
        setSavedOrder(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  const displayOrderId = orderId || savedOrder?.orderId || 'ORD-' + Math.random().toString(36).substring(2, 9).toUpperCase();
  const displayPaymentId = paymentId || savedOrder?.paymentId;
  const customerName = savedOrder?.customer?.name;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
      <div className="bg-[#F1E9DF] rounded-3xl p-8 sm:p-12 border border-[rgba(48,40,36,0.15)] shadow-xl space-y-8">
        
        {/* Success Icon */}
        <div className="w-16 h-16 rounded-full bg-[#E2BC97] text-[#1B1717] flex items-center justify-center mx-auto shadow-inner">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <div className="space-y-2">
          <span className="text-[11px] uppercase tracking-[0.25em] text-[#302824]/60 font-mono block">
            Payment & Order Confirmed
          </span>
          <h1 className="text-2xl sm:text-3xl font-light text-[#302824] tracking-tight uppercase">
            {customerName ? `Thank You, ${customerName}` : 'Thank You for Your Order'}
          </h1>
          <p className="text-xs text-[#302824]/70 font-light max-w-md mx-auto leading-relaxed pt-1">
            Your payment was processed securely. We have received your order and are preparing your skin-first bamboo essentials.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white/80 rounded-2xl p-5 border border-[rgba(48,40,36,0.1)] text-left space-y-3 font-mono text-xs">
          <div className="flex justify-between items-center pb-2 border-b border-[rgba(48,40,36,0.1)]">
            <span className="text-[#302824]/60 uppercase text-[10px] tracking-wider">Order Reference</span>
            <span className="font-semibold text-[#302824]">{displayOrderId}</span>
          </div>

          {displayPaymentId && (
            <div className="flex justify-between items-center pb-2 border-b border-[rgba(48,40,36,0.1)]">
              <span className="text-[#302824]/60 uppercase text-[10px] tracking-wider">Razorpay Payment ID</span>
              <span className="text-[#302824]">{displayPaymentId}</span>
            </div>
          )}

          {savedOrder?.total && (
            <div className="flex justify-between items-center pb-2 border-b border-[rgba(48,40,36,0.1)]">
              <span className="text-[#302824]/60 uppercase text-[10px] tracking-wider">Amount Paid</span>
              <span className="font-semibold text-[#7E1626]">{savedOrder.total}</span>
            </div>
          )}

          {savedOrder?.customer?.address && (
            <div className="pt-1">
              <span className="text-[#302824]/60 uppercase text-[10px] tracking-wider block mb-1">Shipping To</span>
              <p className="font-sans text-xs text-[#302824]">
                {savedOrder.customer.address}, {savedOrder.customer.city}, {savedOrder.customer.state} - {savedOrder.customer.pincode}
              </p>
            </div>
          )}
        </div>

        <div className="text-[11px] text-[#302824]/60 space-y-1">
          <p>Confirmation and tracking updates have been sent to your contact details.</p>
          <p className="font-mono text-[10px] text-[#302824]/50">Estimated dispatch: Within 24-48 business hours</p>
        </div>

        <div>
          <Link
            href="/collections"
            className="inline-block px-8 py-3.5 btn-brand-primary text-xs uppercase tracking-widest font-semibold rounded-xl shadow-md transition-all cursor-pointer"
          >
            Continue Exploring
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto py-32 text-center text-xs text-[#302824]/60 font-mono">
          Loading order confirmation...
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
