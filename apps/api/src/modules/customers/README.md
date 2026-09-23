# Customers Module

**Status**: ✅ Complete  
**Module ID**: 04  
**Organization Scoping**: Yes (via `x-organization-id` header)

## Overview

The Customers module provides full CRUD operations for managing customer records within an organization. Customers can have contact information, addresses, and are the core entity that subscriptions, invoices, and usage events are associated with.

## Features

- **Create Customer**: Add new customers with name, email, phone, address, and external ID
- **List Customers**: Paginated list with search by name/email
- **Get Customer**: Retrieve single customer with relationship counts
- **Update Customer**: Modify customer information
- **Delete Customer**: Remove customer (with cascade handling for related entities)
- **Organization Scoping**: All operations scoped to a specific organization

## Database Schema

```prisma
model Customer {
  id              String   @id @default(cuid())
  organizationId  String
  name            String
  email           String?
  phone           String?
  externalId      String?
  addressLine1    String?
  addressLine2    String?
  city            String?
  state           String?
  postalCode      String?
  country         String?
  metadata        Json?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  organization    Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  subscriptions   Subscription[]
  invoices        Invoice[]
  usageEvents     UsageEvent[]
  
  @@unique([organizationId, externalId])
  @@index([organizationId, email])
  @@index([organizationId, name])
}
```

## API Endpoints

All endpoints require:
- Authentication: `Authorization: Bearer <token>`
- Organization context: `x-organization-id: <org_id>` header

### POST /v1/customers
Create a new customer.

**Request Body**:
```json
{
  "name": "Acme Corporation",
  "email": "contact@acme.com",
  "phone": "+1 (555) 123-4567",
  "externalId": "acme-001",
  "addressLine1": "123 Main St",
  "addressLine2": "Suite 100",
  "city": "San Francisco",
  "state": "CA",
  "postalCode": "94105",
  "country": "United States",
  "metadata": {}
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "id": "cm...",
    "organizationId": "cm...",
    "name": "Acme Corporation",
    "email": "contact@acme.com",
    "phone": "+1 (555) 123-4567",
    "externalId": "acme-001",
    "addressLine1": "123 Main St",
    "addressLine2": "Suite 100",
    "city": "San Francisco",
    "state": "CA",
    "postalCode": "94105",
    "country": "United States",
    "metadata": {},
    "createdAt": "2026-09-21T10:30:00.000Z",
    "updatedAt": "2026-09-21T10:30:00.000Z"
  }
}
```

### GET /v1/customers
List customers with pagination and search.

**Query Parameters**:
- `search` (optional): Search by name or email
- `email` (optional): Filter by exact email
- `limit` (optional, default: 20, max: 100): Results per page
- `offset` (optional, default: 0): Pagination offset
- `sortBy` (optional, default: createdAt): Sort field (name, email, createdAt)
- `sortOrder` (optional, default: desc): Sort order (asc, desc)

**Response** (200):
```json
{
  "success": true,
  "data": {
    "customers": [
      {
        "id": "cm...",
        "organizationId": "cm...",
        "name": "Acme Corporation",
        "email": "contact@acme.com",
        "phone": "+1 (555) 123-4567",
        "externalId": "acme-001",
        "addressLine1": "123 Main St",
        "city": "San Francisco",
        "state": "CA",
        "postalCode": "94105",
        "country": "United States",
        "createdAt": "2026-09-21T10:30:00.000Z",
        "updatedAt": "2026-09-21T10:30:00.000Z"
      }
    ],
    "pagination": {
      "total": 42,
      "limit": 20,
      "offset": 0
    }
  }
}
```

