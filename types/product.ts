export interface ProductImage {
  id: string;
  url: string;
  altText: string;
  width?: number;
  height?: number;
}

export interface ProductPrice {
  amount: number;
  currencyCode: string;
  compareAtAmount?: number;
  formattedAmount: string;
  formattedCompareAtAmount?: string;
}

export interface ProductOptionValue {
  name: string;
  value: string;
  hexColor?: string;
  inStock?: boolean;
}

export interface ProductOption {
  id: string;
  name: string;
  values: ProductOptionValue[];
}

export interface ProductVariant {
  id: string;
  title: string;
  sku: string;
  availableForSale: boolean;
  selectedOptions: {
    name: string;
    value: string;
  }[];
  price: ProductPrice;
  image?: ProductImage;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  title: string;
  content: string;
  date: string;
  verifiedBuyer: boolean;
  fitFeedback?: 'Runs small' | 'True to size' | 'Runs large';
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

export interface Product {
  id: string;
  handle: string;
  title: string;
  subtitle?: string;
  description: string;
  descriptionHtml?: string;
  details: string[];
  fabricAndCare: string[];
  shippingAndReturns: string[];
  price: ProductPrice;
  featuredImage: ProductImage;
  images: ProductImage[];
  options: ProductOption[];
  variants: ProductVariant[];
  tags: string[];
  collections: string[];
  availableForSale: boolean;
  badge?: 'NEW' | 'BESTSELLER' | 'LIMITED' | 'RESTOCKED' | null;
  rating: number;
  reviewCount: number;
  reviews?: Review[];
  judgeMeWidgetHtml?: string;
}

export interface Collection {
  id: string;
  handle: string;
  title: string;
  description: string;
  image: ProductImage;
  productCount: number;
}
