'use client';

import { useEffect, useRef } from 'react';
import type { Product, Review } from '@/types/product';
import type { SyntheticEvent } from 'react';
import { useCart } from '@/components/cart/cart-context';

interface StorefrontExperienceProps {
  products: Product[];
  initialReviews?: Review[];
}

export function StorefrontExperience({ products }: StorefrontExperienceProps) {
  const { cart, addItem, openCart } = useCart();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const sendCatalog = (event: SyntheticEvent<HTMLIFrameElement>) => {
    const frame = event.currentTarget.contentWindow;
    frame?.postMessage({
      source: 'undrskin-catalog',
      cartCount: cart.totalQuantity,
      products: products.slice(0, 4).map((product) => ({ title: product.title, featuredImage: product.featuredImage?.url })),
      reviews: products[0]?.reviews ?? []
    }, window.location.origin);

    if (window.location.hash === '#reviews') {
      [300, 800, 1500].forEach((delay) => {
        setTimeout(() => {
          frame?.postMessage({ source: 'undrskin-scroll', target: 'reviews' }, window.location.origin);
        }, delay);
      });
    }
  };

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#reviews') {
        const frame = iframeRef.current?.contentWindow;
        frame?.postMessage({ source: 'undrskin-scroll', target: 'reviews' }, window.location.origin);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    const receiveMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.source !== 'undrskin-3d' || event.data.type !== 'add') return;
      const requestedTitle = String(event.data.productTitle ?? '').replace(/\s+·\s+pack of 3$/i, '').trim();
      const product = products.find((item) => item.title.toLowerCase() === requestedTitle.toLowerCase()) ?? products[0];
      const size = String(event.data.size ?? 'M').toLowerCase();
      const variant = product?.variants.find((item) => item.availableForSale && item.selectedOptions.some((option) => option.name.toLowerCase() === 'size' && option.value.toLowerCase() === size));
      if (product && variant) { addItem(product, variant, 1, Array.isArray(event.data.trio) ? event.data.trio : undefined); openCart(); }
    };
    window.addEventListener('message', receiveMessage);
    return () => window.removeEventListener('message', receiveMessage);
  }, [addItem, openCart, products]);

  return (
    <div className="relative w-full min-h-screen bg-[#A6C7B7]">
      <iframe
        ref={iframeRef}
        src="/undrskin-3d-demo.html"
        title="UndrSkin bamboo hipster shopping experience"
        onLoad={sendCatalog}
        className="block w-full border-0 bg-[#A6C7B7]"
        style={{ height: '100vh', width: '100%' }}
      />
    </div>
  );
}
