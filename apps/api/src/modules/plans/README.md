# Plans Module

Manages subscription plans with pricing items.

## API Endpoints

### POST /api/plans
Create a new plan with pricing items.

**Headers:**
- `x-organization-id` (required)

**Body:**
```json
{
  "name": "Pro Plan",
  "description": "Professional tier",
  "active": true,
  "items": [
    {
      "priceId": "price_123",
      "sortOrder": 0
    }
  ]
}
```

### GET /api/plans
List all plans for organization.

**Query:**
- `active` (boolean, optional)
- `limit` (number, default: 20, max: 100)
- `offset` (number, default: 0)

### GET /api/plans/:planId
Get plan by ID with all items.

### PUT /api/plans/:planId
Update plan details.

**Body:**
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "active": false
}
```

### DELETE /api/plans/:planId
Delete a plan.

### POST /api/plans/:planId/items
Add a pricing item to a plan.

**Body:**
```json
{
  "priceId": "price_456",
  "sortOrder": 1
}
```

### DELETE /api/plans/items/:itemId
Remove a pricing item from a plan.

## Features
- Bundle multiple prices into a plan
- Sort order for plan items
- Active/inactive status
- Cascading deletes for plan items
