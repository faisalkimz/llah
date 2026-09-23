# Meters Module

**Status**: ✅ Complete  
**Module ID**: 06  
**Organization Scoping**: Yes (via `x-organization-id` header)

## Overview

The Meters module defines measurement units for usage-based billing. Meters specify what to measure (e.g., API calls, storage, messages) and how to aggregate usage data. Each meter has a unique key within an organization and can be referenced by usage events and pricing configuration.

## Features

- **Create Meter**: Define new measurement units with key, name, unit, and aggregation method
- **List Meters**: Paginated list with search by name or key
- **Get Meter**: Retrieve single meter with usage and price statistics
- **Update Meter**: Modify name, unit, or aggregation (key is immutable)
- **Delete Meter**: Remove meter (only if no usage events or prices exist)
- **Organization Scoping**: All operations scoped to a specific organization

## Database Schema

```prisma
model Meter {
  id             String       @id @default(cuid())
  organizationId String
  key            String       // Unique within org, snake_case
  name           String
  unit           String
  aggregation    String       @default("SUM")
  createdAt      DateTime     @default(now())
  
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  usageEvents    UsageEvent[]
  prices         Price[]
  
  @@unique([organizationId, key])
}
```

## Aggregation Methods

- **SUM**: Add up all values in a period (e.g., total API calls)
- **COUNT**: Count number of events (e.g., number of transactions)
- **MAX**: Maximum value in period (e.g., peak concurrent users)
- **LATEST**: Most recent value (e.g., current storage amount)

## API Endpoints

All endpoints require:
- Authentication: `Authorization: Bearer <token>`
- Organization context: `x-organization-id: <org_id>` header

### POST /v1/meters
Create a new meter.

**Request Body**:
```json
{
  "key": "api_calls",
  "name": "API Calls",
  "unit": "requests",
  "aggregation": "SUM"
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "id": "cm...",
    "organizationId": "cm...",
    "key": "api_calls",
    "name": "API Calls",
    "unit": "requests",
    "aggregation": "SUM",
    "createdAt": "2026-09-21T14:00:00.000Z"
  }
}
```

**Validation**:
- `key`: Required, 1-100 characters, snake_case format (lowercase, numbers, underscores), must start with letter
- `name`: Required, 1-255 characters
- `unit`: Required, 1-50 characters
- `aggregation`: Optional, one of: SUM, COUNT, MAX, LATEST (default: SUM)

**Errors**:
- 409: Meter key already exists in organization

### GET /v1/meters
List meters with pagination and search.

**Query Parameters**:
- `search` (optional): Search by name or key (case-insensitive)
- `limit` (optional, default: 20, max: 100): Results per page
- `offset` (optional, default: 0): Pagination offset
- `sortBy` (optional, default: createdAt): Sort field (name, key, createdAt)
- `sortOrder` (optional, default: desc): Sort order (asc, desc)

**Response** (200):
```json
{
  "success": true,
  "data": {
    "meters": [
      {
        "id": "cm...",
        "organizationId": "cm...",
        "key": "api_calls",
        "name": "API Calls",
        "unit": "requests",
        "aggregation": "SUM",
        "createdAt": "2026-09-21T14:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 5,
      "limit": 20,
      "offset": 0
    }
  }
}
```

