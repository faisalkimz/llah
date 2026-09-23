# Invoices Module

Manages invoices with line items and payment tracking.

## API Endpoints

### POST /api/invoices
Create a draft invoice with line items.

**Body:**
```json
{
  "customerId": "cust_123",
  "number": "INV-2026-001",
  "currency": "USD",
  "periodStart": "2026-01-01T00:00:00Z",
  "periodEnd": "2026-02-01T00:00:00Z",
  "dueAt": "2026-02-15T00:00:00Z",
  "lines": [
    {
      "description": "Pro Plan - January 2026",
      "quantity": 1,
      "unitAmountMinor": 5000,
      "metadata": {}
    }
  ]
}
```

### GET /api/invoices
List invoices with filters.

**Query:**
- `customerId`, `status`, `limit`, `offset`

### GET /api/invoices/:invoiceId
Get invoice with lines and payments.

### PUT /api/invoices/:invoiceId
Update invoice status or due date.

### POST /api/invoices/:invoiceId/finalize
Finalize invoice (DRAFT → OPEN, set issuedAt).

## Features
- Draft and finalize workflow
- Automatic total calculation
- Line items with quantities
- Payment tracking
- Multiple statuses: DRAFT, OPEN, PAID, VOID, UNCOLLECTIBLE
