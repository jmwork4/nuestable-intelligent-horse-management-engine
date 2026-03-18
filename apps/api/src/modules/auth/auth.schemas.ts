import { z } from "zod";

// ---------------------------------------------------------------------------
// Request schemas
// ---------------------------------------------------------------------------

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  phone: z.string().max(20).optional(),
  organizationName: z.string().min(1).max(200).optional(),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});
export type RefreshInput = z.infer<typeof refreshSchema>;

export const logoutSchema = z.object({
  refreshToken: z.string().min(1).optional(),
});
export type LogoutInput = z.infer<typeof logoutSchema>;

// ---------------------------------------------------------------------------
// Response schemas
// ---------------------------------------------------------------------------

export const authTokensResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number(),
});

export const meResponseSchema = z.object({
  id: z.string(),
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  organizationId: z.string(),
  organizationName: z.string(),
  role: z.string(),
});

// ---------------------------------------------------------------------------
// Route-level validation helpers (Fastify schema format)
// ---------------------------------------------------------------------------

export const registerRouteSchema = {
  body: registerSchema,
  response: { 201: authTokensResponseSchema },
};

export const loginRouteSchema = {
  body: loginSchema,
  response: { 200: authTokensResponseSchema },
};

export const refreshRouteSchema = {
  body: refreshSchema,
  response: { 200: authTokensResponseSchema },
};

export const logoutRouteSchema = {
  body: logoutSchema,
};

export const meRouteSchema = {
  response: { 200: meResponseSchema },
};