### GET /v1/customers/:id
Get a single customer by ID.

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "cm...",
    "organizationId": "cm...",
    "name": "Acme Corporation",
    "email": "contact@acme.com",
    "phone": "+1 (555) 123-4567",
    "externalId": "acme-001",
    "addressLine1": "123 Main St",
    "addressLine2": "Suite 100",
    "city": "San Francisco",
    "state": "CA",
    "postalCode": "94105",
    "country": "United States",
    "metadata": {},
    "createdAt": "2026-09-21T10:30:00.000Z",
    "updatedAt": "2026-09-21T10:30:00.000Z",
    "_count": {
      "subscriptions": 2,
      "invoices": 15,
      "usageEvents": 1250
    }
  }
}
```

### PATCH /v1/customers/:id
Update a customer. All fields are optional, but at least one must be provided.

**Request Body**:
```json
{
  "name": "Acme Corp (Updated)",
  "email": "newemail@acme.com",
  "phone": "+1 (555) 999-8888"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "cm...",
    "name": "Acme Corp (Updated)",
    "email": "newemail@acme.com",
    "phone": "+1 (555) 999-8888",
    ...
  }
}
```

### DELETE /v1/customers/:id
Delete a customer.

**Response** (200):
```json
{
  "success": true,
  "data": {
    "message": "Customer deleted successfully"
  }
}
```

## Validation Rules

### Create Customer
- `name`: Required, 1-255 characters
- `email`: Optional, valid email format, max 255 characters
- `phone`: Optional, 7-20 characters, format: `+` digits spaces `-` `()` `.`
- `externalId`: Optional, 1-255 characters, must be unique within organization
- `addressLine1`, `addressLine2`: Optional, max 255 characters
- `city`, `state`, `country`: Optional, max 100 characters
- `postalCode`: Optional, 2-20 characters
- `metadata`: Optional JSON object

### Update Customer
- All fields optional
- At least one field must be provided
- Same validation rules as create for each field

### List Customers
- `search`: Optional, max 255 characters
- `email`: Optional, must be valid email
- `limit`: 1-100, default 20
- `offset`: >= 0, default 0
- `sortBy`: enum (name, email, createdAt)
- `sortOrder`: enum (asc, desc)

## Architecture

### validators.js
Zod schemas for request validation:
- `createCustomerSchema`: POST /customers body
- `updateCustomerSchema`: PATCH /customers/:id body
- `listCustomersQuerySchema`: GET /customers query params
- `customerIdSchema`: Customer ID parameter
- `orgIdSchema`: Organization ID parameter

### repository.js
Database access layer:
- `create(organizationId, data)`: Create customer
- `findById(customerId, organizationId)`: Get customer by ID
- `findMany(organizationId, options)`: List customers with filters
- `count(organizationId, options)`: Count customers
- `update(customerId, organizationId, data)`: Update customer
- `delete(customerId, organizationId)`: Delete customer

### service.js
Business logic layer:
- `createCustomer(organizationId, data)`: Create with validation
- `getCustomers(organizationId, filters)`: List with pagination
- `getCustomerById(customerId, organizationId)`: Get single with counts
- `updateCustomer(customerId, organizationId, data)`: Update with validation
- `deleteCustomer(customerId, organizationId)`: Delete with checks

### router.js
Express routes with auth and validation middleware:
- POST /customers - Create customer
- GET /customers - List customers
- GET /customers/:id - Get customer
- PATCH /customers/:id - Update customer
- DELETE /customers/:id - Delete customer

## Frontend Pages

### Customers.jsx
List view with:
- Search bar (by name or email)
- Paginated table
- Link to create new customer
- Click customer name to view details

### CreateCustomer.jsx
Form to create new customer with:
- Required: Name
- Optional: Email, phone, external ID, full address
- Validation and error handling
- Redirect to detail page on success

### CustomerDetail.jsx
Single customer view with:
- View mode: Display all fields and relationship counts
- Edit mode: Inline editing of all fields
- Delete button with confirmation
- Breadcrumb navigation

## Testing

The module follows the project's testing patterns:
- Validators are tested with Zod schemas
- Repository functions tested against real database
- Service layer tested with mocked repository
- Routes tested with supertest

## Dependencies

- express: Web framework
- zod: Schema validation
- @prisma/client: Database ORM
- Custom middleware: auth.js, rbac.js, error-handler.js
- Custom utilities: api-response.js, prisma.js

## Related Modules

- **Organizations**: Customers belong to organizations
- **Subscriptions**: Customers can have subscriptions
- **Invoices**: Invoices are generated for customers
- **Usage Events**: Usage is tracked per customer
- **API Keys**: API keys can be scoped to customers

## External ID

The `externalId` field allows you to map Llah customers to IDs in your own system:
- Optional but recommended for integration
- Must be unique within the organization
- Indexed for fast lookups
- Can be used to sync data between systems

## Next Steps

This module is complete and ready for:
- Subscriptions module (customers subscribe to plans)
- Invoices module (customers receive invoices)
- Usage tracking (usage events tied to customers)
