/** Default number of items per page for list endpoints */
export const DEFAULT_PAGE_SIZE = 25;

/** Maximum number of items per page for list endpoints */
export const MAX_PAGE_SIZE = 100;

/** JWT access token expiry */
export const ACCESS_TOKEN_EXPIRY = "15m";

/** JWT refresh token expiry */
export const REFRESH_TOKEN_EXPIRY = "7d";

/** JWT access token expiry in seconds */
export const ACCESS_TOKEN_EXPIRY_SECONDS = 900;

/** JWT refresh token expiry in seconds */
export const REFRESH_TOKEN_EXPIRY_SECONDS = 604800;

/** BullMQ job default options */
export const DEFAULT_JOB_OPTIONS = {
  attempts: 3,
  backoff: {
    type: "exponential" as const,
    delay: 1000,
  },
  removeOnComplete: {
    age: 86400, // 24 hours
    count: 1000,
  },
  removeOnFail: {
    age: 604800, // 7 days
  },
};

/** Named queues for background jobs */
export const QUEUE_NAMES = {
  NOTIFICATIONS: "notifications",
  DOCUMENT_AI: "document-ai",
  RACE_SYNC: "race-sync",
} as const;

/** Socket.io event names */
export const SOCKET_EVENTS = {
  NOTIFICATION: "notification",
  HORSE_UPDATE: "horse:update",
  RACE_UPDATE: "race:update",
  DOCUMENT_PROCESSED: "document:processed",
} as const;

/** User roles ordered by privilege level */
export const ROLE_HIERARCHY: Record<string, number> = {
  OWNER: 100,
  ADMIN: 80,
  TRAINER: 60,
  VETERINARIAN: 50,
  GROOM: 40,
  VIEWER: 10,
};

/** Race types */
export const RACE_TYPES = [
  "MAIDEN",
  "CLAIMING",
  "ALLOWANCE",
  "STAKES",
  "GRADED_STAKES",
  "HANDICAP",
] as const;

/** Race surfaces */
export const RACE_SURFACES = ["DIRT", "TURF", "SYNTHETIC"] as const;

/** Document categories for AI extraction */
export const DOCUMENT_CATEGORIES = [
  "VET_RECORD",
  "RACE_RESULT",
  "REGISTRATION",
  "INSURANCE",
  "PURCHASE_AGREEMENT",
  "TRAINING_LOG",
] as const;
