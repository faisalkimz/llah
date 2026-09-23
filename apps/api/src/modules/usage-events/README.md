# Usage Events Module

**Status**: ✅ Complete  
**Module ID**: 07  
**Organization Scoping**: Yes (via `x-organization-id` header)

## Overview

The Usage Events module handles idempotent ingestion of metered usage data. Each event represents a measurement (API call, storage amount, message sent, etc.) tied to a customer and meter. The idempotency key ensures duplicate events are not created.

## Key Features

- **Idempotent Ingestion**: Duplicate events rejected via unique idempotency key
- **Precise Measurement**: Decimal quantity with 30,10 precision
- **Event Timestamp**: `eventAt` for when usage occurred vs `receivedAt` for when received
- **Filtering**: Query by customer, meter, date range

## API Endpoints

### POST /v1/usage-events
Ingest a usage event (idempotent).

**Request**:
```json
{
  "idempotencyKey": "evt_2026-09-21_customer-123_api-call-456",
  "customerId": "cm...",
  "meterId": "cm...",
  "quantity": 1.0,
  "eventAt": "2026-09-21T10:30:00Z",
  "properties": {"endpoint": "/api/v1/users"}
}
```

**Response** (201 if created, 200 if duplicate):
```json
{
  "data": {...},
  "meta": {"wasCreated": true}
}
```

### GET /v1/usage-events
List events with filters.

**Query Params**:
- `customerId`, `meterId`, `startDate`, `endDate`
- `limit` (1-1000, default 100), `offset`

### GET /v1/usage-events/:id
Get single event.
