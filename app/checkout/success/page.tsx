import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Order Confirmed — UNDRSKIN',
  description: 'Thank you for your purchase.',
};

export default function CheckoutSuccessPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
      <div className="w-16 h-16 rounded-full border border-neutral-800 flex items-center justify-center mx-auto mb-8 text-white">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      
      <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-400 font-mono block mb-4">
        Order Confirmed
      </span>
      <h1 className="text-3xl sm:text-4xl font-light text-white tracking-[0.2em] uppercase mb-6">
        Thank You
      </h1>
      <p className="text-xs text-neutral-400 font-light max-w-lg mx-auto leading-relaxed mb-12">
        Your payment was successful and your order has been placed. You will receive an email confirmation shortly with your receipt and shipping details.
      </p>
      
      <Link
        href="/collections"
        className="inline-block px-8 py-3.5 bg-white text-black text-xs uppercase tracking-widest font-medium hover:bg-neutral-200 transition-colors"
      >
        Continue Exploring
      </Link>
    </div>
  );
}
