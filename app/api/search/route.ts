import { NextRequest, NextResponse } from 'next/server';
import { searchProducts } from '@/lib/shopify';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const q = searchParams.get('q') || '';

  if (!q.trim()) {
    return NextResponse.json({ products: [] });
  }

  try {
    const products = await searchProducts(q.trim());
    return NextResponse.json({ products });
  } catch (error: any) {
    console.error('API /api/search error:', error.message || error);
    return NextResponse.json({ products: [] }, { status: 500 });
  }
}
