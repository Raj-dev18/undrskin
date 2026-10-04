'use client';

import React, { useState, useEffect } from 'react';
import NextImage from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/components/cart/cart-context';

interface CustomerForm {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

const INDIAN_STATES = [
  'Andaman and Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

export function CheckoutModal() {
  const { cart, isCheckoutOpen, closeCheckout, clearCart } = useCart();
  const router = useRouter();

  const [formData, setFormData] = useState<CustomerForm>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: 'Maharashtra',
    pincode: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Restore saved contact details from previous checkout if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem('undrskin_shipping_info');
      if (saved) {
        const parsed = JSON.parse(saved);
        setFormData((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
      // ignore
    }
  }, []);

  // Ensure Razorpay script is loaded dynamically
  useEffect(() => {
    if (typeof window !== 'undefined' && !(window as any).Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setErrorMessage('Please enter your full name.');
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return false;
    }
    const cleanPhone = formData.phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return false;
    }
    if (!formData.address.trim()) {
      setErrorMessage('Please enter your complete delivery street address.');
      return false;
    }
    if (!formData.city.trim()) {
      setErrorMessage('Please enter your city.');
      return false;
    }
    if (!formData.pincode.trim() || formData.pincode.replace(/[^0-9]/g, '').length !== 6) {
      setErrorMessage('Please enter a valid 6-digit PIN code.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.lines.length === 0 || isSubmitting) return;

    setErrorMessage(null);
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Save details for next time
      try {
        localStorage.setItem('undrskin_shipping_info', JSON.stringify(formData));
      } catch {
        // ignore
      }

      // 1. Create order on server side (Shopify calculates true subtotal)
      const orderRes = await fetch('/api/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.lines.map((line) => ({
            variantId: line.variant.id,
            quantity: line.quantity,
          })),
          customer: {
            name: formData.name,
            email: formData.email,
            phone: `+91${formData.phone.replace(/[^0-9]/g, '').slice(-10)}`,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode,
          },
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.id) {
        throw new Error(orderData.error || 'Failed to initialize secure checkout.');
      }

      // Check for Razorpay SDK
      if (typeof window === 'undefined' || !(window as any).Razorpay) {
        throw new Error('Razorpay payment gateway is loading. Please try again in a few seconds.');
      }

      // 2. Launch Razorpay payment modal
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'UNDRSKIN STUDIO',
        description: `Order of ${cart.totalQuantity} items`,
        order_id: orderData.id,
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone.replace(/[^0-9]/g, '').slice(-10),
        },
        theme: {
          color: '#302824',
        },
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch('/api/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ...response,
                phone: `+91${formData.phone.replace(/[^0-9]/g, '').slice(-10)}`,
                amount: cart.cost.formattedSubtotalAmount,
                itemsCount: cart.totalQuantity,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              // Save order confirmation details in sessionStorage for the success page
              try {
                sessionStorage.setItem(
                  'undrskin_last_order',
                  JSON.stringify({
                    orderId: response.razorpay_order_id,
                    paymentId: response.razorpay_payment_id,
                    total: cart.cost.formattedSubtotalAmount,
                    itemsCount: cart.totalQuantity,
                    customer: formData,
                  })
                );
              } catch {
                // ignore
              }

              clearCart();
              closeCheckout();
              router.push(`/checkout/success?order_id=${response.razorpay_order_id}&payment_id=${response.razorpay_payment_id}`);
            } else {
              setErrorMessage('Payment verification failed. If your account was debited, please contact care@undrskin.in.');
              setIsSubmitting(false);
            }
          } catch (err: any) {
            console.error('Payment verification error:', err);
            setErrorMessage('Error verifying payment. Please contact support.');
            setIsSubmitting(false);
          }
        },
        modal: {
          ondismiss: function () {
            setIsSubmitting(false);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (resp: any) {
        setErrorMessage(resp.error?.description || 'Payment was unsuccessful. Please try again.');
        setIsSubmitting(false);
      });
      rzp.open();
    } catch (err: any) {
      console.error('Checkout error:', err);
      setErrorMessage(err.message || 'Unable to connect to payment server. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isCheckoutOpen && (
        <motion.div
          key="checkout-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 lg:p-8"
          onClick={closeCheckout}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 16 }}
            transition={{ type: 'tween', duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-4xl bg-[#F1E9DF] text-[#302824] rounded-2xl shadow-2xl border border-[rgba(48,40,36,0.15)] overflow-hidden my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 sm:px-8 py-5 border-b border-[rgba(48,40,36,0.12)] bg-[#E8DEC8]/50 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="w-2.5 h-2.5 rounded-full bg-[#B96F73] animate-pulse" />
                <div>
                  <h2 className="text-sm font-semibold tracking-[0.2em] uppercase text-[#302824]">
                    UNDRSKIN SECURE CHECKOUT
                  </h2>
                  <p className="text-[11px] text-[#302824]/70 font-mono tracking-wider">
                    Official Headless Storefront · Razorpay Secure
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeCheckout}
                aria-label="Close checkout"
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#302824]/60 hover:text-[#302824] hover:bg-black/5 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Error banner */}
            {errorMessage && (
              <div className="mx-6 sm:mx-8 mt-6 p-4 rounded-xl bg-[#7E1626]/10 border border-[#7E1626]/30 text-xs text-[#7E1626] flex items-start space-x-2">
                <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            {/* Form & Summary Body */}
            <form onSubmit={handleSubmit} className="p-6 sm:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Column: Customer and Shipping Information */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Contact Section */}
                  <div>
                    <h3 className="text-xs uppercase tracking-[0.2em] font-medium text-[#302824]/80 pb-2 border-b border-[rgba(48,40,36,0.12)]">
                      1. Contact Details
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-3.5">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] uppercase tracking-wider text-[#302824]/70 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="e.g. Priyanshu Sharma"
                          className="w-full px-3.5 py-2.5 rounded-lg border border-[rgba(48,40,36,0.2)] bg-white/80 focus:bg-white text-sm text-[#302824] placeholder-[#302824]/40 focus:outline-none focus:ring-2 focus:ring-[#B96F73]/50 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-[#302824]/70 mb-1">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="name@example.com"
                          className="w-full px-3.5 py-2.5 rounded-lg border border-[rgba(48,40,36,0.2)] bg-white/80 focus:bg-white text-sm text-[#302824] placeholder-[#302824]/40 focus:outline-none focus:ring-2 focus:ring-[#B96F73]/50 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-[#302824]/70 mb-1">
                          Mobile Number (+91) *
                        </label>
                        <div className="flex">
                          <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-[rgba(48,40,36,0.2)] bg-[#E8DEC8]/50 text-xs font-mono text-[#302824]/80">
                            +91
                          </span>
                          <input
                            type="tel"
                            name="phone"
                            required
                            maxLength={10}
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="9876543210"
                            className="w-full px-3.5 py-2.5 rounded-r-lg border border-[rgba(48,40,36,0.2)] bg-white/80 focus:bg-white text-sm text-[#302824] font-mono placeholder-[#302824]/40 focus:outline-none focus:ring-2 focus:ring-[#B96F73]/50 transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Section */}
                  <div>
                    <h3 className="text-xs uppercase tracking-[0.2em] font-medium text-[#302824]/80 pb-2 border-b border-[rgba(48,40,36,0.12)]">
                      2. Delivery Address
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-3.5">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] uppercase tracking-wider text-[#302824]/70 mb-1">
                          Street Address / House / Flat No. *
                        </label>
                        <input
                          type="text"
                          name="address"
                          required
                          value={formData.address}
                          onChange={handleInputChange}
                          placeholder="e.g. Flat 402, Lotus Residency, MG Road"
                          className="w-full px-3.5 py-2.5 rounded-lg border border-[rgba(48,40,36,0.2)] bg-white/80 focus:bg-white text-sm text-[#302824] placeholder-[#302824]/40 focus:outline-none focus:ring-2 focus:ring-[#B96F73]/50 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-[#302824]/70 mb-1">
                          City *
                        </label>
                        <input
                          type="text"
                          name="city"
                          required
                          value={formData.city}
                          onChange={handleInputChange}
                          placeholder="e.g. Mumbai"
                          className="w-full px-3.5 py-2.5 rounded-lg border border-[rgba(48,40,36,0.2)] bg-white/80 focus:bg-white text-sm text-[#302824] placeholder-[#302824]/40 focus:outline-none focus:ring-2 focus:ring-[#B96F73]/50 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-[#302824]/70 mb-1">
                          PIN Code (6 Digits) *
                        </label>
                        <input
                          type="text"
                          name="pincode"
                          required
                          maxLength={6}
                          value={formData.pincode}
                          onChange={handleInputChange}
                          placeholder="400001"
                          className="w-full px-3.5 py-2.5 rounded-lg border border-[rgba(48,40,36,0.2)] bg-white/80 focus:bg-white text-sm text-[#302824] font-mono placeholder-[#302824]/40 focus:outline-none focus:ring-2 focus:ring-[#B96F73]/50 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-[#302824]/70 mb-1">
                          State *
                        </label>
                        <select
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          className="w-full px-3.5 py-2.5 rounded-lg border border-[rgba(48,40,36,0.2)] bg-white/80 focus:bg-white text-sm text-[#302824] focus:outline-none focus:ring-2 focus:ring-[#B96F73]/50 transition-all"
                        >
                          {INDIAN_STATES.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-[#302824]/70 mb-1">
                          Country
                        </label>
                        <input
                          type="text"
                          disabled
                          value="India"
                          className="w-full px-3.5 py-2.5 rounded-lg border border-[rgba(48,40,36,0.15)] bg-[#E8DEC8]/60 text-sm text-[#302824]/70 font-medium cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Order Review, Breakdown & Razorpay Action */}
                <div className="lg:col-span-5 bg-white/70 rounded-xl p-5 sm:p-6 border border-[rgba(48,40,36,0.12)] space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-[rgba(48,40,36,0.1)]">
                    <span className="text-xs uppercase tracking-widest font-semibold text-[#302824]">
                      Order Summary
                    </span>
                    <span className="text-xs font-mono text-[#302824]/60">
                      {cart.totalQuantity} {cart.totalQuantity === 1 ? 'item' : 'items'}
                    </span>
                  </div>

                  {/* Cart Line Thumbnails */}
                  <div className="max-h-48 overflow-y-auto space-y-3 pr-1">
                    {cart.lines.map((line) => (
                      <div key={line.id} className="flex items-center space-x-3 text-xs">
                        <div className="relative w-12 h-14 rounded-md bg-[#E8DEC8]/50 overflow-hidden shrink-0 border border-[rgba(48,40,36,0.1)]">
                          <NextImage
                            src={line.variant.image?.url || line.product.featuredImage.url}
                            alt={line.product.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-[#302824] truncate">
                            {line.product.title}
                          </p>
                          <p className="text-[11px] text-[#302824]/60">
                            Qty: {line.quantity} · {line.selectedOptions.map((o) => `${o.name}: ${o.value}`).join(', ')}
                          </p>
                        </div>
                        <span className="font-mono text-xs text-[#302824] font-medium shrink-0">
                          ₹{Math.round(line.variant.price.amount * line.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Price Calculations */}
                  <div className="space-y-2.5 pt-3 border-t border-[rgba(48,40,36,0.1)] text-xs text-[#302824]/80">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-mono font-medium text-[#302824]">
                        {cart.cost.formattedSubtotalAmount}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Standard Express Shipping</span>
                      <span className="font-mono text-xs font-medium text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
                        FREE
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px] text-[#302824]/60">
                      <span>Taxes & Duties</span>
                      <span>Included in Price</span>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="pt-3 border-t border-[rgba(48,40,36,0.15)] flex justify-between items-baseline">
                    <span className="text-xs uppercase tracking-wider font-semibold text-[#302824]">
                      Total Payable
                    </span>
                    <span className="text-lg font-mono font-semibold text-[#7E1626]">
                      {cart.cost.formattedSubtotalAmount}
                    </span>
                  </div>

                  {/* Payment Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || cart.lines.length === 0}
                    className="w-full py-4 rounded-xl btn-brand-primary text-xs uppercase tracking-widest font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Connecting to Razorpay...</span>
                      </span>
                    ) : (
                      <>
                        <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span>Pay {cart.cost.formattedSubtotalAmount}</span>
                      </>
                    )}
                  </button>

                  <div className="text-[10px] text-center text-[#302824]/60 font-mono space-y-1">
                    <p>UPI (GPay, PhonePe, Paytm), Cards, NetBanking</p>
                    <p className="text-[9px] uppercase tracking-wider text-[#302824]/50">
                      🔒 256-Bit SSL Encrypted · 100% Secure Checkout
                    </p>
                  </div>
                </div>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
