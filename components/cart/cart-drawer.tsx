'use client';

import React, { useState } from 'react';
import NextImage from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Script from 'next/script';
import { useCart } from './cart-context';

export function CartDrawer() {
  const { cart, isCartOpen, closeCart, updateQuantity, removeItem } = useCart();
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
      const response = await fetch('/api/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: cart.cost.subtotalAmount.amount,
          currency: cart.cost.subtotalAmount.currencyCode || 'USD',
          items: cart.lines.map((line) => ({
            variantId: line.variant.id,
            quantity: line.quantity,
          })),
        }),
      });

      const orderData = await response.json();

      if (!response.ok || !orderData.id) {
        throw new Error(orderData.error || 'Failed to initialize secure checkout.');
      }

      const options = {
        key: orderData.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
        amount: orderData.amount,
        currency: orderData.currency,
        name: "UNDRSKIN STUDIO",
        description: "Luxury Undergarments",
        order_id: orderData.id,
        handler: async function (res: any) {
          try {
            let phone = '';
            try {
              const profile = localStorage.getItem('undrskin_profile');
              if (profile) phone = JSON.parse(profile).phone || '';
            } catch (e) {}

            const verifyRes = await fetch('/api/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ...res,
                phone,
                amount: cart.cost.formattedSubtotalAmount,
                itemsCount: cart.totalQuantity,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              window.location.href = '/checkout/success';
            } else {
              setCheckoutError('Payment verification failed.');
              setIsCheckingOut(false);
            }
          } catch (e) {
            setCheckoutError('Error verifying payment.');
            setIsCheckingOut(false);
          }
        },
        prefill: {
          name: "Client",
          email: "care@undrskin.studio",
        },
        theme: {
          color: "#0c0c0c",
        },
        modal: {
          ondismiss: function() {
            setIsCheckingOut(false);
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        setCheckoutError(response.error.description);
        setIsCheckingOut(false);
      });
      rzp.open();
    } catch (err: any) {
      console.error('Checkout error:', err);
      setCheckoutError(err.message || 'Unable to connect to checkout. Please try again.');
      setIsCheckingOut(false);
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <AnimatePresence>
        {isCartOpen && (
          <motion.div
            key="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm"
          onClick={closeCart}
        >
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-y-0 right-0 w-full max-w-md bg-neutral-950 border-l border-neutral-900 flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-neutral-900 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xs uppercase tracking-[0.25em] text-white font-medium">
                  Shopping Bag
                </span>
                <span className="text-xs text-neutral-400 font-mono">
                  ({cart.totalQuantity})
                </span>
              </div>
              <button
                onClick={closeCart}
                aria-label="Close cart"
                className="text-neutral-400 hover:text-white p-1 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Free Shipping Progress Bar */}
            <div className="px-6 py-3 bg-neutral-900/60 border-b border-neutral-900">
              <div className="flex items-center justify-between text-[11px] uppercase tracking-wider mb-2 font-mono">
                {remainingForFreeShipping === 0 ? (
                  <span className="text-white font-medium">Complimentary Express Shipping Unlocked</span>
                ) : (
                  <span className="text-neutral-400">
                    Add <strong className="text-white">
                      {new Intl.NumberFormat(cart.cost.subtotalAmount.currencyCode === 'INR' ? 'en-IN' : 'en-US', {
                        style: 'currency',
                        currency: cart.cost.subtotalAmount.currencyCode,
                        minimumFractionDigits: Number.isInteger(remainingForFreeShipping) ? 0 : 2
                      }).format(remainingForFreeShipping)}
                    </strong> for Free Express Delivery
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

            {/* Checkout Error Banner */}
            {checkoutError && (
              <div className="mx-6 mt-4 p-3 bg-red-950/40 border border-red-800 text-[11px] text-red-200 leading-relaxed">
                {checkoutError}
              </div>
            )}

            {/* Cart Lines */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.lines.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-16">
                  <div className="w-12 h-12 rounded-full border border-neutral-800 flex items-center justify-center text-neutral-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <p className="text-xs uppercase tracking-widest text-neutral-400">
                    Your bag is currently empty
                  </p>
                  <Link
                    href="/collections"
                    onClick={closeCart}
                    className="inline-block px-6 py-2.5 bg-white text-black text-xs uppercase tracking-widest hover:bg-neutral-200 transition-colors"
                  >
                    Explore Silhouettes
                  </Link>
                </div>
              ) : (
                cart.lines.map((item) => (
                  <div
                    key={item.id}
                    className="flex space-x-4 pb-6 border-b border-neutral-900 last:border-0"
                  >
                    <div className="relative w-20 h-24 bg-neutral-900 flex-shrink-0 overflow-hidden">
                      <NextImage
                        src={item.variant.image?.url || item.product.featuredImage.url}
                        alt={item.variant.image?.altText || item.product.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <Link
                            href={`/products/${item.product.handle}`}
                            onClick={closeCart}
                            className="text-xs uppercase tracking-wider text-white hover:underline line-clamp-1 font-medium"
                          >
                            {item.product.title}
                          </Link>
                          <span className="text-xs font-mono text-white ml-2">
                            {item.variant.price.formattedAmount}
                          </span>
                        </div>
                        <div className="text-[11px] text-neutral-400 mt-1 space-x-2">
                          {item.selectedOptions.map((opt) => (
                            <span key={opt.name}>
                              {opt.name}: <span className="text-neutral-300">{opt.value}</span>
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        {/* Quantity selector */}
                        <div className="flex items-center border border-neutral-800">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
                            aria-label="Decrease quantity"
                          >
                            -
                          </button>
                          <span className="w-8 text-center text-xs font-mono text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-[11px] uppercase tracking-wider text-neutral-400 hover:text-neutral-300 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Summary */}
            {cart.lines.length > 0 && (
              <div className="p-6 border-t border-neutral-900 bg-neutral-950 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-neutral-400">
                    <span className="uppercase tracking-wider">Estimated Subtotal</span>
                    <span className="font-mono text-white">
                      {cart.cost.formattedSubtotalAmount}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-neutral-400">
                    <span className="uppercase tracking-wider">Shipping</span>
                    <span className="font-mono text-neutral-300">
                      {remainingForFreeShipping === 0 ? 'Complimentary' : 'Calculated at Checkout'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  className="w-full py-3.5 bg-white text-black text-xs uppercase tracking-widest font-medium hover:bg-neutral-200 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {isCheckingOut ? (
                    <span className="flex items-center space-x-2">
                      <div className="w-3.5 h-3.5 border border-black border-t-transparent rounded-full animate-spin" />
                      <span>Connecting to Shopify Checkout...</span>
                    </span>
                  ) : (
                    <>
                      <span>Checkout</span>
                      <span>—</span>
                      <span>{cart.cost.formattedSubtotalAmount}</span>
                    </>
                  )}
                </button>

                <div className="text-center">
                  <Link
                    href="/cart"
                    onClick={closeCart}
                    className="text-[11px] uppercase tracking-wider text-neutral-400 hover:text-white underline underline-offset-2"
                  >
                    View Bag Details Page
                  </Link>
                </div>

                <p className="text-[10px] text-center uppercase tracking-widest text-neutral-400 font-mono">
                  Discreet Packaging • Carbon Neutral Delivery • 30-Day Returns
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </>
  );
}
