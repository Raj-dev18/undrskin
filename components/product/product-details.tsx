'use client';

import React, { useState } from 'react';
import { Product, ProductVariant } from '@/types/product';
import { useCart } from '@/components/cart/cart-context';

interface ProductDetailsProps {
  product: Product;
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const { addItem, openCart } = useCart();
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    product.options.forEach((opt) => {
      if (opt.values.length > 0) {
        initial[opt.name] = opt.values[0].value;
      }
    });
    return initial;
  });

  const [quantity, setQuantity] = useState(1);
  const [activeAccordion, setActiveAccordion] = useState<string | null>('details');
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Match selected variant
  const selectedVariant: ProductVariant =
    product.variants.find((v) =>
      v.selectedOptions.every((so) => selectedOptions[so.name] === so.value)
    ) || product.variants[0];

  const handleOptionChange = (optionName: string, value: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionName]: value,
    }));
  };

  const handleAddToCart = () => {
    if (!selectedVariant || !selectedVariant.availableForSale) return;
    addItem(product, selectedVariant, quantity);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 2000);
  };

  const handleBuyNow = async () => {
    if (!selectedVariant || !selectedVariant.availableForSale || isCheckingOut) return;
    setIsCheckingOut(true);
    addItem(product, selectedVariant, quantity);
    openCart();
    setIsCheckingOut(false);
  };

  return (
    <div className="space-y-8">
      {/* Title, Sku & Price */}
      <div className="space-y-2 border-b border-neutral-900 pb-6">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-400 font-mono">
            {product.subtitle || product.collections[0]?.replace('-', ' ') || 'Studio Collection'}
          </span>
          {selectedVariant?.sku && (
            <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-mono">
              SKU: {selectedVariant.sku}
            </span>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl font-light text-white tracking-tight uppercase">
          {product.title}
        </h1>

        <div className="flex items-center space-x-3 pt-1">
          <span className="text-lg font-mono text-white">
            ${selectedVariant ? selectedVariant.price.amount.toFixed(2) : product.price.amount.toFixed(2)}
          </span>
          {selectedVariant?.price.compareAtAmount && (
            <span className="text-sm font-mono text-neutral-500 line-through">
              ${selectedVariant.price.compareAtAmount.toFixed(2)}
            </span>
          )}
          <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-mono">
            Taxes Included
          </span>
        </div>
      </div>

      {/* Variant Option Selectors (Color Swatches & Size Buttons) */}
      <div className="space-y-6">
        {product.options.map((option) => {
          const isColorOption = option.name.toLowerCase().includes('color') || option.name.toLowerCase().includes('shade');

          return (
            <div key={option.id || option.name} className="space-y-2.5">
              <div className="flex justify-between text-xs uppercase tracking-widest">
                <span className="text-neutral-400">{option.name}</span>
                <span className="text-white font-medium">
                  {selectedOptions[option.name]}
                </span>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {option.values.map((optVal) => {
                  const isSelected = selectedOptions[option.name] === optVal.value;

                  if (isColorOption && optVal.hexColor) {
                    return (
                      <button
                        key={optVal.value}
                        type="button"
                        onClick={() => handleOptionChange(option.name, optVal.value)}
                        className={`relative w-8 h-8 rounded-full border-2 transition-all p-0.5 ${
                          isSelected ? 'border-white scale-110' : 'border-transparent hover:border-neutral-700'
                        }`}
                        title={optVal.name}
                        aria-label={optVal.name}
                      >
                        <span
                          className="block w-full h-full rounded-full border border-black/20"
                          style={{ backgroundColor: optVal.hexColor }}
                        />
                      </button>
                    );
                  }

                  return (
                    <button
                      key={optVal.value}
                      type="button"
                      onClick={() => handleOptionChange(option.name, optVal.value)}
                      className={`px-4 py-2 text-xs uppercase tracking-wider border transition-all ${
                        isSelected
                          ? 'border-white bg-white text-black font-medium'
                          : 'border-neutral-800 text-neutral-300 hover:border-neutral-600'
                      }`}
                    >
                      {optVal.name || optVal.value}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Quantity Selector */}
        <div className="space-y-2 pt-1">
          <label className="text-xs uppercase tracking-widest text-neutral-400 block">
            Quantity
          </label>
          <div className="flex items-center w-32 border border-neutral-800 bg-neutral-950">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-10 h-10 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
            >
              -
            </button>
            <span className="flex-1 text-center font-mono text-xs text-white">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              className="w-10 h-10 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="space-y-3 pt-2">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!selectedVariant?.availableForSale}
          className={`w-full py-4 text-xs uppercase tracking-widest font-medium transition-all duration-300 ${
            !selectedVariant?.availableForSale
              ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
              : addedAnimation
              ? 'bg-neutral-900 text-white border border-white'
              : 'bg-white text-black hover:bg-neutral-200 active:scale-[0.99]'
          }`}
        >
          {!selectedVariant?.availableForSale
            ? 'Currently Unavailable'
            : addedAnimation
            ? 'Added to Bag ✓'
            : `Add to Bag — $${((selectedVariant?.price.amount || product.price.amount) * quantity).toFixed(2)}`}
        </button>

        {selectedVariant?.availableForSale && (
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={isCheckingOut}
            className="w-full py-3.5 border border-neutral-700 hover:border-white text-white text-xs uppercase tracking-widest font-medium transition-colors"
          >
            {isCheckingOut ? 'Preparing Bag...' : 'Proceed to Bag / Buy Now'}
          </button>
        )}

        <p className="text-[10px] text-center uppercase tracking-widest text-neutral-400 font-mono">
          Free Express Shipping over $150 • 30-Day Discreet Returns
        </p>
      </div>

      {/* Collapsible Accordions */}
      <div className="border-t border-neutral-900 pt-4 space-y-2">
        {/* Description & Details */}
        <div className="border-b border-neutral-900">
          <button
            onClick={() =>
              setActiveAccordion(activeAccordion === 'details' ? null : 'details')
            }
            className="w-full py-4 flex items-center justify-between text-xs uppercase tracking-widest text-white text-left"
          >
            <span>Silhouette & Details</span>
            <span className="font-mono text-neutral-500">
              {activeAccordion === 'details' ? '−' : '+'}
            </span>
          </button>
          {activeAccordion === 'details' && (
            <div className="pb-4 text-xs text-neutral-400 font-light leading-relaxed space-y-3">
              <p>{product.description}</p>
              {product.details && product.details.length > 0 && (
                <ul className="pt-2 space-y-1 list-disc list-inside">
                  {product.details.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Fit & Sizing */}
        <div className="border-b border-neutral-900">
          <button
            onClick={() =>
              setActiveAccordion(activeAccordion === 'fit' ? null : 'fit')
            }
            className="w-full py-4 flex items-center justify-between text-xs uppercase tracking-widest text-white text-left"
          >
            <span>Fit & Measurements</span>
            <span className="font-mono text-neutral-500">
              {activeAccordion === 'fit' ? '−' : '+'}
            </span>
          </button>
          {activeAccordion === 'fit' && (
            <div className="pb-4 text-xs text-neutral-400 font-light leading-relaxed space-y-2">
              <p>True to size. Engineered with multidirectional elasticity to hug natural contours without constriction.</p>
              <p>Model is 5'9" (175cm) wearing Size Small.</p>
            </div>
          )}
        </div>

        {/* Garment Care */}
        <div className="border-b border-neutral-900">
          <button
            onClick={() =>
              setActiveAccordion(activeAccordion === 'care' ? null : 'care')
            }
            className="w-full py-4 flex items-center justify-between text-xs uppercase tracking-widest text-white text-left"
          >
            <span>Sustainable Care</span>
            <span className="font-mono text-neutral-500">
              {activeAccordion === 'care' ? '−' : '+'}
            </span>
          </button>
          {activeAccordion === 'care' && (
            <div className="pb-4 text-xs text-neutral-400 font-light leading-relaxed space-y-2">
              {product.fabricAndCare && product.fabricAndCare.length > 0 ? (
                <ul className="space-y-1 list-disc list-inside">
                  {product.fabricAndCare.map((fc, i) => (
                    <li key={i}>{fc}</li>
                  ))}
                </ul>
              ) : (
                <p>Hand wash cold or machine wash gentle in protective wash bag. Flat dry in shade. Do not tumble dry or bleach.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
