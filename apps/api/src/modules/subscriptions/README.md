# Subscriptions Module

Manages customer subscriptions to plans.

## API Endpoints

### POST /api/subscriptions
Create a new subscription.

**Headers:**
- `x-organization-id` (required)

**Body:**
```json
{
  "customerId": "cust_123",
  "planId": "plan_456",
  "currentPeriodStart": "2026-01-01T00:00:00Z",
  "currentPeriodEnd": "2026-02-01T00:00:00Z"
}
```

### GET /api/subscriptions
List subscriptions with filters.

**Query:**
- `customerId` (string, optional)
- `status` (ACTIVE|PAST_DUE|CANCELED|PAUSED, optional)
- `limit` (number, default: 20, max: 100)
- `offset` (number, default: 0)

### GET /api/subscriptions/:subscriptionId
Get subscription details with plan and customer.

### PUT /api/subscriptions/:subscriptionId
Update subscription.

**Body:**
```json
{
  "planId": "plan_789",
  "status": "PAUSED",
  "cancelAtPeriodEnd": true
}
```

### POST /api/subscriptions/:subscriptionId/cancel
Cancel a subscription.

**Body:**
```json
{
  "immediate": false
}
```

If `immediate` is false, subscription continues until period end (cancelAtPeriodEnd).
If true, status changes to CANCELED immediately.

## Features
- Subscription lifecycle management
- Plan changes
- Immediate or end-of-period cancellation
- Status tracking (ACTIVE, PAST_DUE, CANCELED, PAUSED)
