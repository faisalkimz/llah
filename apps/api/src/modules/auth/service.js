import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { randomBytes, createHash } from 'node:crypto';
import { prisma } from '../../lib/prisma.js';
import { env } from '../../config/env.js';
import * as organizationService from '../organizations/service.js';

const accessSecret = new TextEncoder().encode(env.JWT_ACCESS_SECRET);
const refreshSecret = new TextEncoder().encode(env.JWT_REFRESH_SECRET);
const hash = v => createHash('sha256').update(v).digest('hex');

// In-memory stores for tokens (in production, use Redis)
const verificationTokens = new Map(); // email -> {token, userId, expiresAt}
const resetTokens = new Map(); // token -> {userId, expiresAt, used}

async function accessToken(user) {
  return new SignJWT({ email: user.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(env.ACCESS_TOKEN_TTL)
    .sign(accessSecret);
}

async function sessionTokens(user) {
  const refresh = randomBytes(48).toString('base64url');
  const expiresAt = new Date(Date.now() + env.REFRESH_TOKEN_TTL_DAYS * 86400000);
  
  await prisma.session.create({
    data: {
      userId: user.id,
      refreshTokenHash: hash(refresh),
      expiresAt
    }
  });
  
  return {
    accessToken: await accessToken(user),
    refreshToken: refresh,
    expiresAt
  };
}

export async function register(input) {
  const exists = await prisma.user.findUnique({ where: { email: input.email } });
  if (exists) {
    throw Object.assign(new Error('Email already in use.'), { status: 409, code: 'EMAIL_EXISTS' });
  }
  
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash: await bcrypt.hash(input.password, 12)
    }
  });
  
  // Auto-create personal organization for new user
  // Use user's name or email prefix as organization name
  const orgName = input.name || input.email.split('@')[0];
  try {
    await organizationService.createOrganization(user.id, {
      name: `${orgName}'s Organization`,
    });
  } catch (error) {
    // Log error but don't fail registration if org creation fails
    console.error('Failed to create default organization:', error);
  }
  
  return {
    user: { id: user.id, name: user.name, email: user.email, emailVerifiedAt: user.emailVerifiedAt },
    tokens: await sessionTokens(user)
  };
}

export async function login(input) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
    throw Object.assign(new Error('Invalid email or password.'), { status: 401, code: 'INVALID_CREDENTIALS' });
  }
  
  return {
    user: { id: user.id, name: user.name, email: user.email, emailVerifiedAt: user.emailVerifiedAt },
    tokens: await sessionTokens(user)
  };
}

export async function refresh(input) {
  const tokenHash = hash(input.refreshToken);
  
  const session = await prisma.session.findUnique({
    where: { refreshTokenHash: tokenHash },
    include: { user: true }
  });
  
  if (!session) {
    throw Object.assign(new Error('Invalid refresh token.'), { status: 401, code: 'INVALID_REFRESH_TOKEN' });
  }
  
  // Check if session is revoked
  if (session.revokedAt) {
    // Potential token reuse attack - revoke all user sessions
    await prisma.session.updateMany({
      where: { userId: session.userId, revokedAt: null },
      data: { revokedAt: new Date() }
    });
    throw Object.assign(new Error('Refresh token has been revoked. All sessions invalidated for security.'), { 
      status: 401, 
      code: 'TOKEN_REUSE_DETECTED' 
    });
  }
  
  // Check if session is expired
  if (session.expiresAt < new Date()) {
    throw Object.assign(new Error('Refresh token has expired.'), { status: 401, code: 'REFRESH_TOKEN_EXPIRED' });
  }
  
  // Revoke old refresh token
  await prisma.session.update({
    where: { id: session.id },
    data: { revokedAt: new Date() }
  });
  
  // Issue new tokens
  return {
    user: { 
      id: session.user.id, 
      name: session.user.name, 
      email: session.user.email,
      emailVerifiedAt: session.user.emailVerifiedAt 
    },
    tokens: await sessionTokens(session.user)
  };
}

