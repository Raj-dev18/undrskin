'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { ProductCard } from '@/components/product/product-card';
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
  const [iframeHeight, setIframeHeight] = useState('100dvh');
  const [hasIframeContent, setHasIframeContent] = useState(false);
  const featuredProduct = products[0];

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
      if (event.data?.source === 'undrskin-height' && Number(event.data.height) > 320) {
        setIframeHeight(`${Number(event.data.height)}px`);
        setHasIframeContent(true);
        return;
      }
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
    <div className="relative bg-[#A6C7B7] text-[#302824]">
      <iframe
        ref={iframeRef}
        src="/undrskin-3d-demo.html"
        title="UndrSkin bamboo hipster shopping experience"
        onLoad={sendCatalog}
        className={`block w-full border-0 bg-[#A6C7B7] ${hasIframeContent ? '' : 'absolute inset-0 opacity-0 pointer-events-none'}`}
        style={{ height: iframeHeight, minHeight: '100dvh' }}
      />
      <section className={`${hasIframeContent ? 'hidden' : ''} min-h-[calc(100dvh-5rem)] px-5 py-12 sm:px-10 lg:px-16 flex items-center`}>
        <div className="w-full max-w-7xl mx-auto grid lg:grid-cols-[1fr_minmax(22rem,34rem)_1fr] gap-10 lg:gap-16 items-center">
          <div className="space-y-6">
            <p className="font-mono text-[10px] uppercase tracking-[.26em]">Everyday trio · pack of 3</p>
            <h1 className="font-serif text-5xl sm:text-7xl leading-[.88] tracking-[-.055em]">The bamboo<br /><em>hipster.</em></h1>
            <p className="max-w-sm text-sm leading-6 text-[#302824]/70">Soft bamboo essentials designed to disappear on skin and move through every day.</p>
            <Link href="/collections" className="inline-flex border border-[#302824]/30 px-5 py-3 font-mono text-[11px] uppercase tracking-[.18em] hover:bg-[#F1E9DF] transition-colors">Shop hipsters</Link>
          </div>
          <div className="relative aspect-[4/5] border border-[#302824]/15 bg-[#F1E9DF]/45 overflow-hidden">
            {featuredProduct?.featuredImage?.url ? <Image src={featuredProduct.featuredImage.url} alt={featuredProduct.featuredImage.altText || featuredProduct.title} fill priority sizes="(max-width: 1024px) 90vw, 34rem" className="object-contain p-6" /> : null}
          </div>
          <div className="space-y-4 lg:self-end">
            <p className="font-mono text-[10px] uppercase tracking-[.24em] text-[#302824]/60">Skin first essentials</p>
            <h2 className="font-serif text-3xl leading-none">Breathable by nature.</h2>
            <p className="text-sm leading-6 text-[#302824]/70">95% bamboo viscose · 5% spandex · soft self-fabric waistband.</p>
          </div>
        </div>
      </section>
      <section id="trios" className={`${hasIframeContent ? 'hidden' : ''} bg-[#F1E9DF] px-5 py-16 sm:px-10 lg:px-16`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-end justify-between gap-5 mb-10"><div><p className="font-mono text-[10px] uppercase tracking-[.22em]">The collection</p><h2 className="font-serif text-4xl sm:text-5xl leading-none mt-3">Pick your favourites.</h2></div><Link href="/collections" className="border border-[#302824]/25 px-4 py-3 font-mono text-[10px] uppercase tracking-[.18em]">Show all products</Link></div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">{products.slice(0, 3).map((product, index) => <ProductCard key={product.id} product={product} priority={index === 0} />)}</div>
        </div>
      </section>
    </div>
  );
}
