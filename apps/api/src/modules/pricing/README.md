# Pricing Module

**Status**: ✅ Complete  
**Module ID**: 10  
**Organization Scoping**: Yes

## Overview

Prices define how products are charged. Supports flat fees, per-unit pricing, and tiered pricing. Can be meter-based for usage billing.

## Billing Schemes

- **flat**: Fixed amount per period
- **per_unit**: Price per unit of usage (requires meter)
- **tiered**: Volume discounts (requires meter)

## API Endpoints

### POST /v1/pricing
Create price.

**Request**:
```json
{
  "productId": "cm...",
  "meterId": "cm...",
  "name": "$0.01 per API call",
  "currency": "USD",
  "billingScheme": "per_unit",
  "unitAmountMinor": 10,
  "active": true
}
```

### GET /v1/pricing
List prices (filter by `productId`, `meterId`, `active`).

### GET /v1/pricing/:id
Get single price.

### PATCH /v1/pricing/:id
Update name or active status.

### DELETE /v1/pricing/:id
Delete price.
