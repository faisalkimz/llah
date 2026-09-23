# Llah Development Setup Guide

## Prerequisites

- Node.js 22+ installed
- npm installed
- Neon PostgreSQL database (free tier available at https://neon.tech)

## Initial Setup

### 1. Install Dependencies

From the repository root:

```bash
npm install
```

This will install dependencies for all workspaces (api, web, mobile).

### 2. Configure Environment

Create your API environment file:

```bash
cp apps/api/.env.example apps/api/.env
```

Edit `apps/api/.env` and fill in your values:

```env
NODE_ENV=development
PORT=4000
WEB_URL=http://localhost:5173

# Get from Neon console - use pooled connection string
DATABASE_URL=postgresql://USER:PASSWORD@YOUR_NEON_HOST/neondb?sslmode=require

# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
JWT_ACCESS_SECRET=your-32-plus-character-secret-here
JWT_REFRESH_SECRET=another-32-plus-character-secret-here

ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL_DAYS=30
```

**Generate Secure Secrets:**

```bash
# Generate JWT_ACCESS_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Generate JWT_REFRESH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 3. Set up Database

Generate Prisma Client:

```bash
npm run prisma:generate
```

Run migrations to create database tables:

```bash
npm run prisma:migrate
```

You'll be prompted to name the migration. Use: `init`

### 4. Start Development Servers

**Terminal 1 - API Server:**
```bash
npm run dev:api
```

The API will run on `http://localhost:4000`

**Terminal 2 - Web Application:**
```bash
npm run dev:web
```

The web app will run on `http://localhost:5173`

**Optional - Mobile App:**
```bash
npm run dev:mobile
```

## Testing the Authentication Module

### 1. Register a New Account

1. Navigate to `http://localhost:5173/register`
2. Fill in:
   - Name: Your Name
   - Email: test@example.com
   - Password: securepassword123 (min 10 characters)
3. Click "Create account"
4. You'll be automatically logged in and redirected to the dashboard

### 2. Check Tokens

Open browser DevTools → Application/Storage → Local Storage:
- `llah_access_token` - Short-lived JWT (15 min)
- `llah_refresh_token` - Long-lived refresh token (30 days)

### 3. Test Token Refresh

Option A - Wait for expiry:
1. Wait 15 minutes for access token to expire
2. Navigate to any protected route
3. Token should auto-refresh in the background

Option B - Manual test:
1. Delete `llah_access_token` from localStorage
2. Refresh the page or navigate to a protected route
3. Should automatically refresh and continue working

### 4. Test Session Management

1. Login from multiple browsers/devices
2. Navigate to `http://localhost:5173/sessions`
3. See all active sessions
4. Click "Revoke" on a session to log out that device
5. Click "Revoke all sessions" to log out everywhere

### 5. Test Password Reset

1. Navigate to `http://localhost:5173/forgot-password`
2. Enter your email
3. Click "Send reset link"
4. In development mode, a reset token will be displayed
5. Click the link or navigate to `/reset-password?token=...`
6. Enter new password
7. Password is reset, all sessions are invalidated
8. Login with new password

### 6. Test Email Verification

1. Navigate to `http://localhost:5173/verify-email`
2. Click "Send verification email"
3. In development mode, a verification token will be displayed
4. Enter your email and the token
5. Click "Verify Email"
6. Email is marked as verified

## Running Tests

```bash
# Run all tests
npm test

# Run API tests only
npm run test -w @llah/api

# Run web tests only
npm run test -w @llah/web

# Run tests in watch mode (development)
npm run test -- --watch
```

## Common Issues

### Database Connection Failed

- Verify your `DATABASE_URL` is correct
- Make sure you're using the **pooled** connection string from Neon
- Check that your Neon database is active (free tier databases may sleep)

### Prisma Client Not Generated

```bash
npm run prisma:generate
```

### Port Already in Use

API (port 4000):
```bash
# Windows
netstat -ano | findstr :4000
taskkill /PID <PID> /F
```

Web (port 5173):
```bash
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

### Tokens Not Working

1. Check that JWT secrets are set in `.env`
2. Verify secrets are at least 32 characters
3. Clear localStorage and login again
4. Check browser console for errors

## Development Tips

### Prisma Studio

View and edit database data:

```bash
npm run prisma:studio
```

Opens at `http://localhost:5555`

### API Health Check

```bash
curl http://localhost:4000/health
```

Should return: `{"status":"ok","service":"llah-api"}`

### View Logs

The API uses Pino for structured logging. Logs appear in the terminal running the API server.

### Reset Database

**⚠️ WARNING: This deletes all data**

```bash
# Delete all data
npx prisma migrate reset --schema prisma/schema.prisma

# Or manually
npm run prisma:migrate -- --create-only
# Then edit the migration to add DROP statements
npm run prisma:migrate
```

## Next Steps

After verifying authentication works:

1. Module 03 - Organizations, Members & RBAC will be implemented next
2. Users will be able to create workspaces
3. Invite team members with role-based permissions
4. Organization-scoped data isolation

## Production Checklist

Before deploying to production:

- [ ] Use strong, randomly generated JWT secrets (64+ characters)
- [ ] Set `NODE_ENV=production`
- [ ] Use production Neon database (not development branch)
- [ ] Enable connection pooling
- [ ] Set up email service for verification/reset emails
- [ ] Move token storage from memory to Redis
- [ ] Configure rate limiting per endpoint
- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Configure CORS for production domain
- [ ] Enable HTTPS only
- [ ] Set secure cookie flags
- [ ] Configure backup strategy
- [ ] Add session device/IP tracking
- [ ] Set up audit logging
- [ ] Configure CDN for web assets
- [ ] Enable database encryption at rest
