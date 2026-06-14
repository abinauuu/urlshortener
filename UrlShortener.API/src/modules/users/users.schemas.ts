import { z } from 'zod';

export const updateProfileSchema = z.object({
  firstName: z.string().trim().max(50, 'First name too long').optional(),
  lastName: z.string().trim().max(50, 'Last name too long').optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});
