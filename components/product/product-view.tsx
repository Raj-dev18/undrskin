'use client';

import React, { useState } from 'react';
import { Product, ProductVariant } from '@/types/product';
import { ProductGallery } from './product-gallery';
import { ProductDetails } from './product-details';
import { ExplodedProduct } from './exploded-product';

interface ProductViewProps {
  product: Product;
}

export function ProductView({ product }: ProductViewProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
    product.variants[0]
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
      <div className="lg:col-span-7">
        <ExplodedProduct
          imageUrl={selectedVariant?.image?.url || product.featuredImage?.url || product.images[0]?.url || '/placeholder.svg'}
          title={product.title}
        />
        <ProductGallery
          images={product.images}
          title={product.title}
          variantImage={selectedVariant?.image}
        />
      </div>

      <div className="product-details-panel lg:col-span-5 lg:sticky lg:top-28">
        <ProductDetails
          product={product}
          onVariantChange={setSelectedVariant}
        />
      </div>
    </div>
  );
}
