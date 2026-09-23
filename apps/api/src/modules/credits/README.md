# Credits Module

Manages customer credit grants and balances.

## API Endpoints

### POST /api/credits
Grant credits to a customer.

**Body:**
```json
{
  "customerId": "cust_123",
  "currency": "USD",
  "amountMinor": 10000,
  "reason": "Promotional credit",
  "expiresAt": "2026-12-31T23:59:59Z"
}
```

### GET /api/credits
List credit grants.

### GET /api/credits/:grantId
Get credit grant details.

## Features
- Grant credits to customers
- Track remaining balance
- Expiration dates
- Reason tracking
