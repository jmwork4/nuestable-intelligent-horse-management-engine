import { z } from "zod";

// ---------------------------------------------------------------------------
// Query schemas
// ---------------------------------------------------------------------------

export const ownerListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(25),
  search: z.string().optional(),
  sort: z.string().optional(),
});
export type OwnerListQuery = z.infer<typeof ownerListQuerySchema>;

export const ownerHorseIdParamSchema = z.object({
  id: z.string().uuid(),
});

// ---------------------------------------------------------------------------
// Message schemas
// ---------------------------------------------------------------------------

export const createMessageSchema = z.object({
  subject: z.string().min(1).max(300),
  body: z.string().min(1).max(10000),
  recipientId: z.string().uuid().optional(),
  horseId: z.string().uuid().optional(),
});
export type CreateMessageInput = z.infer<typeof createMessageSchema>;

// ---------------------------------------------------------------------------
// Vote schemas
// ---------------------------------------------------------------------------

export const castVoteSchema = z.object({
  choice: z.string().min(1).max(200),
});
export type CastVoteInput = z.infer<typeof castVoteSchema>;

export const voteIdParamSchema = z.object({
  id: z.string().uuid(),
});
