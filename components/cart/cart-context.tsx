'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Cart } from '@/types/cart';
import { Product, ProductVariant } from '@/types/product';

interface CartContextType {
  cart: Cart;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  isCheckoutOpen: boolean;
  openCheckout: () => Promise<void>;
  closeCheckout: () => void;
  addItem: (product: Product, variant: ProductVariant, quantity?: number, trioColours?: string[]) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('undrskin_cart');
      if (stored) {
        const parsed = JSON.parse(stored);
        requestAnimationFrame(() => setItems(parsed));
      }
    } catch {
      // ignore
    }
    requestAnimationFrame(() => setIsLoaded(true));
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('undrskin_cart', JSON.stringify(items));
      } catch {
        // ignore
      }
    }
  }, [items, isLoaded]);

  const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotalAmount = items.reduce((acc, item) => acc + item.variant.price.amount * item.quantity, 0);
  const currencyCode = items[0]?.variant?.price?.currencyCode || 'INR';

  const formatPrice = (amount: number, currencyCode: string) => {
    const locale = currencyCode === 'INR' ? 'en-IN' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    }).format(amount);
  };

  const cart: Cart = {
    lines: items,
    totalQuantity,
    cost: {
      subtotalAmount: { amount: subtotalAmount, currencyCode },
      totalAmount: { amount: subtotalAmount, currencyCode },
      formattedSubtotalAmount: formatPrice(subtotalAmount, currencyCode),
      formattedTotalAmount: formatPrice(subtotalAmount, currencyCode),
    },
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const openCheckout = async () => {
    setIsCartOpen(false);
    if (items.length === 0) return;

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          lineItems: items.map((item) => ({ variantId: item.variantId, quantity: item.quantity })),
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.checkoutUrl) throw new Error(data.error || 'Checkout could not be started.');
      window.location.assign(data.checkoutUrl);
    } catch (error) {
      console.error('Shopify checkout redirect failed:', error);
      /* Keep the existing checkout modal as a local recovery path when the
         Shopify checkout endpoint is unavailable. */
      setIsCheckoutOpen(true);
    }
  };
  const closeCheckout = () => setIsCheckoutOpen(false);

  const addItem = (product: Product, variant: ProductVariant, quantity = 1, trioColours?: string[]) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.variantId === variant.id);
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + quantity,
        };
        return next;
      }
      const newItem: CartItem = {
        id: `${variant.id}-${Date.now()}`,
        productId: product.id,
        variantId: variant.id,
        product,
        variant,
        quantity,
        selectedOptions: variant.selectedOptions,
        trioColours,
      };
      return [...prev, newItem];
    });
    setIsCartOpen(true);
  };

  const removeItem = (itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    setItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, quantity } : item)));
  };

  const clearCart = () => setItems([]);

  return (
    <CartContext.Provider
      value={{
        cart,
        isCartOpen,
        openCart,
        closeCart,
        isCheckoutOpen,
        openCheckout,
        closeCheckout,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
