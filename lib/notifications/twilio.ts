import twilio from 'twilio';

// Initialize the Twilio client using environment variables.
// These variables must remain strictly server-side.
const accountSid = process.env.TWILIO_ACCOUNT_SID || '';
const authToken = process.env.TWILIO_AUTH_TOKEN || '';
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER || '';
const twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER || '';

// Avoid instantiating the client if credentials are dummy/missing to prevent crashes.
const isConfigured = accountSid && authToken && !accountSid.includes('dummy');
const client = isConfigured ? twilio(accountSid, authToken) : null;

/**
 * Sends a standard SMS message.
 * @param to Phone number to send the SMS to (must include country code, e.g. +91...)
 * @param body The text content of the SMS.
 */
export async function sendSMS(to: string, body: string): Promise<boolean> {
  if (!client || !isConfigured) {
    console.warn(`[Twilio] SMS mocked to ${to}: ${body}`);
    return true; // Pretend it succeeded in dev without creds
  }

  try {
    const message = await client.messages.create({
      body,
      from: twilioPhoneNumber,
      to,
    });
    console.log(`[Twilio] SMS sent to ${to}, SID: ${message.sid}`);
    return true;
  } catch (error) {
    console.error(`[Twilio] Error sending SMS to ${to}:`, error);
    return false;
  }
}

/**
 * Sends a WhatsApp message using Twilio's WhatsApp Sandbox or configured sender.
 * @param to Phone number (without 'whatsapp:' prefix, but with country code).
 * @param body The text content of the WhatsApp message.
 */
export async function sendWhatsApp(to: string, body: string): Promise<boolean> {
  if (!client || !isConfigured) {
    console.warn(`[Twilio] WhatsApp mocked to ${to}: ${body}`);
    return true;
  }

  try {
    const message = await client.messages.create({
      body,
      from: `whatsapp:${twilioWhatsAppNumber}`,
      to: `whatsapp:${to.replace('whatsapp:', '')}`,
    });
    console.log(`[Twilio] WhatsApp sent to ${to}, SID: ${message.sid}`);
    return true;
  } catch (error) {
    console.error(`[Twilio] Error sending WhatsApp to ${to}:`, error);
    return false;
  }
}

/**
 * Helper to send a templated Order Confirmation message via SMS and/or WhatsApp.
 */
export async function sendOrderConfirmationNotification(to: string, orderId: string, amount: string | number, itemsCount: number): Promise<void> {
  const message = `UNDRSKIN STUDIO: Order confirmed. Receipt ${orderId} for ${amount} (${itemsCount} items) is being processed. Thank you for your purchase.`;
  
  // You can decide to send via SMS, WhatsApp, or both based on user preference.
  // For demonstration, we'll try SMS first.
  await sendSMS(to, message);
}

/**
 * Helper to send an OTP via SMS.
 */
export async function sendOTPNotification(to: string, otp: string): Promise<void> {
  const message = `Your UNDRSKIN verification code is ${otp}. Please do not share this code.`;
  await sendSMS(to, message);
}
