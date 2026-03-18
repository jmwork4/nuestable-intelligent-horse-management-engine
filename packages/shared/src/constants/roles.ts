import { UserRole } from "../types/user.js";

// ---------------------------------------------------------------------------
// Permission definitions
// ---------------------------------------------------------------------------

export enum Permission {
  // Horse management
  HORSE_VIEW = "HORSE_VIEW",
  HORSE_CREATE = "HORSE_CREATE",
  HORSE_EDIT = "HORSE_EDIT",
  HORSE_DELETE = "HORSE_DELETE",

  // Race management
  RACE_VIEW = "RACE_VIEW",
  RACE_CREATE = "RACE_CREATE",
  RACE_EDIT = "RACE_EDIT",
  RACE_ENTER = "RACE_ENTER",
  RACE_SCRATCH = "RACE_SCRATCH",

  // Health / vet
  HEALTH_VIEW = "HEALTH_VIEW",
  HEALTH_CREATE = "HEALTH_CREATE",
  HEALTH_EDIT = "HEALTH_EDIT",
  MEDICATION_ADMINISTER = "MEDICATION_ADMINISTER",

  // Documents
  DOCUMENT_VIEW = "DOCUMENT_VIEW",
  DOCUMENT_UPLOAD = "DOCUMENT_UPLOAD",
  DOCUMENT_VERIFY = "DOCUMENT_VERIFY",
  DOCUMENT_DELETE = "DOCUMENT_DELETE",

  // Financial
  FINANCIAL_VIEW = "FINANCIAL_VIEW",
  FINANCIAL_CREATE = "FINANCIAL_CREATE",
  FINANCIAL_EDIT = "FINANCIAL_EDIT",
  INVOICE_MANAGE = "INVOICE_MANAGE",
  PAYOUT_VIEW = "PAYOUT_VIEW",

  // Operations
  TASK_VIEW = "TASK_VIEW",
  TASK_CREATE = "TASK_CREATE",
  TASK_EDIT = "TASK_EDIT",
  FEED_LOG = "FEED_LOG",
  THERAPY_LOG = "THERAPY_LOG",
  BARN_MANAGE = "BARN_MANAGE",

  // Notifications
  NOTIFICATION_VIEW = "NOTIFICATION_VIEW",
  NOTIFICATION_MANAGE = "NOTIFICATION_MANAGE",

  // Organization admin
  ORG_SETTINGS = "ORG_SETTINGS",
  USER_MANAGE = "USER_MANAGE",
  ROLE_MANAGE = "ROLE_MANAGE",
  BILLING_MANAGE = "BILLING_MANAGE",
}

// ---------------------------------------------------------------------------
// Role → permission mapping
// ---------------------------------------------------------------------------

