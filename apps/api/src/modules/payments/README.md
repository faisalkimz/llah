# Payments Module

Manages payment records from payment providers.

## API Endpoints

### POST /api/payments
Record a payment.

**Body:**
```json
{
  "invoiceId": "inv_123",
  "provider": "stripe",
  "providerPaymentId": "pi_abc123",
  "currency": "USD",
  "amountMinor": 5000
}
```

### GET /api/payments
List payments with filters (invoiceId, status).

### GET /api/payments/:paymentId
Get payment details.

### PUT /api/payments/:paymentId
Update payment status.

## Features
- Multi-provider support (Stripe, PayPal, etc.)
- Payment status tracking
- Invoice association
- Refund support
