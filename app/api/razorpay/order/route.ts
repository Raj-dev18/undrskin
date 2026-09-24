import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(request: NextRequest) {
  try {
    const { amount, currency = "USD", items } = await request.json();

    if (!amount) {
      return NextResponse.json({ error: 'Amount is required' }, { status: 400 });
    }

    // Initialize Razorpay
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || '',
      key_secret: process.env.RAZORPAY_KEY_SECRET || '',
    });

    const options = {
      amount: Math.round(amount * 100), // amount in smallest currency unit
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
    });
  } catch (error: any) {
    console.error('Razorpay Order error:', error);
    return NextResponse.json(
      { error: error.message || 'Error creating Razorpay order' },
      { status: 500 }
    );
  }
}
