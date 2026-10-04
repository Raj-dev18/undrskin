'use client';

import React, { useState, useMemo } from 'react';
import NextImage from 'next/image';
import { ProductImage } from '@/types/product';

interface ProductGalleryProps {
  images: ProductImage[];
  title: string;
  variantImage?: ProductImage;
}

export function ProductGallery({ images, title, variantImage }: ProductGalleryProps) {
  const displayImages = useMemo(() => {
    return images && images.length > 0
      ? images
      : [
          {
            id: 'placeholder',
            url: '/placeholder.svg',
            altText: title,
            width: 800,
            height: 1067,
          },
        ];
  }, [images, title]);

  const [selectedIdx, setSelectedIdx] = useState(0);
  const [prevVariantKey, setPrevVariantKey] = useState<string | undefined>(
    variantImage?.id || variantImage?.url
  );
  const [isZoomed, setIsZoomed] = useState(false);

  // Synchronize gallery display when a variant image changes
  const currentVariantKey = variantImage?.id || variantImage?.url;
  if (currentVariantKey !== prevVariantKey) {
    setPrevVariantKey(currentVariantKey);
    if (variantImage?.url) {
      const idx = displayImages.findIndex(
        (img) => img.url === variantImage.url || (img.id && img.id === variantImage.id)
      );
      if (idx > -1) {
        setSelectedIdx(idx);
      }
    }
  }

  const currentImage = displayImages[selectedIdx] || displayImages[0];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIdx((prev) => (prev > 0 ? prev - 1 : displayImages.length - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIdx((prev) => (prev < displayImages.length - 1 ? prev + 1 : 0));
  };

  return (
    <>
      <div className="flex flex-col-reverse md:flex-row gap-4 sm:gap-6">
        {/* Thumbnails (Horizontal on mobile, vertical on desktop - Amazon/Flipkart style) */}
        {displayImages.length > 1 && (
          <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto max-h-[580px] scrollbar-none py-1 px-0.5">
            {displayImages.map((img, idx) => (
              <button
                key={`${img.url}-${idx}`}
                onClick={() => setSelectedIdx(idx)}
                className={`relative w-16 h-20 sm:w-20 sm:h-24 rounded-xl border transition-all overflow-hidden shrink-0 bg-[#141414] p-1.5 ${
                  selectedIdx === idx
                    ? 'border-white ring-2 ring-white/30 scale-105 opacity-100 shadow-lg'
                    : 'border-neutral-800 opacity-60 hover:opacity-100 hover:border-neutral-600'
                }`}
                aria-label={`View image ${idx + 1} of ${title}`}
              >
                <NextImage
                  src={img.url}
                  alt={img.altText || `${title} thumbnail ${idx + 1}`}
                  fill
                  sizes="80px"
                  className="object-contain p-1"
                />
              </button>
            ))}
          </div>
        )}

        {/* Main Image Box - Amazon/Flipkart style object-contain fitting */}
        <div
          className="relative aspect-[3/4] flex-1 bg-[#141414] border border-neutral-800/80 rounded-2xl overflow-hidden cursor-zoom-in group p-4 sm:p-6 flex items-center justify-center shadow-xl"
          onClick={() => setIsZoomed(true)}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            <NextImage
              src={currentImage.url}
              alt={currentImage.altText || title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-contain transition-all duration-500 group-hover:scale-105"
            />
          </div>

          {/* Navigation Arrows for Multi-image Products */}
          {displayImages.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center border border-white/20 transition-all opacity-80 sm:opacity-0 group-hover:opacity-100 z-10"
                aria-label="Previous image"
              >
                ‹
              </button>
              <button
                onClick={handleNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center border border-white/20 transition-all opacity-80 sm:opacity-0 group-hover:opacity-100 z-10"
                aria-label="Next image"
              >
                ›
              </button>
            </>
          )}

          {/* Zoom hint badge */}
          <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md px-3 py-1 text-[10px] uppercase font-mono tracking-wider text-neutral-300 rounded-full border border-white/10 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Click to Zoom 🔍
          </div>
        </div>
      </div>

      {/* Fullscreen Lightbox / Zoom Modal */}
      {isZoomed && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-lg flex items-center justify-center p-4 sm:p-8"
          onClick={() => setIsZoomed(false)}
        >
          <button
            onClick={() => setIsZoomed(false)}
            className="absolute top-6 right-6 text-neutral-400 hover:text-white p-3 text-xs uppercase tracking-widest font-mono z-50 bg-neutral-900/80 rounded-full border border-neutral-700"
            aria-label="Close zoomed view"
          >
            Close ✕
          </button>
          <div
            className="relative w-full max-w-5xl h-[85vh] p-4 flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <NextImage
              src={currentImage.url}
              alt={currentImage.altText || title}
              fill
              className="object-contain"
              sizes="95vw"
            />
          </div>
        </div>
      )}
    </>
  );
}
