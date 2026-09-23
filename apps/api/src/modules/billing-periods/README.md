# Billing Periods Module

Lists active billing periods derived from subscription data.

## API Endpoints

### GET /api/billing-periods
List billing periods for an organization.

**Headers:**
- `x-organization-id` (required)

**Query:**
- `customerId` (string, optional)
- `subscriptionId` (string, optional)
- `limit` (number, default: 20, max: 100)
- `offset` (number, default: 0)

**Response:**
Returns subscription periods with customer and plan details.

## Features
- View current and historical billing periods
- Filter by customer or subscription
- Derived from subscription current period fields
