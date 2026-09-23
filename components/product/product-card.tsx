'use client';

import React, { useState } from 'react';
import NextImage from 'next/image';
import Link from 'next/link';
import { Product } from '@/types/product';
import { useCart } from '@/components/cart/cart-context';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { addItem } = useCart();

  const primaryImage = product.featuredImage || product.images[0];
  const secondaryImage = product.images[1] || primaryImage;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.variants.length > 0) {
      addItem(product, product.variants[0]);
    }
  };

  return (
    <div
      className="group relative flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/products/${product.handle}`} className="block relative aspect-[3/4] bg-neutral-900 overflow-hidden">
        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
          {product.badge && (
            <span className="text-[9px] uppercase tracking-[0.2em] bg-neutral-950/80 backdrop-blur-md text-white px-2 py-1 border border-neutral-800">
              {product.badge}
            </span>
          )}
        </div>

        {/* Product Images with Cross-Fade */}
        <NextImage
          src={primaryImage.url}
          alt={primaryImage.altText || product.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={priority}
          className={`object-cover object-center transition-all duration-700 ease-out ${
            isHovered && secondaryImage ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
          }`}
        />
        {secondaryImage && (
          <NextImage
            src={secondaryImage.url}
            alt={secondaryImage.altText || product.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={`object-cover object-center transition-all duration-700 ease-out ${
              isHovered ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
            }`}
          />
        )}

        {/* Quick Add Overlay on hover */}
        <div className="absolute inset-x-3 bottom-3 z-10 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hidden sm:block">
          <button
            onClick={handleQuickAdd}
            className="w-full py-2.5 bg-neutral-950/90 hover:bg-white text-white hover:text-black border border-neutral-700 hover:border-white text-[10px] uppercase tracking-widest backdrop-blur-md transition-colors font-medium shadow-lg"
          >
            Quick Add
          </button>
        </div>
      </Link>

      {/* Product Meta */}
      <div className="mt-3.5 flex flex-col space-y-1">
        <div className="flex justify-between items-baseline">
          <Link
            href={`/products/${product.handle}`}
            className="text-xs uppercase tracking-widest text-neutral-200 hover:text-white transition-colors truncate font-normal"
          >
            {product.title}
          </Link>
          <span className="text-xs font-mono text-neutral-300 ml-2">
            ${product.price.amount.toFixed(2)}
          </span>
        </div>

        <div className="flex items-center justify-between text-[11px] text-neutral-400 font-light">
          <span className="capitalize">{product.collections[0]?.replace('-', ' ') || 'Studio'}</span>
          {product.rating && (
            <span className="font-mono text-[10px] text-neutral-400">
              ★ {product.rating}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
