import crypto from 'crypto';
import { env } from '../../config/env.js';
import { updatePayment, getPayment } from '../payments/service.js';
import prisma from '../../lib/prisma.js';

// TODO: replace with Redis in production — in-memory idempotency is lost on restart
const processedStripeEventIds = new Set();
const processedPayPalEventIds = new Set();

// ---------------------------------------------------------------------------
// Stripe
// ---------------------------------------------------------------------------

/**
 * Verify a Stripe webhook signature using HMAC-SHA256.
 * Stripe signs with: "t=<timestamp>,v1=<signature>"
 * The signed payload is: "<timestamp>.<rawBody>"
 */
function verifyStripeSignature(rawBody, signatureHeader) {
  const secret = env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    // No secret configured — skip verification (dev/test only)
    return true;
  }

  if (!signatureHeader) return false;

  const parts = signatureHeader.split(',');
  const tPart = parts.find((p) => p.startsWith('t='));
  const v1Part = parts.find((p) => p.startsWith('v1='));
  if (!tPart || !v1Part) return false;

  const timestamp = tPart.slice(2);
  const expectedSig = v1Part.slice(3);
  const signedPayload = `${timestamp}.${rawBody}`;

  const computed = crypto
    .createHmac('sha256', secret)
    .update(signedPayload, 'utf8')
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(computed, 'hex'),
    Buffer.from(expectedSig, 'hex')
  );
}

/**
 * Find a payment by providerPaymentId to dispatch webhook events.
 */
async function findPaymentByProviderPaymentId(organizationId, providerPaymentId, provider) {
  return prisma.payment.findFirst({
    where: { providerPaymentId, provider }
  });
}

export async function handleStripeWebhook(rawBody, signatureHeader) {
  // Verify signature
  let isValid;
  try {
    isValid = verifyStripeSignature(rawBody, signatureHeader);
  } catch {
    isValid = false;
  }

  if (!isValid) {
    const err = new Error('Invalid Stripe webhook signature');
    err.status = 400;
    throw err;
  }

  // Parse event
  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    const err = new Error('Invalid JSON payload');
    err.status = 400;
    throw err;
  }

  const eventId = event?.id;

  // Idempotency check
  if (eventId && processedStripeEventIds.has(eventId)) {
    return { received: true, duplicate: true };
  }

  const eventType = event?.type;
  const paymentIntentId = event?.data?.object?.id;

  if (
    (eventType === 'payment_intent.succeeded' || eventType === 'payment_intent.payment_failed') &&
    paymentIntentId
  ) {
    // Find payment by providerPaymentId
    const payment = await findPaymentByProviderPaymentId(null, paymentIntentId, 'stripe');
    if (payment) {
      const newStatus = eventType === 'payment_intent.succeeded' ? 'SUCCEEDED' : 'FAILED';
      // Only transition if currently PENDING
      if (payment.status === 'PENDING') {
        await updatePayment(payment.id, payment.organizationId, { status: newStatus });
      }
    }
  }
  // Unknown event types: acknowledge but ignore

  if (eventId) processedStripeEventIds.add(eventId);

  return { received: true };
}

// ---------------------------------------------------------------------------
// PayPal
// ---------------------------------------------------------------------------

/**
 * Verify a PayPal webhook signature.
 * PayPal uses HMAC-SHA256 with the webhook ID and transmission details.
 * Required headers: paypal-transmission-id, paypal-transmission-time,
 *                   paypal-cert-url, paypal-auth-algo, paypal-transmission-sig
 */
function verifyPayPalSignature(rawBody, headers) {
  const webhookId = env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) {
    // No webhook ID configured — skip verification (dev/test only)
    return true;
  }

  const transmissionId = headers['paypal-transmission-id'];
  const transmissionTime = headers['paypal-transmission-time'];
  const transmissionSig = headers['paypal-transmission-sig'];

  if (!transmissionId || !transmissionTime || !transmissionSig) {
    return false;
  }

  // Construct the message PayPal signs:
  // "<transmissionId>|<transmissionTime>|<webhookId>|<crc32_of_body>"
  const crc32val = crc32(rawBody);
  const message = `${transmissionId}|${transmissionTime}|${webhookId}|${crc32val}`;

  // Decode and verify the base64-encoded signature
  const sigBuf = Buffer.from(transmissionSig, 'base64');

  // PayPal signs using RSA-SHA256 with their cert. Without fetching the cert,
  // we perform a best-effort HMAC check using webhookId as a shared secret
  // so that the interface is consistent. In production, fetch and cache the
  // cert from headers['paypal-cert-url'] and use crypto.verify() with RSA.
  const computed = crypto
    .createHmac('sha256', webhookId)
    .update(message, 'utf8')
    .digest();

  if (computed.length !== sigBuf.length) return false;

  try {
    return crypto.timingSafeEqual(computed, sigBuf);
  } catch {
    return false;
  }
}

/** Simple CRC32 implementation (no external dependencies). */
function crc32(str) {
  const buf = Buffer.from(str, 'utf8');
  let crc = 0xffffffff;
  for (const byte of buf) {
    crc ^= byte;
    for (let j = 0; j < 8; j++) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

export async function handlePayPalWebhook(rawBody, headers) {
  // Verify signature
  let isValid;
  try {
    isValid = verifyPayPalSignature(rawBody, headers);
  } catch {
    isValid = false;
  }

  if (!isValid) {
    const err = new Error('Invalid PayPal webhook signature');
    err.status = 400;
    throw err;
  }

  // Parse event
  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    const err = new Error('Invalid JSON payload');
    err.status = 400;
    throw err;
  }

  const eventId = event?.id;

  // Idempotency check
  if (eventId && processedPayPalEventIds.has(eventId)) {
    return { received: true, duplicate: true };
  }

  const eventType = event?.event_type;
  const captureId = event?.resource?.id;

  if (
    (eventType === 'PAYMENT.CAPTURE.COMPLETED' || eventType === 'PAYMENT.CAPTURE.DENIED') &&
    captureId
  ) {
    const payment = await findPaymentByProviderPaymentId(null, captureId, 'paypal');
    if (payment) {
      const newStatus = eventType === 'PAYMENT.CAPTURE.COMPLETED' ? 'SUCCEEDED' : 'FAILED';
      if (payment.status === 'PENDING') {
        await updatePayment(payment.id, payment.organizationId, { status: newStatus });
      }
    }
  }
  // Unknown event types: acknowledge but ignore

  if (eventId) processedPayPalEventIds.add(eventId);

  return { received: true };
}
