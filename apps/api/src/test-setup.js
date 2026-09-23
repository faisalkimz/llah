import 'dotenv/config';

// Test environment validation
if (!process.env.DATABASE_URL) {
  console.warn('WARNING: DATABASE_URL not set. Tests requiring database will fail.');
}

if (!process.env.JWT_ACCESS_SECRET) {
  process.env.JWT_ACCESS_SECRET = 'test-access-secret-at-least-32-chars-long-for-testing';
}

if (!process.env.JWT_REFRESH_SECRET) {
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-at-least-32-chars-long-for-testing';
}

// Set test defaults
process.env.NODE_ENV = 'test';
process.env.ACCESS_TOKEN_TTL = '15m';
process.env.REFRESH_TOKEN_TTL_DAYS = '30';
