import { Product, Collection, FAQItem } from '@/types/product';
import { MOCK_PRODUCTS, MOCK_COLLECTIONS, MOCK_FAQS } from '@/lib/mock-data';

export async function getProducts(options?: {
  collection?: string;
  query?: string;
  sortKey?: 'PRICE' | 'BEST_SELLING' | 'CREATED_AT';
  reverse?: boolean;
}): Promise<Product[]> {
  let products = [...MOCK_PRODUCTS];

  if (options?.collection) {
    products = products.filter((p) => p.collections.includes(options.collection!));
  }

  if (options?.query) {
    const q = options.query.toLowerCase();
    products = products.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  if (options?.sortKey) {
    if (options.sortKey === 'PRICE') {
      products.sort((a, b) =>
        options.reverse ? b.price.amount - a.price.amount : a.price.amount - b.price.amount
      );
    } else if (options.sortKey === 'BEST_SELLING') {
      products.sort((a, b) => b.reviewCount - a.reviewCount);
    }
  }

  return products;
}

export async function getProductByHandle(handle: string): Promise<Product | undefined> {
  return MOCK_PRODUCTS.find((p) => p.handle === handle);
}

export async function getFeaturedProducts(limit = 4): Promise<Product[]> {
  return MOCK_PRODUCTS.slice(0, limit);
}

export async function getCollections(): Promise<Collection[]> {
  return MOCK_COLLECTIONS;
}

export async function getCollectionByHandle(handle: string): Promise<Collection | undefined> {
  return MOCK_COLLECTIONS.find((c) => c.handle === handle);
}

export async function getFAQs(): Promise<FAQItem[]> {
  return MOCK_FAQS;
}
