import { z } from "zod";
import { UserRole } from "../types/user.js";

// ---------------------------------------------------------------------------
// Password rules
// ---------------------------------------------------------------------------

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be at most 128 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one digit")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

const emailSchema = z.string().email().max(255).toLowerCase().trim();

// ---------------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------------

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export type LoginSchema = z.infer<typeof loginSchema>;

// ---------------------------------------------------------------------------
// Register
// ---------------------------------------------------------------------------

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: z.string().min(1).max(100).trim(),
  lastName: z.string().min(1).max(100).trim(),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number (E.164 format)")
    .optional(),
  organizationName: z.string().min(1).max(200).trim().optional(),
});

export type RegisterSchema = z.infer<typeof registerSchema>;

// ---------------------------------------------------------------------------
// Forgot / reset password
// ---------------------------------------------------------------------------

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: passwordSchema,
});

export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;

// ---------------------------------------------------------------------------
// Change password (authenticated)
// ---------------------------------------------------------------------------

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: passwordSchema,
});

export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>;

// ---------------------------------------------------------------------------
// Invite user
// ---------------------------------------------------------------------------

export const inviteUserSchema = z.object({
  email: emailSchema,
  role: z.nativeEnum(UserRole),
  organizationId: z.string().uuid(),
  firstName: z.string().min(1).max(100).trim().optional(),
  lastName: z.string().min(1).max(100).trim().optional(),
});

export type InviteUserSchema = z.infer<typeof inviteUserSchema>;

// ---------------------------------------------------------------------------
// Refresh token
// ---------------------------------------------------------------------------

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

export type RefreshTokenSchema = z.infer<typeof refreshTokenSchema>;

// ---------------------------------------------------------------------------
// Switch organization
// ---------------------------------------------------------------------------

export const switchOrganizationSchema = z.object({
  organizationId: z.string().uuid(),
});

export type SwitchOrganizationSchema = z.infer<typeof switchOrganizationSchema>;
