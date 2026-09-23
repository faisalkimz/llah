import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { prisma } from '../../lib/prisma.js';
import * as service from './service.js';

describe('Auth Service', () => {
  // Clean up test data
  afterEach(async () => {
    await prisma.session.deleteMany({});
    await prisma.user.deleteMany({});
  });

  describe('register', () => {
    it('should create a new user with hashed password', async () => {
      const input = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'securepassword123'
      };

      const result = await service.register(input);

      expect(result.user).toHaveProperty('id');
      expect(result.user.name).toBe('Test User');
      expect(result.user.email).toBe('test@example.com');
      expect(result.user.emailVerifiedAt).toBeNull();
      expect(result.tokens).toHaveProperty('accessToken');
      expect(result.tokens).toHaveProperty('refreshToken');
      expect(result.tokens).toHaveProperty('expiresAt');

      // Verify user in database
      const user = await prisma.user.findUnique({ where: { email: 'test@example.com' } });
      expect(user).toBeTruthy();
      expect(user.passwordHash).not.toBe('securepassword123');
    });

    it('should reject duplicate email', async () => {
      const input = {
        name: 'Test User',
        email: 'duplicate@example.com',
        password: 'securepassword123'
      };

      await service.register(input);

      await expect(service.register(input)).rejects.toThrow('Email already in use.');
    });

    it('should normalize email to lowercase', async () => {
      const input = {
        name: 'Test User',
        email: 'TEST@EXAMPLE.COM',
        password: 'securepassword123'
      };

      const result = await service.register(input);

      expect(result.user.email).toBe('test@example.com');
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      await service.register({
        name: 'Login Test',
        email: 'login@example.com',
        password: 'securepassword123'
      });
    });

    it('should login with correct credentials', async () => {
      const result = await service.login({
        email: 'login@example.com',
        password: 'securepassword123'
      });

      expect(result.user.email).toBe('login@example.com');
      expect(result.tokens).toHaveProperty('accessToken');
      expect(result.tokens).toHaveProperty('refreshToken');
    });

    it('should reject invalid password', async () => {
      await expect(service.login({
        email: 'login@example.com',
        password: 'wrongpassword'
      })).rejects.toThrow('Invalid email or password.');
    });

    it('should reject non-existent email', async () => {
      await expect(service.login({
        email: 'nonexistent@example.com',
        password: 'anypassword'
      })).rejects.toThrow('Invalid email or password.');
    });

    it('should be case-insensitive for email', async () => {
      const result = await service.login({
        email: 'LOGIN@EXAMPLE.COM',
        password: 'securepassword123'
      });

      expect(result.user.email).toBe('login@example.com');
    });
  });

  describe('refresh', () => {
    let refreshToken;
    let userId;

    beforeEach(async () => {
      const result = await service.register({
        name: 'Refresh Test',
        email: 'refresh@example.com',
        password: 'securepassword123'
      });
      refreshToken = result.tokens.refreshToken;
      userId = result.user.id;
    });

    it('should issue new tokens with valid refresh token', async () => {
      const result = await service.refresh({ refreshToken });

      expect(result.user.id).toBe(userId);
      expect(result.tokens).toHaveProperty('accessToken');
      expect(result.tokens).toHaveProperty('refreshToken');
      expect(result.tokens.refreshToken).not.toBe(refreshToken);
    });

    it('should reject invalid refresh token', async () => {
      await expect(service.refresh({ 
        refreshToken: 'invalid-token-123' 
      })).rejects.toThrow('Invalid refresh token.');
    });

    it('should reject reused refresh token', async () => {
      // Use token once
      await service.refresh({ refreshToken });

      // Try to use again - should detect reuse
      await expect(service.refresh({ refreshToken }))
        .rejects.toThrow('Refresh token has been revoked');
    });

    it('should reject expired refresh token', async () => {
      // Create a session with expired token
      const expiredSession = await prisma.session.create({
        data: {
          userId,
          refreshTokenHash: 'expired-hash',
          expiresAt: new Date(Date.now() - 1000) // 1 second ago
        }
      });

      await expect(service.refresh({ 
        refreshToken: 'any-token-for-expired-hash' 
      })).rejects.toThrow('Invalid refresh token.');
    });

    it('should revoke old session after successful refresh', async () => {
      const oldSession = await prisma.session.findFirst({
        where: { userId, revokedAt: null }
      });

      await service.refresh({ refreshToken });

      const revokedSession = await prisma.session.findUnique({
        where: { id: oldSession.id }
      });

      expect(revokedSession.revokedAt).toBeTruthy();
    });
  });

  describe('logout', () => {
    let refreshToken;
    let userId;

    beforeEach(async () => {
      const result = await service.register({
        name: 'Logout Test',
        email: 'logout@example.com',
        password: 'securepassword123'
      });
      refreshToken = result.tokens.refreshToken;
      userId = result.user.id;
    });

    it('should revoke session on logout', async () => {
      const result = await service.logout(userId, refreshToken);

      expect(result.success).toBe(true);

      const session = await prisma.session.findFirst({
        where: { userId }
      });

      expect(session.revokedAt).toBeTruthy();
    });

    it('should reject logout with invalid token', async () => {
      await expect(service.logout(userId, 'invalid-token'))
        .rejects.toThrow('Session not found.');
    });
  });

  describe('getSessions', () => {
    let userId;

    beforeEach(async () => {
      const result = await service.register({
        name: 'Sessions Test',
        email: 'sessions@example.com',
        password: 'securepassword123'
      });
      userId = result.user.id;

      // Create additional sessions
      await service.login({
        email: 'sessions@example.com',
        password: 'securepassword123'
      });
    });

    it('should return active sessions', async () => {
      const sessions = await service.getSessions(userId);

      expect(sessions.length).toBeGreaterThan(0);
      expect(sessions[0]).toHaveProperty('id');
      expect(sessions[0]).toHaveProperty('createdAt');
      expect(sessions[0]).toHaveProperty('expiresAt');
    });

    it('should not return revoked sessions', async () => {
      const allSessions = await prisma.session.findMany({ where: { userId } });
      await prisma.session.update({
        where: { id: allSessions[0].id },
        data: { revokedAt: new Date() }
      });

      const activeSessions = await service.getSessions(userId);

      expect(activeSessions.length).toBe(allSessions.length - 1);
    });
  });

  describe('revokeSession', () => {
    let userId;
    let sessionId;

    beforeEach(async () => {
      const result = await service.register({
        name: 'Revoke Test',
        email: 'revoke@example.com',
        password: 'securepassword123'
      });
      userId = result.user.id;

      const sessions = await prisma.session.findMany({ where: { userId } });
      sessionId = sessions[0].id;
    });

    it('should revoke specific session', async () => {
      const result = await service.revokeSession(userId, sessionId);

      expect(result.success).toBe(true);

      const session = await prisma.session.findUnique({ where: { id: sessionId } });
      expect(session.revokedAt).toBeTruthy();
    });

    it('should reject revoking non-existent session', async () => {
      await expect(service.revokeSession(userId, 'non-existent-id'))
        .rejects.toThrow('Session not found.');
    });
  });

  describe('email verification', () => {
    let userId;

    beforeEach(async () => {
      const result = await service.register({
        name: 'Verify Test',
        email: 'verify@example.com',
        password: 'securepassword123'
      });
      userId = result.user.id;
    });

    it('should generate verification token', async () => {
      const result = await service.requestEmailVerification(userId);

      expect(result.message).toBe('Verification email sent.');
      expect(result.token).toBeTruthy(); // Development only
    });

    it('should verify email with valid token', async () => {
      const { token } = await service.requestEmailVerification(userId);

      const result = await service.verifyEmail({
        email: 'verify@example.com',
        token
      });

      expect(result.success).toBe(true);

      const user = await prisma.user.findUnique({ where: { id: userId } });
      expect(user.emailVerifiedAt).toBeTruthy();
    });

    it('should reject invalid verification token', async () => {
      await expect(service.verifyEmail({
        email: 'verify@example.com',
        token: 'invalid-token'
      })).rejects.toThrow('Invalid verification token.');
    });

    it('should reject already verified email', async () => {
      await prisma.user.update({
        where: { id: userId },
        data: { emailVerifiedAt: new Date() }
      });

      await expect(service.requestEmailVerification(userId))
        .rejects.toThrow('Email already verified.');
    });
  });

  describe('password reset', () => {
    let userId;

    beforeEach(async () => {
      const result = await service.register({
        name: 'Reset Test',
        email: 'reset@example.com',
        password: 'securepassword123'
      });
      userId = result.user.id;
    });

    it('should generate reset token', async () => {
      const result = await service.requestPasswordReset({ 
        email: 'reset@example.com' 
      });

      expect(result.message).toContain('password reset link');
      expect(result.token).toBeTruthy(); // Development only
    });

    it('should reset password with valid token', async () => {
      const { token } = await service.requestPasswordReset({ 
        email: 'reset@example.com' 
      });

      const result = await service.resetPassword({
        token,
        newPassword: 'newSecurePassword456'
      });

      expect(result.success).toBe(true);

      // Verify can login with new password
      const loginResult = await service.login({
        email: 'reset@example.com',
        password: 'newSecurePassword456'
      });

      expect(loginResult.user.id).toBe(userId);
    });

    it('should reject old password after reset', async () => {
      const { token } = await service.requestPasswordReset({ 
        email: 'reset@example.com' 
      });

      await service.resetPassword({
        token,
        newPassword: 'newSecurePassword456'
      });

      await expect(service.login({
        email: 'reset@example.com',
        password: 'securepassword123'
      })).rejects.toThrow('Invalid email or password.');
    });

    it('should revoke all sessions after password reset', async () => {
      const { token } = await service.requestPasswordReset({ 
        email: 'reset@example.com' 
      });

      await service.resetPassword({
        token,
        newPassword: 'newSecurePassword456'
      });

      const sessions = await prisma.session.findMany({
        where: { userId, revokedAt: null }
      });

      expect(sessions.length).toBe(0);
    });

    it('should reject reused reset token', async () => {
      const { token } = await service.requestPasswordReset({ 
        email: 'reset@example.com' 
      });

      await service.resetPassword({
        token,
        newPassword: 'newSecurePassword456'
      });

      await expect(service.resetPassword({
        token,
        newPassword: 'anotherPassword789'
      })).rejects.toThrow('Reset token has already been used.');
    });

    it('should not reveal if email does not exist', async () => {
      const result = await service.requestPasswordReset({ 
        email: 'nonexistent@example.com' 
      });

      expect(result.message).toContain('password reset link');
      expect(result.token).toBeUndefined();
    });
  });
});