export const ROLE_PERMISSIONS: Readonly<Record<UserRole, readonly Permission[]>> = {
  [UserRole.ADMIN]: Object.values(Permission),

  [UserRole.TRAINER]: [
    Permission.HORSE_VIEW,
    Permission.HORSE_CREATE,
    Permission.HORSE_EDIT,
    Permission.RACE_VIEW,
    Permission.RACE_CREATE,
    Permission.RACE_EDIT,
    Permission.RACE_ENTER,
    Permission.RACE_SCRATCH,
    Permission.HEALTH_VIEW,
    Permission.HEALTH_CREATE,
    Permission.HEALTH_EDIT,
    Permission.MEDICATION_ADMINISTER,
    Permission.DOCUMENT_VIEW,
    Permission.DOCUMENT_UPLOAD,
    Permission.DOCUMENT_VERIFY,
    Permission.FINANCIAL_VIEW,
    Permission.FINANCIAL_CREATE,
    Permission.FINANCIAL_EDIT,
    Permission.INVOICE_MANAGE,
    Permission.PAYOUT_VIEW,
    Permission.TASK_VIEW,
    Permission.TASK_CREATE,
    Permission.TASK_EDIT,
    Permission.FEED_LOG,
    Permission.THERAPY_LOG,
    Permission.BARN_MANAGE,
    Permission.NOTIFICATION_VIEW,
    Permission.NOTIFICATION_MANAGE,
    Permission.USER_MANAGE,
  ],

  [UserRole.ASSISTANT_TRAINER]: [
    Permission.HORSE_VIEW,
    Permission.HORSE_EDIT,
    Permission.RACE_VIEW,
    Permission.RACE_ENTER,
    Permission.RACE_SCRATCH,
    Permission.HEALTH_VIEW,
    Permission.HEALTH_CREATE,
    Permission.HEALTH_EDIT,
    Permission.MEDICATION_ADMINISTER,
    Permission.DOCUMENT_VIEW,
    Permission.DOCUMENT_UPLOAD,
    Permission.FINANCIAL_VIEW,
    Permission.TASK_VIEW,
    Permission.TASK_CREATE,
    Permission.TASK_EDIT,
    Permission.FEED_LOG,
    Permission.THERAPY_LOG,
    Permission.BARN_MANAGE,
    Permission.NOTIFICATION_VIEW,
  ],

  [UserRole.OWNER]: [
    Permission.HORSE_VIEW,
    Permission.RACE_VIEW,
    Permission.HEALTH_VIEW,
    Permission.DOCUMENT_VIEW,
    Permission.DOCUMENT_UPLOAD,
    Permission.FINANCIAL_VIEW,
    Permission.PAYOUT_VIEW,
    Permission.NOTIFICATION_VIEW,
  ],

  [UserRole.VET]: [
    Permission.HORSE_VIEW,
    Permission.HEALTH_VIEW,
    Permission.HEALTH_CREATE,
    Permission.HEALTH_EDIT,
    Permission.MEDICATION_ADMINISTER,
    Permission.DOCUMENT_VIEW,
    Permission.DOCUMENT_UPLOAD,
    Permission.DOCUMENT_VERIFY,
    Permission.NOTIFICATION_VIEW,
  ],

  [UserRole.STAFF]: [
    Permission.HORSE_VIEW,
    Permission.HEALTH_VIEW,
    Permission.DOCUMENT_VIEW,
    Permission.TASK_VIEW,
    Permission.TASK_EDIT,
    Permission.FEED_LOG,
    Permission.THERAPY_LOG,
    Permission.NOTIFICATION_VIEW,
  ],

  [UserRole.VIEWER]: [
    Permission.HORSE_VIEW,
    Permission.RACE_VIEW,
    Permission.HEALTH_VIEW,
    Permission.DOCUMENT_VIEW,
    Permission.FINANCIAL_VIEW,
    Permission.TASK_VIEW,
    Permission.NOTIFICATION_VIEW,
  ],
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  const rolePerms = ROLE_PERMISSIONS[role];
  return permissions.some((p) => rolePerms.includes(p));
}

export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  const rolePerms = ROLE_PERMISSIONS[role];
  return permissions.every((p) => rolePerms.includes(p));
}

export const ROLE_DISPLAY_NAMES: Readonly<Record<UserRole, string>> = {
  [UserRole.ADMIN]: "Administrator",
  [UserRole.TRAINER]: "Trainer",
  [UserRole.ASSISTANT_TRAINER]: "Assistant Trainer",
  [UserRole.OWNER]: "Owner",
  [UserRole.VET]: "Veterinarian",
  [UserRole.STAFF]: "Staff",
  [UserRole.VIEWER]: "Viewer",
};

export const ROLE_HIERARCHY: Readonly<Record<UserRole, number>> = {
  [UserRole.ADMIN]: 100,
  [UserRole.TRAINER]: 80,
  [UserRole.ASSISTANT_TRAINER]: 70,
  [UserRole.VET]: 60,
  [UserRole.OWNER]: 50,
  [UserRole.STAFF]: 30,
  [UserRole.VIEWER]: 10,
};
