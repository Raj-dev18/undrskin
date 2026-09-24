import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json();

    const secret = process.env.RAZORPAY_KEY_SECRET || '';

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Signature is valid. 
      // Here you would typically trigger Shopify order creation, clear the cart, etc.
      return NextResponse.json({ success: true, message: 'Payment verified successfully' }, { status: 200 });
    } else {
      return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Razorpay Verification error:', error);
    return NextResponse.json({ success: false, error: 'Verification failed' }, { status: 500 });
  }
}
