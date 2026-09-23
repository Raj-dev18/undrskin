import { NextRequest, NextResponse } from 'next/server';
import { createShopifyCheckoutUrl } from '@/lib/shopify';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'No line items provided for checkout.' },
        { status: 400 }
      );
    }

    const lineItems = items.map((item: any) => ({
      variantId: String(item.variantId || item.variant?.id || ''),
      quantity: Number(item.quantity || 1),
    }));

    const checkoutUrl = await createShopifyCheckoutUrl(lineItems);

    return NextResponse.json({ checkoutUrl });
  } catch (error: any) {
    console.error('Checkout API error:', error.message || error);
    return NextResponse.json(
      { error: error.message || 'Failed to initialize Shopify checkout session.' },
      { status: 500 }
    );
  }
}
