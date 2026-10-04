import { NextResponse } from 'next/server';
import { getProducts } from '@/lib/shopify';
import { getJudgeMeStoreReviews } from '@/lib/judgeme';

export async function GET() {
  try {
    const [products, reviews] = await Promise.all([
      getProducts(),
      getJudgeMeStoreReviews(20),
    ]);

    return NextResponse.json({
      products: products.slice(0, 4).map((product) => ({
        title: product.title,
        featuredImage: product.featuredImage?.url || null,
      })),
      reviews,
    });
  } catch (error) {
    console.error('[home] Failed to load Shopify/Judge.me data:', error);
    return NextResponse.json({ products: [], reviews: [] }, { status: 200 });
  }
}
