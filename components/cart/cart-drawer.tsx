'use client';

import React from 'react';
import NextImage from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from './cart-context';

export function CartDrawer() {
  const { cart, isCartOpen, closeCart, openCheckout, updateQuantity, removeItem } = useCart();

  const handleCheckout = () => {
    if (cart.lines.length === 0) return;
    closeCart();
    openCheckout();
  };

  return (
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
            className="fixed inset-y-0 right-0 w-full max-w-md bg-[#A6C7B7] text-[#302824] border-l border-[#302824]/15 flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-[#302824]/15 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xs uppercase tracking-[0.25em] text-[#302824] font-medium">
                  Shopping Bag
                </span>
                <span className="text-xs text-[#302824]/65 font-mono">
                  ({cart.totalQuantity})
                </span>
              </div>
              <button
                onClick={closeCart}
                aria-label="Close cart"
                className="text-[#302824]/65 hover:text-[#302824] p-1 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="px-6 py-3 border-b border-[#302824]/15 text-[11px] uppercase tracking-wider text-[#302824]/65">
              Shipping options are confirmed at checkout.
            </p>

            {/* Cart Lines */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.lines.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-16">
                  <div className="w-12 h-12 rounded-full border border-neutral-800 flex items-center justify-center text-neutral-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                    <p className="text-xs uppercase tracking-widest text-[#302824]/65">
                    Your bag is currently empty
                  </p>
                  <Link
                    href="/collections"
                    onClick={closeCart}
                    className="inline-block px-6 py-2.5 btn-brand-primary text-xs uppercase tracking-widest transition-colors"
                  >
                    Shop the collection
                  </Link>
                </div>
              ) : (
                cart.lines.map((item) => (
                  <div
                    key={item.id}
                    className="flex space-x-4 pb-6 border-b border-[#302824]/15 last:border-0"
                  >
                    <div className="relative w-20 h-24 bg-neutral-900 flex-shrink-0 overflow-hidden">
                      <NextImage
                        src={item.variant.image?.url || item.product.featuredImage.url}
                        alt={item.variant.image?.altText || item.product.title}
                        fill
                        className={item.trioColours?.length ? 'object-cover opacity-75' : 'object-cover'}
                      />
                      {item.trioColours?.length ? (
                        <div
                          aria-hidden="true"
                          className="absolute inset-0 mix-blend-multiply opacity-45 pointer-events-none"
                          style={{ backgroundColor: ({ 'Dusty Rose': '#B96F73', Maroon: '#7E1626', Black: '#1B1717', Beige: '#E2BC96' }[item.trioColours[0]] ?? '#A6C7B7') }}
                        />
                      ) : null}
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <Link
                            href={`/products/${item.product.handle}`}
                            onClick={closeCart}
                      className="text-xs uppercase tracking-wider text-[#302824] hover:underline line-clamp-1 font-medium"
                          >
                            {item.product.title}
                          </Link>
                          <span className="text-xs font-mono text-[#302824] ml-2">
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
                        {item.trioColours && (
                          <div className="mt-2 flex items-center gap-2 text-[10px] uppercase tracking-wider text-neutral-400">
                            <span>Your trio</span>
                            <span className="flex gap-1" aria-label={item.trioColours.join(', ')}>
                              {item.trioColours.map((colour) => (
                                <i
                                  key={colour}
                                  title={colour}
                                  className="h-3 w-3 rounded-full border border-white/30"
                                  style={{ backgroundColor: ({ 'Dusty Rose': '#B96F73', Maroon: '#7E1626', Black: '#1B1717', Beige: '#E2BC96' }[colour] ?? '#A6C7B7') }}
                                />
                              ))}
                            </span>
                            <span className="text-neutral-300">{item.trioColours.join(' · ')}</span>
                          </div>
                        )}
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
                          <span className="w-8 text-center text-xs font-mono text-[#302824]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center text-[#302824]/65 hover:text-[#302824] transition-colors"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-[11px] uppercase tracking-wider text-[#302824]/65 hover:text-[#302824] transition-colors"
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
              <div className="p-6 border-t border-[#302824]/15 bg-[#A6C7B7] space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-[#302824]/65">
                    <span className="uppercase tracking-wider">Estimated Subtotal</span>
                    <span className="font-mono text-[#302824]">
                      {cart.cost.formattedSubtotalAmount}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-[#302824]/65">
                    <span className="uppercase tracking-wider">Shipping</span>
                    <span className="font-mono text-[#302824]/75">
                      Calculated at checkout
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full py-3.5 btn-brand-primary text-xs uppercase tracking-widest font-medium transition-colors flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>Proceed to Checkout</span>
                  <span>—</span>
                  <span>{cart.cost.formattedSubtotalAmount}</span>
                </button>

                <div className="text-center">
                  <Link
                    href="/cart"
                    onClick={closeCart}
                    className="text-[11px] uppercase tracking-wider text-neutral-400 hover:text-white underline underline-offset-2"
                  >
                    View full cart
                  </Link>
                </div>

                <p className="text-[10px] text-center uppercase tracking-widest text-neutral-400 font-mono">
                  Shipping and tax details are confirmed before payment.
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
