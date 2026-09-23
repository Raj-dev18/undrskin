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
  const [isZoomed, setIsZoomed] = useState(false);

  if (!images || images.length === 0) return null;

  const currentImage = images[selectedIdx] || images[0];

  return (
    <>
      <div className="flex flex-col-reverse md:flex-row gap-4">
        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto max-h-[640px] scrollbar-none">
            {images.map((img, idx) => (
              <button
                key={`${img.url}-${idx}`}
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

        {/* Main Image with Zoom on Click */}
        <div
          className="relative aspect-[3/4] flex-1 bg-neutral-900 overflow-hidden cursor-zoom-in group"
          onClick={() => setIsZoomed(true)}
        >
          <NextImage
            src={currentImage.url}
            alt={currentImage.altText || title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-cover object-center transition-all duration-500 group-hover:scale-105"
          />
          <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 text-[10px] uppercase font-mono tracking-wider text-neutral-300 opacity-0 group-hover:opacity-100 transition-opacity">
            Click to Zoom
          </div>
        </div>
      </div>

      {/* Fullscreen Lightbox / Zoom Modal */}
      {isZoomed && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-lg flex items-center justify-center p-4"
          onClick={() => setIsZoomed(false)}
        >
          <button
            onClick={() => setIsZoomed(false)}
            className="absolute top-6 right-6 text-neutral-400 hover:text-white p-2 text-sm uppercase tracking-widest font-mono z-50"
            aria-label="Close zoomed view"
          >
            Close ✕
          </button>
          <div
            className="relative w-full max-w-4xl h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <NextImage
              src={currentImage.url}
              alt={currentImage.altText || title}
              fill
              className="object-contain"
              sizes="90vw"
            />
          </div>
        </div>
      )}
    </>
  );
}
