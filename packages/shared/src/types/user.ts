// ---------------------------------------------------------------------------
// User, auth & multi-tenancy types
// ---------------------------------------------------------------------------

export enum UserRole {
  ADMIN = "ADMIN",
  TRAINER = "TRAINER",
  ASSISTANT_TRAINER = "ASSISTANT_TRAINER",
  OWNER = "OWNER",
  VET = "VET",
  STAFF = "STAFF",
  VIEWER = "VIEWER",
}

export enum AuthProvider {
  EMAIL = "EMAIL",
  GOOGLE = "GOOGLE",
  APPLE = "APPLE",
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  avatarUrl: string | null;
  authProvider: AuthProvider;
  emailVerified: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationMembership {
  id: string;
  userId: string;
  organizationId: string;
  role: UserRole;
  isDefault: boolean;
  joinedAt: Date;
  updatedAt: Date;
}

export interface UserWithMemberships extends User {
  memberships: OrganizationMembership[];
}

export interface JwtPayload {
  sub: string; // userId
  email: string;
  orgId: string; // active organization
  role: UserRole;
  iat: number;
  exp: number;
}

export interface JwtRefreshPayload {
  sub: string;
  jti: string; // token id for revocation
  iat: number;
  exp: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  organizationName?: string;
}

export interface ResetPasswordInput {
  token: string;
  newPassword: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface InviteUserInput {
  email: string;
  role: UserRole;
  organizationId: string;
  firstName?: string;
  lastName?: string;
}

export interface SessionUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  organizationId: string;
  organizationName: string;
  role: UserRole;
}