export async function logout(userId, refreshToken) {
  const tokenHash = hash(refreshToken);
  
  const session = await prisma.session.findFirst({
    where: { userId, refreshTokenHash: tokenHash }
  });
  
  if (!session) {
    throw Object.assign(new Error('Session not found.'), { status: 404, code: 'SESSION_NOT_FOUND' });
  }
  
  await prisma.session.update({
    where: { id: session.id },
    data: { revokedAt: new Date() }
  });
  
  return { success: true };
}

export async function getSessions(userId) {
  const sessions = await prisma.session.findMany({
    where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
    select: {
      id: true,
      createdAt: true,
      expiresAt: true
    },
    orderBy: { createdAt: 'desc' }
  });
  
  return sessions;
}

export async function revokeSession(userId, sessionId) {
  const session = await prisma.session.findFirst({
    where: { id: sessionId, userId }
  });
  
  if (!session) {
    throw Object.assign(new Error('Session not found.'), { status: 404, code: 'SESSION_NOT_FOUND' });
  }
  
  await prisma.session.update({
    where: { id: sessionId },
    data: { revokedAt: new Date() }
  });
  
  return { success: true };
}

export async function requestEmailVerification(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  
  if (!user) {
    throw Object.assign(new Error('User not found.'), { status: 404, code: 'USER_NOT_FOUND' });
  }
  
  if (user.emailVerifiedAt) {
    throw Object.assign(new Error('Email already verified.'), { status: 400, code: 'EMAIL_ALREADY_VERIFIED' });
  }
  
  // Generate verification token
  const token = randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  
  verificationTokens.set(user.email, { token, userId: user.id, expiresAt });
  
  // In production: send email with verification link
  // For development: return token in response
  return { 
    message: 'Verification email sent.',
    // Development only - remove in production
    token: process.env.NODE_ENV === 'development' ? token : undefined
  };
}

export async function verifyEmail(input) {
  const stored = verificationTokens.get(input.email);
  
  if (!stored || stored.token !== input.token) {
    throw Object.assign(new Error('Invalid verification token.'), { status: 400, code: 'INVALID_VERIFICATION_TOKEN' });
  }
  
  if (stored.expiresAt < new Date()) {
    verificationTokens.delete(input.email);
    throw Object.assign(new Error('Verification token has expired.'), { status: 400, code: 'VERIFICATION_TOKEN_EXPIRED' });
  }
  
  await prisma.user.update({
    where: { id: stored.userId },
    data: { emailVerifiedAt: new Date() }
  });
  
  verificationTokens.delete(input.email);
  
  return { success: true, message: 'Email verified successfully.' };
}

export async function requestPasswordReset(input) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  
  // Don't reveal if email exists
  if (!user) {
    return { message: 'If that email exists, a password reset link has been sent.' };
  }
  
  // Generate reset token
  const token = randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
  
  resetTokens.set(token, { userId: user.id, expiresAt, used: false });
  
  // In production: send email with reset link
  // For development: return token in response
  return { 
    message: 'If that email exists, a password reset link has been sent.',
    // Development only - remove in production
    token: process.env.NODE_ENV === 'development' ? token : undefined
  };
}

export async function resetPassword(input) {
  const stored = resetTokens.get(input.token);
  
  if (!stored) {
    throw Object.assign(new Error('Invalid reset token.'), { status: 400, code: 'INVALID_RESET_TOKEN' });
  }
  
  if (stored.used) {
    resetTokens.delete(input.token);
    throw Object.assign(new Error('Reset token has already been used.'), { status: 400, code: 'RESET_TOKEN_USED' });
  }
  
  if (stored.expiresAt < new Date()) {
    resetTokens.delete(input.token);
    throw Object.assign(new Error('Reset token has expired.'), { status: 400, code: 'RESET_TOKEN_EXPIRED' });
  }
  
  // Mark token as used
  stored.used = true;
  
  // Update password
  await prisma.user.update({
    where: { id: stored.userId },
    data: { passwordHash: await bcrypt.hash(input.newPassword, 12) }
  });
  
  // Revoke all sessions for security
  await prisma.session.updateMany({
    where: { userId: stored.userId, revokedAt: null },
    data: { revokedAt: new Date() }
  });
  
  resetTokens.delete(input.token);
  
  return { success: true, message: 'Password reset successfully. All sessions have been logged out.' };
}
