import { NextRequest, NextResponse } from 'next/server';
import { sendOTPNotification } from '@/lib/notifications/twilio';

// In-memory store for OTPs (For demonstration/development purposes only)
// In production, use Redis or a database.
const otpStore = new Map<string, { code: string; expiresAt: number }>();

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();
    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    otpStore.set(phone, { code, expiresAt });

    // Send OTP via Twilio
    await sendOTPNotification(phone, code);

    // Send back success (DO NOT SEND CODE TO CLIENT)
    return NextResponse.json({ success: true, message: 'OTP sent' });
  } catch (error) {
    console.error('Send OTP Error:', error);
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}

export function getStoredOTP(phone: string) {
  return otpStore.get(phone);
}
export function clearStoredOTP(phone: string) {
  otpStore.delete(phone);
}
