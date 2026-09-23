'use client';

import React, { useState } from 'react';
import NextImage from 'next/image';
import { ProductImage } from '@/types/product';

interface ProductGalleryProps {
  images: ProductImage[];
  title: string;
}

export function ProductGallery({ images, title }: ProductGalleryProps) {
  const [selectedIdx, setSelectedIdx] = useState(0);

  if (!images || images.length === 0) return null;

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4">
      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto max-h-[640px] scrollbar-none">
          {images.map((img, idx) => (
            <button
              key={img.url}
              onClick={() => setSelectedIdx(idx)}
              className={`relative w-16 h-20 sm:w-20 sm:h-24 border transition-all overflow-hidden shrink-0 ${
                selectedIdx === idx
                  ? 'border-white opacity-100'
                  : 'border-neutral-800 opacity-50 hover:opacity-80'
              }`}
              aria-label={`View image ${idx + 1} of ${title}`}
            >
              <NextImage
                src={img.url}
                alt={img.altText || `${title} thumbnail ${idx + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main Image */}
      <div className="relative aspect-[3/4] flex-1 bg-neutral-900 overflow-hidden">
        <NextImage
          src={images[selectedIdx]?.url || images[0].url}
          alt={images[selectedIdx]?.altText || title}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 60vw"
          className="object-cover object-center transition-all duration-500"
        />
      </div>
    </div>
  );
}
