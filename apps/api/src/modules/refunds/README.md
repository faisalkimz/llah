# Refunds Module

Manages payment refunds.

## API Endpoints

### POST /api/refunds
Create a refund for a payment.

**Body:**
```json
{
  "paymentId": "pay_123",
  "amountMinor": 5000,
  "reason": "Customer request",
  "providerRefundId": "re_abc123"
}
```

### GET /api/refunds
List refunds.

### GET /api/refunds/:refundId
Get refund details.

## Features
- Full or partial refunds
- Reason tracking
- Provider refund ID tracking
- Linked to original payment
