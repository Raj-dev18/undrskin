import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { sendOrderConfirmationNotification } from '@/lib/notifications/twilio';

export async function POST(request: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, phone, amount, itemsCount } = await request.json();

    const secret = process.env.RAZORPAY_KEY_SECRET || '';

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Signature is valid. 
      // Trigger SMS notification if phone is available
      if (phone) {
        try {
          await sendOrderConfirmationNotification(phone, razorpay_order_id, amount || 'the total', itemsCount || 1);
        } catch (notifErr) {
          console.warn('Notification delivery failed or skipped:', notifErr);
        }
      }
      
      return NextResponse.json({
        success: true,
        message: 'Payment verified successfully',
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
      }, { status: 200 });
    } else {
      return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Razorpay Verification error:', error);
    return NextResponse.json({ success: false, error: 'Verification failed' }, { status: 500 });
  }
}
