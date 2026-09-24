import { NextRequest, NextResponse } from 'next/server';
import { getStoredOTP, clearStoredOTP } from '../send/route';

export async function POST(request: NextRequest) {
  try {
    const { phone, code } = await request.json();
    if (!phone || !code) {
      return NextResponse.json({ error: 'Phone and code are required' }, { status: 400 });
    }

    const stored = getStoredOTP(phone);
    if (!stored) {
      return NextResponse.json({ success: false, error: 'No OTP found for this number' }, { status: 400 });
    }

    if (Date.now() > stored.expiresAt) {
      clearStoredOTP(phone);
      return NextResponse.json({ success: false, error: 'OTP expired' }, { status: 400 });
    }

    if (stored.code !== code.toString()) {
      return NextResponse.json({ success: false, error: 'Invalid OTP' }, { status: 400 });
    }

    // Success! Clear the OTP.
    clearStoredOTP(phone);
    return NextResponse.json({ success: true, message: 'Phone verified successfully' });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    return NextResponse.json({ error: 'Failed to verify OTP' }, { status: 500 });
  }
}
