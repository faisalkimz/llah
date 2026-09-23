import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().email().transform(v => v.toLowerCase()),
  password: z.string().min(10).max(128)
});

export const loginSchema = z.object({
  email: z.string().email().transform(v => v.toLowerCase()),
  password: z.string().min(1)
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1)
});

export const logoutSchema = z.object({
  refreshToken: z.string().min(1)
});

export const verifyEmailSchema = z.object({
  email: z.string().email().transform(v => v.toLowerCase()),
  token: z.string().min(1)
});

export const requestPasswordResetSchema = z.object({
  email: z.string().email().transform(v => v.toLowerCase())
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(10).max(128)
});
