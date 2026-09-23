# Adjustments Module

Manual billing adjustments (credits/debits).

## API Endpoints

### POST /api/adjustments
Create a billing adjustment.

**Body:**
```json
{
  "customerId": "cust_123",
  "type": "CREDIT",
  "currency": "USD",
  "amountMinor": 5000,
  "reason": "Service credit for downtime",
  "referenceType": "incident",
  "referenceId": "inc_456"
}
```

### GET /api/adjustments
List adjustments.

### GET /api/adjustments/:adjustmentId
Get adjustment details.

## Features
- Manual debit/credit adjustments
- Reason tracking (required)
- Reference to source incident/ticket
- Audit trail
