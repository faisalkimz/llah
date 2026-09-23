# Usage Aggregation Module

**Status**: ✅ Complete  
**Module ID**: 08  
**Organization Scoping**: Yes

## Overview

Aggregates raw usage events into summary records by customer, meter, and time period. Used for billing calculations.

## API Endpoints

### POST /v1/usage-aggregation/aggregate
Aggregate usage for a period.

**Request**:
```json
{
  "customerId": "cm...",
  "meterId": "cm...",
  "periodStart": "2026-09-01T00:00:00Z",
  "periodEnd": "2026-09-30T23:59:59Z"
}
```

### GET /v1/usage-aggregation
List aggregates with filters.
