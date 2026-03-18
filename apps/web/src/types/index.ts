export type {
  Horse,
  HorseListItem,
  HorseSex,
  HorseStatus,
  HorseBreed,
  Surface,
  Pedigree,
  OwnershipShare,
  CreateHorseInput,
  UpdateHorseInput,
  Race,
  RaceEntry,
  RaceResult,
  RaceClass,
  RaceType,
  RaceStatus,
  RaceCondition,
  EntryStatus,
  EligibilityCheck,
  EligibilityReason,
  User,
  UserRole,
  SessionUser,
  Organization,
  AuthTokens,
  LoginInput,
  RegisterInput,
  Document,
  DocumentListItem,
  DocumentCategory,
  DocumentStatus,
  ExtractedField,
  MedicationRecord,
  VaccinationRecord,
  InjuryRecord,
  WithdrawalCountdown,
  WithdrawalStatus,
  MedicationRoute,
  VaccinationType,
  InjuryStatus,
  Expense,
  Revenue,
  Invoice,
  InvoiceLineItem,
  InvoiceStatus,
  ExpenseCategory,
  RevenueCategory,
  CostPerHorseSummary,
  PaymentMethod,
  Notification,
  NotificationPreference,
  NotificationCategory,
  NotificationChannel,
  NotificationPriority,
  Task,
  TaskStatus,
  TaskPriority,
  ChecklistTemplate,
  ChecklistInstance,
  ChecklistItem,
  FeedLog,
  FeedType,
  TherapyLog,
  TherapyType,
  Barn,
  Stall,
  StallStatus,
} from '@nuestable/shared';

/** Paginated API response wrapper */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Sort direction */
export type SortDirection = 'asc' | 'desc';

/** Column definition for DataTable */
export interface ColumnDef<T> {
  key: string;
  header: string;
  sortable?: boolean;
  width?: string;
  render?: (row: T) => React.ReactNode;
}
