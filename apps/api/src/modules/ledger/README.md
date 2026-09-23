# Ledger Module

Financial ledger tracking all monetary transactions.

## API Endpoints

### POST /api/ledger
Create a ledger entry.

**Headers:**
- `x-organization-id` (required)

**Body:**
```json
{
  "customerId": "cust_123",
  "type": "CHARGE",
  "currency": "USD",
  "amountMinor": 5000,
  "referenceType": "invoice",
  "referenceId": "inv_456",
  "description": "Invoice payment"
}
```

**Entry Types:**
- CHARGE - Money owed by customer
- PAYMENT - Money received from customer
- CREDIT - Credit applied to customer
- REFUND - Money returned to customer
- ADJUSTMENT - Manual correction

### GET /api/ledger
List ledger entries with filters.

**Query:**
- `customerId` (string, optional)
- `type` (CHARGE|PAYMENT|CREDIT|REFUND|ADJUSTMENT, optional)
- `limit` (number, default: 20, max: 100)
- `offset` (number, default: 0)

### GET /api/ledger/:entryId
Get ledger entry details.

## Features
- Double-entry bookkeeping foundation
- All amounts in minor units (cents)
- Immutable entries
- Reference tracking to source transactions
