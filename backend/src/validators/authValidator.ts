import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(60, 'Name must be at most 60 characters'),
  email: z.string().email('Valid email address is required'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100, 'Password is too long')
});

export const loginSchema = z.object({
  email: z.string().email('Valid email address is required'),
  password: z.string().min(1, 'Password is required')
});

export const updatePreferencesSchema = z.object({
  storeFullCodePreference: z.boolean()
});
