'use client';

import React from 'react';
import Link from 'next/link';
import NextImage from 'next/image';
import { useCart } from '@/components/cart/cart-context';

export default function CartPage() {
  const { cart, updateQuantity, removeItem, openCheckout } = useCart();

  const currencyCode = cart.cost.subtotalAmount.currencyCode || 'INR';
  const formatMoney = (amount: number) =>
    new Intl.NumberFormat(currencyCode === 'INR' ? 'en-IN' : 'en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    }).format(amount);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-xs uppercase tracking-widest text-[#302824]/60 mb-6 font-mono">
        <Link href="/" className="hover:text-[#7E1626] transition-colors">
          Home
        </Link>
        <span>/</span>
        <span className="text-[#302824] font-medium">Shopping Bag</span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-8 pb-4 border-b border-[rgba(48,40,36,0.12)] gap-2">
        <h1 className="text-2xl sm:text-3xl font-light text-[#302824] tracking-tight uppercase">
          Your Shopping Bag
        </h1>
        <span className="text-xs uppercase tracking-widest font-mono text-[#302824]/70">
          {cart.totalQuantity} {cart.totalQuantity === 1 ? 'item' : 'items'}
        </span>
      </div>

      {cart.lines.length === 0 ? (
        <div className="py-20 text-center space-y-6 bg-[#F1E9DF] rounded-2xl border border-[rgba(48,40,36,0.12)] p-8">
          <div className="w-14 h-14 mx-auto rounded-full bg-[#E8DEC8] flex items-center justify-center text-[#302824]/60">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <div className="space-y-1">
            <p className="text-sm uppercase tracking-widest text-[#302824] font-medium">
              Your bag is currently empty
            </p>
            <p className="text-xs text-[#302824]/60 max-w-sm mx-auto">
              Explore our skin-first essentials designed with breathable bamboo comfort.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/collections"
              className="inline-block px-8 py-3.5 btn-brand-primary text-xs uppercase tracking-widest font-medium transition-all rounded-xl shadow-md cursor-pointer"
            >
              Explore Collection
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Line items list */}
          <div className="lg:col-span-8 space-y-4">
            {cart.lines.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row gap-5 p-5 sm:p-6 bg-[#F1E9DF] rounded-2xl border border-[rgba(48,40,36,0.12)] transition-shadow hover:shadow-sm"
              >
                <div className="relative w-24 h-32 sm:w-28 sm:h-36 bg-[#E8DEC8] rounded-xl shrink-0 overflow-hidden border border-[rgba(48,40,36,0.1)]">
                  <NextImage
                    src={item.variant.image?.url || item.product.featuredImage.url}
                    alt={item.variant.image?.altText || item.product.title}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <Link
                        href={`/products/${item.product.handle}`}
                        className="text-sm uppercase tracking-wider text-[#302824] hover:text-[#7E1626] font-medium transition-colors"
                      >
                        {item.product.title}
                      </Link>
                      <span className="text-sm font-mono font-medium text-[#302824] ml-4 shrink-0">
                        {formatMoney(item.variant.price.amount * item.quantity)}
                      </span>
                    </div>

                    <div className="text-xs text-[#302824]/70 space-x-3">
                      {item.selectedOptions.map((opt) => (
                        <span key={opt.name} className="inline-block bg-[#E8DEC8]/50 px-2 py-0.5 rounded text-[11px]">
                          {opt.name}: <span className="font-medium text-[#302824]">{opt.value}</span>
                        </span>
                      ))}
                    </div>

                    <div className="text-xs font-mono text-[#302824]/60">
                      Unit price: {formatMoney(item.variant.price.amount)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-[rgba(48,40,36,0.1)]">
                    <div className="flex items-center rounded-lg border border-[rgba(48,40,36,0.2)] bg-white overflow-hidden shadow-xs">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center text-[#302824]/70 hover:text-[#302824] hover:bg-[#E8DEC8]/50 transition-colors"
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="w-9 text-center font-mono text-xs text-[#302824] font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center text-[#302824]/70 hover:text-[#302824] hover:bg-[#E8DEC8]/50 transition-colors"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-xs uppercase tracking-wider text-[#302824]/60 hover:text-[#7E1626] font-medium transition-colors cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary Sticky Panel */}
          <div className="lg:col-span-4 p-6 bg-[#F1E9DF] rounded-2xl border border-[rgba(48,40,36,0.15)] space-y-6 lg:sticky lg:top-28 shadow-sm">
            <h3 className="text-xs uppercase tracking-[0.25em] text-[#302824] font-semibold border-b border-[rgba(48,40,36,0.12)] pb-4">
              Order Summary
            </h3>

            <div className="space-y-3 text-xs text-[#302824]/80">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-mono font-medium text-[#302824]">
                  {cart.cost.formattedSubtotalAmount}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Standard Delivery</span>
                <span className="font-mono text-xs font-medium text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded">
                  Complimentary
                </span>
              </div>
              <div className="flex justify-between text-[11px] text-[#302824]/60">
                <span>Duties & Taxes</span>
                <span>Included in subtotal</span>
              </div>
            </div>

            <div className="border-t border-[rgba(48,40,36,0.15)] pt-4 flex justify-between items-baseline text-sm text-[#302824] font-semibold">
              <span className="uppercase tracking-wider">Estimated Total</span>
              <span className="font-mono text-base text-[#7E1626]">
                {cart.cost.formattedSubtotalAmount}
              </span>
            </div>

            <button
              onClick={openCheckout}
              className="w-full py-4 btn-brand-primary text-xs uppercase tracking-widest font-semibold transition-all rounded-xl shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 cursor-pointer"
            >
              <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Proceed to Checkout</span>
            </button>

            <div className="text-[10px] uppercase tracking-wider text-[#302824]/60 font-mono space-y-1.5 pt-2 border-t border-[rgba(48,40,36,0.1)]">
              <p className="flex items-center space-x-1.5">
                <span>🔒</span>
                <span>Razorpay Secure · 256-Bit SSL Encrypted</span>
              </p>
              <p className="flex items-center space-x-1.5">
                <span>📦</span>
                <span>Discreet & Eco-Friendly Packaging</span>
              </p>
              <p className="flex items-center space-x-1.5">
                <span>🌿</span>
                <span>Skin-First Bamboo Fabric Guarantee</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
