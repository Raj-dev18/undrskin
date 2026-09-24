'use client';

import React, { useState } from 'react';
import NextImage from 'next/image';
import Link from 'next/link';
import { Product, ProductVariant } from '@/types/product';
import { useCart } from '@/components/cart/cart-context';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [quickSelectOpen, setQuickSelectOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants.find((v) => v.availableForSale) || product.variants[0] || null
  );
  const [addedAnimation, setAddedAnimation] = useState(false);
  const { addItem } = useCart();

  const primaryImage = product.featuredImage || product.images[0] || {
    id: 'placeholder',
    url: '/placeholder.svg',
    altText: product.title,
  };
  const secondaryImage = product.images.length > 1 ? product.images[1] : null;

  const isSoldOut = !product.availableForSale;
  const hasMultipleVariants = product.variants.length > 1;

  const handleQuickAddClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isSoldOut) return;

    if (hasMultipleVariants) {
      setQuickSelectOpen(true);
    } else {
      const singleVariant = product.variants.find((v) => v.availableForSale) || product.variants[0];
      if (singleVariant && singleVariant.availableForSale) {
        addItem(product, singleVariant);
        triggerAddedFeedback();
      }
    }
  };

  const handleConfirmQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (selectedVariant && selectedVariant.availableForSale) {
      addItem(product, selectedVariant);
      setQuickSelectOpen(false);
      triggerAddedFeedback();
    }
  };

  const triggerAddedFeedback = () => {
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 2000);
  };

  return (
    <div
      className="group relative flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-[3/4] bg-neutral-900 overflow-hidden">
        <Link href={`/products/${product.handle}`} className="block w-full h-full">
          {/* Badges */}
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
            {isSoldOut ? (
              <span className="text-[9px] uppercase tracking-[0.2em] bg-neutral-900/90 text-neutral-400 px-2 py-1 border border-neutral-800">
                Sold Out
              </span>
            ) : product.badge ? (
              <span className="text-[9px] uppercase tracking-[0.2em] bg-neutral-950/80 backdrop-blur-md text-white px-2 py-1 border border-neutral-800">
                {product.badge}
              </span>
            ) : null}
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
        </Link>

        {/* Quick Add Overlay on hover (Desktop) */}
        {!isSoldOut && (
          <div className="absolute inset-x-3 bottom-3 z-20 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hidden sm:block">
            <button
              onClick={handleQuickAddClick}
              className={`w-full py-2.5 text-[10px] uppercase tracking-widest backdrop-blur-md transition-all font-medium shadow-lg border ${
                addedAnimation
                  ? 'bg-neutral-900 text-white border-white'
                  : 'bg-neutral-950/90 hover:bg-white text-white hover:text-black border-neutral-700 hover:border-white'
              }`}
            >
              {addedAnimation ? 'Added to Bag ✓' : hasMultipleVariants ? 'Quick Options' : 'Quick Add'}
            </button>
          </div>
        )}

        {/* Multi-variant Quick Select Popover */}
        {quickSelectOpen && (
          <div
            className="absolute inset-0 z-30 bg-neutral-950/95 backdrop-blur-md p-4 flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-neutral-900 pb-2">
              <span className="text-[10px] uppercase tracking-wider text-neutral-300">
                Select Option
              </span>
              <button
                onClick={() => setQuickSelectOpen(false)}
                className="text-neutral-500 hover:text-white p-1 text-xs"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-2 overflow-y-auto max-h-[140px] my-2 pr-1">
              {product.variants.map((v) => {
                const isSelected = selectedVariant?.id === v.id;
                return (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    disabled={!v.availableForSale}
                    className={`flex items-center justify-between p-2 text-xs border transition-colors ${
                      isSelected
                        ? 'border-white bg-white text-black font-medium'
                        : v.availableForSale
                        ? 'border-neutral-800 text-neutral-300 hover:border-neutral-600'
                        : 'border-neutral-900 text-neutral-600 line-through cursor-not-allowed'
                    }`}
                  >
                    <span>{v.title}</span>
                    <span className="font-mono text-[11px]">{v.price.formattedAmount}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleConfirmQuickAdd}
              disabled={!selectedVariant?.availableForSale}
              className="w-full py-2 bg-white text-black text-[10px] uppercase tracking-widest font-medium hover:bg-neutral-200 transition-colors"
            >
              Add Selected to Bag
            </button>
          </div>
        )}
      </div>

      {/* Product Meta */}
      <div className="mt-3.5 flex flex-col space-y-1">
        <div className="flex justify-between items-baseline">
          <Link
            href={`/products/${product.handle}`}
            className="text-xs uppercase tracking-widest text-neutral-200 hover:text-white transition-colors truncate font-normal"
          >
            {product.title}
          </Link>
          <div className="flex items-center space-x-1.5 ml-2">
            <span className="text-xs font-mono text-neutral-300">
              {product.price.formattedAmount}
            </span>
            {product.price.formattedCompareAtAmount && (
              <span className="text-[11px] font-mono text-neutral-500 line-through">
                {product.price.formattedCompareAtAmount}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-neutral-400 font-light">
          <span className="capitalize">{product.collections[0]?.replace('-', ' ') || 'Studio'}</span>
          {isSoldOut ? (
            <span className="text-[10px] text-neutral-500 font-mono">Out of stock</span>
          ) : product.reviewCount > 0 ? (
            <span className="font-mono text-[10px] text-neutral-300 flex items-center gap-1">
              <span className="text-[#ffcc00]">★</span> {product.rating.toFixed(1)}
              <span className="text-neutral-500">({product.reviewCount})</span>
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
