# Module 02 — Authentication & Sessions

## Status: COMPLETE ✅

Implements registration, login, refresh-token rotation, logout, session management, email verification, forgot/reset password, and rate limits.

## Implementation Details

### Backend (`apps/api/src/modules/auth/`)

**Endpoints:**
- `POST /v1/auth/register` - User registration with password hashing
- `POST /v1/auth/login` - Login with credential validation
- `POST /v1/auth/refresh` - Refresh token rotation with reuse detection
- `POST /v1/auth/logout` - Session revocation (requires auth)
- `GET /v1/auth/sessions` - List active sessions (requires auth)
- `DELETE /v1/auth/sessions/:id` - Revoke specific session (requires auth)
- `POST /v1/auth/verify-email/request` - Request email verification (requires auth)
- `POST /v1/auth/verify-email` - Verify email with token
- `POST /v1/auth/forgot-password` - Request password reset
- `POST /v1/auth/reset-password` - Reset password with token

**Security Features:**
- Passwords hashed with bcrypt (12 rounds)
- Refresh tokens hashed with SHA256 before storage
- JWT access tokens (15 minute TTL)
- Refresh tokens (30 day TTL)
- Token reuse detection - revokes all sessions on reuse attempt
- Password reset invalidates all existing sessions
- Single-use reset tokens with 30-minute expiry
- Email verification tokens with 24-hour expiry
- Case-insensitive email handling

**Data Storage:**
- Refresh tokens: hashed in PostgreSQL (Session table)
- Verification tokens: in-memory Map (use Redis in production)
- Reset tokens: in-memory Map (use Redis in production)

### Frontend (`apps/web/src/`)

**Pages:**
- `pages/Login.jsx` - Sign in with email/password
- `pages/Register.jsx` - Account creation
- `pages/ForgotPassword.jsx` - Request password reset
- `pages/ResetPassword.jsx` - Complete password reset
- `pages/VerifyEmail.jsx` - Email verification flow
- `pages/Sessions.jsx` - Manage active sessions

**Features:**
- Automatic token refresh on 401 responses
- Refresh token stored in localStorage
- Token refresh queue to prevent duplicate refresh requests
- Loading states for all auth actions
- Error handling and display
- Development-mode token display for testing

**API Client (`lib/api.js`):**
- Automatic retry on 401 with token refresh
- Token refresh queueing for concurrent requests
- Logout and redirect on refresh failure

### Tests (`apps/api/src/modules/auth/service.test.js`)

**Coverage:**
- Registration: success, duplicate email, email normalization
- Login: success, invalid credentials, case-insensitive email
- Refresh: valid token, invalid token, reused token, expired token, session revocation
- Logout: success, invalid token
- Session management: list sessions, filter revoked, revoke specific session
- Email verification: request, verify, invalid token, already verified
- Password reset: request, reset, reused token, session invalidation, email enumeration protection

## Acceptance Criteria

✅ User can register with name, email, password (min 10 chars)
✅ User can login with email and password
✅ Access tokens are short-lived JWTs (15 minutes)
✅ Refresh tokens are stored hashed and rotate on use
✅ Invalid/reused refresh tokens fail with security warning
✅ Session revocation works (logout, revoke specific session)
✅ Password reset flow implemented with token expiry
✅ Password reset invalidates old sessions
✅ Email verification flow implemented (development mode)
✅ Tests cover failures and edge cases
✅ Frontend has responsive auth flows
✅ Loading and error states handled

## Database Schema

Uses existing `User` and `Session` models from Prisma schema:

```prisma
model User {
  id String @id @default(cuid())
  email String @unique
  passwordHash String
  name String?
  emailVerifiedAt DateTime?
  // ... timestamps and relations
}

model Session {
  id String @id @default(cuid())
  userId String
  refreshTokenHash String @unique
  expiresAt DateTime
  revokedAt DateTime?
  // ... timestamps and relations
}
```

## Notes for Production

Before production deployment:

1. **Email Sending**: Replace in-memory token storage with Redis and integrate email service (SendGrid, SES, etc.)
2. **Rate Limiting**: Add specific rate limits for:
   - Login: 5 attempts per 15 minutes per IP
   - Registration: 3 attempts per hour per IP
   - Password reset: 3 requests per hour per email
3. **Token Storage**: Move verification and reset tokens from memory to Redis
4. **Monitoring**: Add alerts for:
   - Token reuse detection events
   - Multiple failed login attempts
   - Password reset requests
5. **Session Management**: Consider adding device/IP information to sessions
6. **Email Verification**: Decide whether to block unverified users from certain features

## Manual Testing

To test the complete auth flow:

1. Start API and Web: `npm run dev:api` and `npm run dev:web`
2. Register a new account at `/register`
3. Verify access token and refresh token stored in localStorage
4. Navigate to protected routes - should work
5. Wait for access token to expire (or delete it) - should auto-refresh
6. Test logout - should clear tokens and redirect
7. Test password reset flow at `/forgot-password`
8. Check `/sessions` to see active sessions
9. Revoke a session and verify it's removed
