import type { PrismaClient, Prisma } from "@prisma/client";
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "../../config/constants.js";
import { NotFoundError, ValidationError } from "../../lib/errors.js";
import type {
  SendNotificationInput,
  UpdatePreferenceInput,
  NotificationListQuery,
} from "./notifications.schemas.js";

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class NotificationService {
  constructor(private readonly prisma: PrismaClient) {}

  // ---------------------------------------------------------------------------
  // Dispatch notification
  // ---------------------------------------------------------------------------

  async dispatch(
    orgId: string,
    input: SendNotificationInput,
  ): Promise<any> {
    const notification = await this.prisma.notification.create({
      data: {
        orgId,
        userId: input.userId,
        type: input.type,
        title: input.title,
        body: input.body,
        data: input.data ? (input.data as any) : undefined,
        channel: input.channel ?? "IN_APP",
        deliveredAt: input.channel === "IN_APP" ? new Date() : null,
      },
    });

    return notification;
  }

  // ---------------------------------------------------------------------------
  // List notifications for user
  // ---------------------------------------------------------------------------

  async list(
    userId: string,
    orgId: string,
    query: NotificationListQuery,
  ): Promise<PaginatedResult<any>> {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
    const skip = (page - 1) * limit;

    const where: Prisma.NotificationWhereInput = {
      userId,
      orgId,
    };

    if (query.type) where.type = query.type;
    if (query.unreadOnly) where.isRead = false;

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { alertDeliveryLogs: true },
      }),
      this.prisma.notification.count({ where }),
    ]);

    return {
      data: notifications,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ---------------------------------------------------------------------------
  // Mark read
  // ---------------------------------------------------------------------------

  async markRead(userId: string, orgId: string, notificationId: string): Promise<any> {
    const notification = await this.prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId,
        orgId,
      },
    });
    if (!notification) {
      throw new NotFoundError("Notification", notificationId);
    }

    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async markAllRead(userId: string, orgId: string): Promise<{ count: number }> {
    const result = await this.prisma.notification.updateMany({
      where: {
        userId,
        orgId,
        isRead: false,
      },
      data: { isRead: true, readAt: new Date() },
    });
    return { count: result.count };
  }

  // ---------------------------------------------------------------------------
  // Unread count
  // ---------------------------------------------------------------------------

  async getUnreadCount(userId: string, orgId: string): Promise<{ count: number }> {
    const count = await this.prisma.notification.count({
      where: {
        userId,
        orgId,
        isRead: false,
      },
    });
    return { count };
  }

  // ---------------------------------------------------------------------------
  // Preferences
  // ---------------------------------------------------------------------------

  async getPreferences(userId: string, orgId: string): Promise<any[]> {
    return this.prisma.notificationPref.findMany({
      where: {
        userId,
        orgId,
      },
      orderBy: { type: "asc" },
    });
  }

  async updatePreferences(
    userId: string,
    orgId: string,
    input: UpdatePreferenceInput[],
  ): Promise<any[]> {
    const results: any[] = [];

    for (const pref of input) {
      // Upsert: use the unique constraint [userId, type, channel]
      const existing = await this.prisma.notificationPref.findUnique({
        where: {
          userId_type_channel: {
            userId,
            type: pref.type,
            channel: pref.channel,
          },
        },
      });

      if (existing) {
        const updated = await this.prisma.notificationPref.update({
          where: { id: existing.id },
          data: {
            enabled: pref.enabled,
          },
        });
        results.push(updated);
      } else {
        const created = await this.prisma.notificationPref.create({
          data: {
            userId,
            orgId,
            type: pref.type,
            channel: pref.channel,
            enabled: pref.enabled,
          },
        });
        results.push(created);
      }
    }

    return results;
  }
}