### GET /v1/meters/:id
Get a single meter by ID with usage and price statistics.

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "cm...",
    "organizationId": "cm...",
    "key": "api_calls",
    "name": "API Calls",
    "unit": "requests",
    "aggregation": "SUM",
    "createdAt": "2026-09-21T14:00:00.000Z",
    "_count": {
      "usageEvents": 12500,
      "prices": 2
    }
  }
}
```

**Errors**:
- 404: Meter not found

### PATCH /v1/meters/:id
Update a meter. Key cannot be changed to maintain referential integrity.

**Request Body** (all optional, at least one required):
```json
{
  "name": "API Requests",
  "unit": "calls",
  "aggregation": "COUNT"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "cm...",
    "key": "api_calls",
    "name": "API Requests",
    "unit": "calls",
    "aggregation": "COUNT",
    ...
  }
}
```

**Errors**:
- 404: Meter not found
- 400: No fields provided for update

### DELETE /v1/meters/:id
Delete a meter. Only allowed if meter has no usage events or prices.

**Response** (204): No content

**Errors**:
- 404: Meter not found
- 409: Meter has usage events (cannot delete, would orphan data)
- 409: Meter is used in prices (remove from prices first)

## Business Rules

### Key Uniqueness
- Meter keys must be unique within an organization
- Keys enforce snake_case format: `api_calls`, `storage_gb`, `sms_sent`
- Keys are immutable after creation to maintain data integrity

### Key Immutability
- Once created, a meter's key cannot be changed
- This prevents breaking existing:
  - Usage events that reference the meter
  - Prices configured for the meter
  - External API integrations using the key

### Deletion Protection
- Meters cannot be deleted if they have:
  - Any usage events (would orphan historical data)
  - Any prices configured (would break billing)
- This ensures data integrity and prevents accidental data loss

### Aggregation Types
Choose based on your billing model:
- **SUM**: Most common. Total usage in period (API calls, data transfer, messages)
- **COUNT**: Number of distinct events (transactions, orders, deployments)
- **MAX**: Peak usage in period (concurrent connections, peak bandwidth)
- **LATEST**: Final state in period (storage amount, seat count at end of month)

## Architecture

### validators.js
Zod schemas for request validation:
- `createMeterSchema`: POST /meters body validation
- `updateMeterSchema`: PATCH /meters/:id body validation
- `listMetersQuerySchema`: GET /meters query params
- `meterIdSchema`: Meter ID parameter validation

### repository.js
Database access layer:
- `create(organizationId, data)`: Create meter
- `findById(meterId, organizationId)`: Get meter by ID
- `findByKey(key, organizationId)`: Get meter by key (uses unique constraint)
- `findMany(organizationId, options)`: List with filters
- `count(organizationId, options)`: Count with filters
- `update(meterId, organizationId, data)`: Update meter
- `deleteById(meterId, organizationId)`: Delete meter
- `hasUsage(meterId)`: Check for usage events
- `hasPrice(meterId)`: Check for prices
- `findByIdWithStats(meterId, organizationId)`: Get with counts

### service.js
Business logic layer:
- `createMeter(organizationId, data)`: Create with uniqueness check
- `listMeters(organizationId, filters)`: List with pagination
- `getMeterById(meterId, organizationId)`: Get single meter
- `getMeterByKey(key, organizationId)`: Get by key
- `getMeterWithStats(meterId, organizationId)`: Get with statistics
- `updateMeter(meterId, organizationId, data)`: Update with validation
- `deleteMeter(meterId, organizationId)`: Delete with safety checks

### router.js
Express routes with auth and validation:
- POST /meters - Create meter
- GET /meters - List meters
- GET /meters/:id - Get meter
- PATCH /meters/:id - Update meter
- DELETE /meters/:id - Delete meter

## Frontend Pages

### Meters.jsx
List view with:
- Search bar (by name or key)
- Paginated table showing key (monospace), name, unit, aggregation, created date
- "+ New Meter" button
- Click meter key to view details

### CreateMeter.jsx
Form to create new meter with:
- Key input (auto-formats to snake_case)
- Name input
- Unit input (e.g., requests, GB, minutes, messages)
- Aggregation dropdown (SUM/COUNT/MAX/LATEST with descriptions)
- Validation and error handling
- Redirect to detail page on success

### MeterDetail.jsx
Single meter view with:
- View mode: Display all fields and usage/price counts
- Edit mode: Inline editing (name, unit, aggregation only)
- Key displayed in read-only mode (immutable)
- Delete button with confirmation and error handling
- Breadcrumb navigation

## Usage Examples

### Example: Track API Calls
```json
{
  "key": "api_calls",
  "name": "API Calls",
  "unit": "requests",
  "aggregation": "SUM"
}
```

### Example: Track Storage
```json
{
  "key": "storage_gb",
  "name": "Storage",
  "unit": "GB",
  "aggregation": "LATEST"
}
```

### Example: Track Messages
```json
{
  "key": "sms_sent",
  "name": "SMS Messages",
  "unit": "messages",
  "aggregation": "SUM"
}
```

### Example: Track Peak Users
```json
{
  "key": "peak_concurrent_users",
  "name": "Peak Concurrent Users",
  "unit": "users",
  "aggregation": "MAX"
}
```

## Dependencies

- express: Web framework
- zod: Schema validation
- @prisma/client: Database ORM
- Custom middleware: auth.js, error-handler.js
- Custom utilities: api-response.js, prisma.js

## Related Modules

- **Organizations**: Meters belong to organizations
- **Usage Events** (next): Usage events reference meters
- **Prices**: Prices can be based on meter usage
- **Subscriptions**: Meter usage drives subscription billing

## Next Steps

This module is complete and ready for:
- **Module 07: Usage Events** - Ingest usage data referencing these meters
- **Module 10: Pricing** - Create prices based on meter usage
- Usage aggregation and billing calculations

## Testing Notes

The module follows project testing patterns:
- Validators tested with Zod schemas
- Repository functions tested against database
- Service layer tested with mocked repository
- Routes tested with supertest

Key scenarios to test:
- ✅ Create meter with unique key
- ✅ Reject duplicate key in same organization
- ✅ Allow same key in different organizations
- ✅ Search and pagination
- ✅ Update name/unit/aggregation
- ✅ Prevent key update
- ✅ Prevent deletion with usage
- ✅ Prevent deletion with prices
- ✅ Allow deletion when unused
