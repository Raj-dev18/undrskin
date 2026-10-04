import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

import { calculateCartSubtotal } from '@/lib/shopify';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, customer } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Cart items are required' }, { status: 400 });
    }

    const calculatedAmount = await calculateCartSubtotal(items);
    if (calculatedAmount <= 0) {
      return NextResponse.json({ error: 'Invalid cart amount' }, { status: 400 });
    }

    // Initialize Razorpay
    const keyId = process.env.RAZORPAY_KEY_ID || '';
    const keySecret = process.env.RAZORPAY_KEY_SECRET || '';

    if (!keyId || !keySecret) {
      return NextResponse.json({ error: 'Razorpay payment gateway not configured' }, { status: 500 });
    }

    const instance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const notes: Record<string, string> = {
      store: 'UNDRSKIN Studio',
    };

    if (customer && typeof customer === 'object') {
      if (customer.name) notes.customer_name = String(customer.name).slice(0, 100);
      if (customer.email) notes.customer_email = String(customer.email).slice(0, 100);
      if (customer.phone) notes.customer_phone = String(customer.phone).slice(0, 20);
      if (customer.address) notes.shipping_address = String(customer.address).slice(0, 200);
      if (customer.city) notes.city = String(customer.city).slice(0, 50);
      if (customer.state) notes.state = String(customer.state).slice(0, 50);
      if (customer.pincode) notes.pincode = String(customer.pincode).slice(0, 20);
    }

    const options = {
      amount: Math.round(calculatedAmount * 100), // amount in paise
      currency: 'INR',
      receipt: `rcpt_${Date.now().toString(36)}`,
      notes,
    };

    const order = await instance.orders.create(options);

    if (!order) {
      return NextResponse.json({ error: 'Failed to create Razorpay order' }, { status: 500 });
    }

    return NextResponse.json({
      id: order.id,
      currency: order.currency,
      amount: order.amount,
      keyId,
    });
  } catch (error: any) {
    console.error('Razorpay Order error:', error);
    return NextResponse.json(
      { error: error.message || 'Error creating Razorpay order' },
      { status: 500 }
    );
  }
}
