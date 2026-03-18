import type { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { getEnv } from "../../config/env.js";
import {
  ACCESS_TOKEN_EXPIRY,
  ACCESS_TOKEN_EXPIRY_SECONDS,
  REFRESH_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY_SECONDS,
} from "../../config/constants.js";
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "../../lib/errors.js";
import type { RegisterInput, LoginInput, RefreshInput } from "./auth.schemas.js";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface SessionUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  avatarUrl: string | null;
  organizationId: string;
  organizationName: string;
  role: string;
}

const SALT_ROUNDS = 12;

export class AuthService {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Register a new user, create an organization, and return auth tokens.
   * In this schema, orgId and role live directly on the User model.
   */
  async register(input: RegisterInput): Promise<AuthTokens> {
    const orgName = input.organizationName || `${input.firstName}'s Stable`;
    const slug = orgName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);

    const result = await this.prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          name: orgName,
          slug: `${slug}-${crypto.randomBytes(3).toString("hex")}`,
        },
      });

      // Check if user already exists within this org
      const existing = await tx.user.findUnique({
        where: { orgId_email: { orgId: organization.id, email: input.email.toLowerCase() } },
      });
      if (existing) {
        throw new ConflictError("A user with this email already exists");
      }

      const user = await tx.user.create({
        data: {
          orgId: organization.id,
          email: input.email.toLowerCase(),
          passwordHash: hashedPassword,
          firstName: input.firstName,
          lastName: input.lastName,
          phone: input.phone ?? null,
          role: "ADMIN",
        },
      });

      return { user, organization };
    });

    return this.generateTokens(
      result.user.id,
      result.user.email,
      result.organization.id,
      result.user.role,
    );
  }

  /**
   * Authenticate a user with email + password, return auth tokens.
   */
  async login(input: LoginInput): Promise<AuthTokens> {
    // Since email is unique per org, we search across all orgs
    const users = await this.prisma.user.findMany({
      where: { email: input.email.toLowerCase() },
      include: { org: true },
    });

    // Try each matching user (across orgs) until password matches
    for (const user of users) {
      if (!user.passwordHash) continue;
      const valid = await bcrypt.compare(input.password, user.passwordHash);
      if (valid) {
        // Update last login timestamp
        await this.prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return this.generateTokens(
          user.id,
          user.email,
          user.orgId,
          user.role,
        );
      }
    }

    throw new UnauthorizedError("Invalid email or password");
  }

  /**
   * Refresh an access token using a valid refresh token.
   */
  async refresh(input: RefreshInput): Promise<AuthTokens> {
    const env = getEnv();
    let payload: { sub: string; jti: string };

    try {
      payload = jwt.verify(input.refreshToken, env.JWT_REFRESH_SECRET) as {
        sub: string;
        jti: string;
      };
    } catch {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }

    // Check that the refresh token has not been revoked
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { id: payload.jti },
    });
    if (!storedToken || storedToken.revokedAt !== null) {
      throw new UnauthorizedError("Refresh token has been revoked");
    }

    // Revoke the old refresh token (rotation)
    await this.prisma.refreshToken.update({
      where: { id: payload.jti },
      data: { revokedAt: new Date() },
    });

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    if (!user) {
      throw new UnauthorizedError("User no longer exists");
    }

    return this.generateTokens(
      user.id,
      user.email,
      user.orgId,
      user.role,
    );
  }

  /**
   * Revoke the given refresh token (or all tokens for the user).
   */
  async logout(userId: string, refreshToken?: string): Promise<void> {
    if (refreshToken) {
      const env = getEnv();
      try {
        const payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as {
          jti: string;
        };
        await this.prisma.refreshToken.update({
          where: { id: payload.jti },
          data: { revokedAt: new Date() },
        });
      } catch {
        // Token already invalid; nothing to revoke
      }
    } else {
      // Revoke all refresh tokens for this user
      await this.prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
  }

  /**
   * Get the current session user profile.
   */
  async getMe(userId: string, orgId: string): Promise<SessionUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { org: true },
    });
    if (!user) {
      throw new NotFoundError("User", userId);
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      organizationId: user.orgId,
      organizationName: user.org.name,
      role: user.role,
    };
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private async generateTokens(
    userId: string,
    email: string,
    orgId: string,
    role: string,
  ): Promise<AuthTokens> {
    const env = getEnv();
    const jti = crypto.randomUUID();

    const accessToken = jwt.sign(
      { sub: userId, email, orgId, role },
      env.JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY },
    );

    const refreshToken = jwt.sign(
      { sub: userId, jti },
      env.JWT_REFRESH_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRY },
    );

    // Persist refresh token for revocation support
    await this.prisma.refreshToken.create({
      data: {
        id: jti,
        userId,
        orgId,
        token: refreshToken,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_SECONDS * 1000),
      },
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: ACCESS_TOKEN_EXPIRY_SECONDS,
    };
  }
}
