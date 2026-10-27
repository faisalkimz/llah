# Llah Development Setup Guide

## Prerequisites

- Node.js 22+ installed
- npm installed
- PostgreSQL installed locally (or use Docker)

## Initial Setup

### 1. Install Dependencies

From the repository root:

```bash
npm install
```

This will install dependencies for all workspaces (api, web, mobile).

### 2. Set Up Local PostgreSQL

**Option A — Direct install:**

Install PostgreSQL from https://www.postgresql.org/download/ and create a database:

```bash
createdb llah
```

**Option B — Docker:**

```bash
docker run -d --name llah-postgres -p 5432:5432 -e POSTGRES_PASSWORD=yourpassword -e POSTGRES_DB=llah postgres:16
```

### 3. Configure Environment

Create your API environment file:

```bash
cp apps/api/.env.example apps/api/.env
```

Edit `apps/api/.env` and fill in your values:

```env
NODE_ENV=development
PORT=4000
WEB_URL=http://localhost:5173

# Local PostgreSQL connection
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/llah

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

### 4. Set up Database

Generate Prisma Client:

```bash
npm run prisma:generate
```

Push schema to your local database:

```bash
npx prisma db push --schema prisma/schema.prisma
```

Or run migrations:

```bash
npm run prisma:migrate
```

### 5. Start Development Servers

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

## Testing the Authentication Module

### 1. Register a New Account

1. Navigate to `http://localhost:5173/register`
2. Fill in:
   - Name: Your Name
   - Email: test@example.com
   - Password: securepassword123 (min 10 characters)
3. Click "Create account"
4. Complete the onboarding wizard to set up your workspace

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
- Make sure PostgreSQL is running on the expected port
- Check that the database exists (`createdb llah` or via Docker)

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

### Reset Database

**⚠️ WARNING: This deletes all data**

```bash
npx prisma migrate reset --schema prisma/schema.prisma
```

## Production Notes

When deploying to production (Supabase):
- Update `DATABASE_URL` to your Supabase connection string
- Use strong, randomly generated JWT secrets (64+ characters)
- Set `NODE_ENV=production`
- Enable connection pooling
- Set up email service for verification/reset emails
- Move token storage from memory to Redis
- Configure rate limiting per endpoint
- Set up error monitoring (Sentry, etc.)
- Configure CORS for production domain
- Enable HTTPS only
