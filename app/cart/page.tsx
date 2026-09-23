'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import NextImage from 'next/image';
import { useCart } from '@/components/cart/cart-context';

export default function CartPage() {
  const { cart, updateQuantity, removeItem } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const freeShippingThreshold = 150;
  const currentTotal = cart.cost.subtotalAmount.amount;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - currentTotal);
  const shippingProgress = Math.min(100, (currentTotal / freeShippingThreshold) * 100);

  const handleCheckout = async () => {
    if (cart.lines.length === 0 || isCheckingOut) return;

    setIsCheckingOut(true);
    setCheckoutError(null);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cart.lines.map((line) => ({
            variantId: line.variant.id,
            quantity: line.quantity,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.checkoutUrl) {
        throw new Error(data.error || 'Failed to initialize secure checkout.');
      }

      window.location.href = data.checkoutUrl;
    } catch (err: any) {
      console.error('Checkout error:', err);
      setCheckoutError(err.message || 'Unable to connect to Shopify checkout. Please try again.');
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-xs uppercase tracking-widest text-neutral-500 mb-6">
        <Link href="/" className="hover:text-white transition-colors">
          Home
        </Link>
        <span>/</span>
        <span className="text-white">Shopping Bag</span>
      </nav>

      <h1 className="text-3xl sm:text-4xl font-light text-white tracking-tight uppercase mb-8">
        Your Shopping Bag ({cart.totalQuantity})
      </h1>

      {/* Free Shipping Meter */}
      <div className="mb-10 p-4 bg-neutral-900/40 border border-neutral-850 max-w-xl">
        <div className="flex items-center justify-between text-xs uppercase tracking-wider mb-2 font-mono">
          {remainingForFreeShipping === 0 ? (
            <span className="text-white font-medium">Complimentary Express Shipping Unlocked</span>
          ) : (
            <span className="text-neutral-400">
              Add <strong className="text-white">${remainingForFreeShipping.toFixed(2)}</strong> for Free Express Delivery
            </span>
          )}
          <span className="text-neutral-400">{Math.round(shippingProgress)}%</span>
        </div>
        <div className="w-full h-1 bg-neutral-800 overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-500 ease-out"
            style={{ width: `${shippingProgress}%` }}
          />
        </div>
      </div>

      {checkoutError && (
        <div className="mb-8 p-4 bg-red-950/40 border border-red-800 text-xs text-red-200 leading-relaxed max-w-xl">
          {checkoutError}
        </div>
      )}

      {cart.lines.length === 0 ? (
        <div className="py-24 text-center space-y-4 border-t border-neutral-900">
          <div className="w-12 h-12 mx-auto rounded-full border border-neutral-800 flex items-center justify-center text-neutral-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <p className="text-xs uppercase tracking-widest text-neutral-400">
            Your shopping bag is currently empty.
          </p>
          <div className="pt-2">
            <Link
              href="/collections"
              className="inline-block px-8 py-3.5 bg-white text-black text-xs uppercase tracking-widest font-medium hover:bg-neutral-200 transition-colors"
            >
              Explore Silhouettes
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Line items list */}
          <div className="lg:col-span-8 space-y-6">
            {cart.lines.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row gap-6 p-6 bg-neutral-900/20 border border-neutral-800"
              >
                <div className="relative w-28 h-36 bg-neutral-900 shrink-0 overflow-hidden">
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
                        className="text-sm uppercase tracking-wider text-white hover:underline font-medium"
                      >
                        {item.product.title}
                      </Link>
                      <span className="text-sm font-mono text-white ml-4">
                        ${(item.variant.price.amount * item.quantity).toFixed(2)}
                      </span>
                    </div>

                    <div className="text-xs text-neutral-400 space-x-3">
                      {item.selectedOptions.map((opt) => (
                        <span key={opt.name}>
                          {opt.name}: <span className="text-neutral-200">{opt.value}</span>
                        </span>
                      ))}
                    </div>

                    <div className="text-xs font-mono text-neutral-500">
                      Unit price: ${item.variant.price.amount.toFixed(2)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-neutral-850">
                    <div className="flex items-center border border-neutral-800 bg-neutral-950">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-white"
                      >
                        -
                      </button>
                      <span className="w-10 text-center font-mono text-xs text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-white"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-xs uppercase tracking-wider text-neutral-400 hover:text-neutral-200"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary Sticky Panel */}
          <div className="lg:col-span-4 p-6 bg-neutral-900/30 border border-neutral-800 space-y-6 lg:sticky lg:top-28">
            <h3 className="text-xs uppercase tracking-[0.25em] text-white font-medium border-b border-neutral-800 pb-4">
              Order Summary
            </h3>

            <div className="space-y-3 text-xs text-neutral-400">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-mono text-white">
                  ${cart.cost.subtotalAmount.amount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Shipping</span>
                <span className="font-mono text-neutral-300">
                  {remainingForFreeShipping === 0 ? 'Complimentary' : 'Calculated at Checkout'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Duties & Taxes</span>
                <span className="font-mono text-neutral-300">Included</span>
              </div>
            </div>

            <div className="border-t border-neutral-800 pt-4 flex justify-between text-sm text-white font-medium">
              <span className="uppercase tracking-wider">Estimated Total</span>
              <span className="font-mono">${cart.cost.subtotalAmount.amount.toFixed(2)}</span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className="w-full py-4 bg-white text-black text-xs uppercase tracking-widest font-medium hover:bg-neutral-200 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isCheckingOut ? (
                <span className="flex items-center space-x-2">
                  <div className="w-3.5 h-3.5 border border-black border-t-transparent rounded-full animate-spin" />
                  <span>Connecting to Shopify Checkout...</span>
                </span>
              ) : (
                <span>Proceed to Checkout</span>
              )}
            </button>

            <div className="text-[10px] uppercase tracking-wider text-neutral-400 font-mono space-y-1 pt-2">
              <p>• Secured 256-Bit SSL Shopify Payment</p>
              <p>• Complimentary Global Shipping over $150</p>
              <p>• 30-Day Discreet Returns & Exchanges</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
