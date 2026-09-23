# Products Module

**Status**: ✅ Complete  
**Module ID**: 09  
**Organization Scoping**: Yes

## Overview

Products represent billable offerings. Each product can have multiple prices with different billing schemes.

## API Endpoints

### POST /v1/products
Create product.

**Request**:
```json
{
  "name": "API Access",
  "description": "Access to our REST API",
  "active": true
}
```

### GET /v1/products
List products (`search`, `active`, pagination).

### GET /v1/products/:id
Get product with price count.

### PATCH /v1/products/:id
Update name, description, or active status.

### DELETE /v1/products/:id
Delete product.
