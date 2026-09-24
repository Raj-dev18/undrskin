import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

import { calculateCartSubtotal } from '@/lib/shopify';

export async function POST(request: NextRequest) {
  try {
    const { currency = "USD", items } = await request.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Cart items are required' }, { status: 400 });
    }

    const calculatedAmount = await calculateCartSubtotal(items);
    if (calculatedAmount <= 0) {
      return NextResponse.json({ error: 'Invalid cart amount' }, { status: 400 });
    }

    // Initialize Razorpay
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || '',
      key_secret: process.env.RAZORPAY_KEY_SECRET || '',
    });

    const options = {
      amount: Math.round(calculatedAmount * 100), // amount in smallest currency unit
      currency,
      receipt: `receipt_order_${Date.now()}`,
    };

    const order = await instance.orders.create(options);

    if (!order) {
      return NextResponse.json({ error: 'Failed to create Razorpay order' }, { status: 500 });
    }

    return NextResponse.json({
      id: order.id,
      currency: order.currency,
      amount: order.amount,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error: any) {
    console.error('Razorpay Order error:', error);
    return NextResponse.json(
      { error: error.message || 'Error creating Razorpay order' },
      { status: 500 }
    );
  }
}
