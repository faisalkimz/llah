# Organizations Module

Multi-tenant organization structure with role-based access control (RBAC).

## Features

### Organizations
- Create/read/update/delete organizations
- URL-safe slug generation (auto-generated from name)
- Unique slug enforcement with automatic numbering
- Member count tracking
- User can belong to multiple organizations

### Memberships
- Six role levels: OWNER, ADMIN, BILLING, DEVELOPER, ANALYST, VIEWER
- Role-based permissions with hierarchy
- Invite members to organizations
- Update member roles
- Remove members from organizations
- Protection against removing last owner

### Auto-Provisioning
- New users automatically get a personal organization on registration
- User is set as OWNER of their personal organization

## API Endpoints

### Organizations

**POST /v1/organizations**
- Create new organization
- Auto-creates membership with OWNER role
- Request: `{ name: string, slug?: string }`
- Response: `{ organization, membership }`

**GET /v1/organizations**
- List all organizations for current user
- Returns organizations with role and member count

**GET /v1/organizations/:id**
- Get organization details
- Requires: User must be a member
- Returns organization with member count and user's role

**PATCH /v1/organizations/:id**
- Update organization name or slug
- Requires: OWNER or ADMIN role
- Request: `{ name?: string, slug?: string }`

**DELETE /v1/organizations/:id**
- Delete organization
- Requires: OWNER role only
- Cascades to delete all memberships

**GET /v1/organizations/:id/members**
- List all members of organization
- Requires: User must be a member
- Returns array of memberships with user info

**POST /v1/organizations/:id/members**
- Invite member to organization
- Requires: OWNER or ADMIN role
- Request: `{ email: string, role: MembershipRole }`
- Note: Currently requires user to already exist (email-based invitations to be added)
- Only OWNER can invite other OWNERs

### Memberships

**PATCH /v1/organizations/memberships/:id**
- Update member role
- Requires: OWNER or ADMIN role
- Request: `{ role: MembershipRole }`
- Restrictions:
  - Cannot change your own role
  - Only OWNER can change OWNER roles or assign OWNER role
  - Cannot remove last OWNER

**DELETE /v1/organizations/memberships/:id**
- Remove member from organization
- Requires: OWNER or ADMIN role, or removing yourself
- Restrictions:
  - Only OWNER can remove other OWNERs
  - Cannot remove last OWNER

## Roles & Permissions

### Role Hierarchy
1. **OWNER** (Level 5)
   - Full control over organization
   - Can delete organization
   - Can invite/remove any member including other OWNERs
   - Can change any role

2. **ADMIN** (Level 4)
   - Can manage organization settings
   - Can invite members (except OWNER)
   - Can remove members (except OWNER)
   - Can change roles (except OWNER)

3. **BILLING** (Level 3)
   - Intended for financial operations (future use)

4. **DEVELOPER** (Level 2)
   - Intended for technical operations (future use)

5. **ANALYST** (Level 1)
   - Intended for read-only analytics (future use)

6. **VIEWER** (Level 0)
   - Read-only access
   - Default role for new invites

### Permission Rules
- Organization delete: OWNER only
- Organization update: OWNER or ADMIN
- Member invite: OWNER or ADMIN
- Member remove: OWNER or ADMIN (OWNER required to remove OWNER)
- Role update: OWNER or ADMIN (OWNER required for OWNER role changes)
- Cannot remove last OWNER (must assign another OWNER first)
- Members can leave on their own (except last OWNER)

## RBAC Middleware

Located in `apps/api/src/middleware/rbac.js`

### `requireOrgAccess()`
Checks if user is a member of the organization
- Organization ID from `req.params.id` or `req.params.organizationId`
- Attaches `req.membership` and `req.organizationId`

### `requireRole(roles)`
Requires user to have specific role(s)
- Example: `requireRole(['OWNER', 'ADMIN'])`
- Checks exact role match

### `requireMinRole(minRole)`
Requires minimum role level using hierarchy
- Example: `requireMinRole('ADMIN')` allows ADMIN and OWNER
- Uses ROLE_HIERARCHY for level comparison

### `hasPermission(userRole, requiredRole)`
Helper function to check if role has sufficient permissions

## Data Models

### Organization
```prisma
model Organization {
  id        String   @id @default(cuid())
  name      String
  slug      String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Membership
```prisma
model Membership {
  id             String           @id @default(cuid())
  userId         String
  organizationId String
  role           MembershipRole   @default(VIEWER)
  createdAt      DateTime         @default(now())
  updatedAt      DateTime         @updatedAt
  
  @@unique([userId, organizationId])
}

enum MembershipRole {
  OWNER
  ADMIN
  BILLING
  DEVELOPER
  ANALYST
  VIEWER
}
```

## Architecture

### Layers
1. **Validators** (`validators.js`) - Zod schemas for request validation
2. **Repositories** (`repository.js`, `membership-repository.js`) - Data access layer
3. **Service** (`service.js`) - Business logic and permission checks
4. **Router** (`router.js`) - Express routes and HTTP handling
5. **Middleware** (`middleware/rbac.js`) - RBAC enforcement

### Key Functions

#### Service Layer
- `createOrganization(userId, data)` - Create org with owner membership
- `getOrganization(userId, orgId)` - Get org with access check
- `getUserOrganizations(userId)` - List user's organizations
- `updateOrganization(userId, orgId, data)` - Update with permission check
- `deleteOrganization(userId, orgId)` - Delete (owner only)
- `getOrganizationMembers(userId, orgId)` - List members
- `inviteMember(inviterId, orgId, inviteeUserId, role)` - Add member
- `updateMemberRole(requesterId, membershipId, newRole)` - Change role
- `removeMember(requesterId, membershipId)` - Remove member
- `hasAccess(userId, orgId)` - Check membership
- `hasRole(userId, orgId, roles)` - Check specific roles

#### Slug Generation
- `generateSlug(name)` - Convert name to URL-safe slug
- `ensureUniqueSlug(baseSlug, excludeOrgId)` - Make slug unique by appending numbers

## Frontend Pages

### `/organizations`
List all organizations user belongs to
- Shows org name, slug, role, member count
- Link to create new organization

### `/organizations/new`
Create new organization form
- Organization name input
- Auto-generated slug with manual override
- Validates slug format (lowercase, letters, numbers, hyphens)

### `/organizations/:id`
Organization settings and team management
- **General Tab**: Update org name and slug (OWNER/ADMIN)
- **Team Members Tab**: 
  - Invite members (OWNER/ADMIN)
  - View all members
  - Update roles (OWNER/ADMIN)
  - Remove members (OWNER/ADMIN)

## Future Enhancements

1. **Email Invitations**
   - Send invitation emails to non-users
   - Accept/decline invitation flow
   - Invitation expiration

2. **Role Permissions**
   - Define specific permissions per role
   - Custom roles
   - Granular permission checks

3. **Organization Types**
   - Personal vs Team organizations
   - Organization limits per plan

4. **Audit Trail**
   - Track membership changes
   - Log role updates
   - Organization setting changes

5. **Transfer Ownership**
   - Dedicated endpoint for ownership transfer
   - Two-step confirmation process

## Testing

Backend tests located in `apps/api/tests/organizations.test.js` (26 tests passing)

Test coverage:
- Organization CRUD operations
- Membership management
- Role-based access control
- Permission validation
- Edge cases (last owner, duplicate invites)

## Notes

- Organization slugs are globally unique across the system
- Users automatically get a personal org on registration
- Slug format: lowercase letters, numbers, hyphens only
- Must start with letter, end with letter or number
- Length: 2-63 characters
- If slug exists, appends `-1`, `-2`, etc.
