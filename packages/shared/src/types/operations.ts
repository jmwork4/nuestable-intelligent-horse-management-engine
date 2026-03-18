// ---------------------------------------------------------------------------
// Daily operations — checklists, feeds, therapy, tasks, barn/stall mgmt
// ---------------------------------------------------------------------------

export enum TaskStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  SKIPPED = "SKIPPED",
  OVERDUE = "OVERDUE",
}

export enum TaskPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  URGENT = "URGENT",
}

export enum TaskRecurrence {
  NONE = "NONE",
  DAILY = "DAILY",
  WEEKLY = "WEEKLY",
  BIWEEKLY = "BIWEEKLY",
  MONTHLY = "MONTHLY",
  CUSTOM = "CUSTOM",
}

export enum FeedType {
  HAY = "HAY",
  GRAIN = "GRAIN",
  SUPPLEMENT = "SUPPLEMENT",
  ELECTROLYTE = "ELECTROLYTE",
  TREAT = "TREAT",
  OTHER = "OTHER",
}

export enum TherapyType {
  HOT_WALKER = "HOT_WALKER",
  COLD_THERAPY = "COLD_THERAPY",
  HYDROTHERAPY = "HYDROTHERAPY",
  LASER = "LASER",
  SHOCKWAVE = "SHOCKWAVE",
  ACUPUNCTURE = "ACUPUNCTURE",
  CHIROPRACTIC = "CHIROPRACTIC",
  MASSAGE = "MASSAGE",
  HYPERBARIC = "HYPERBARIC",
  SWIMMING = "SWIMMING",
  TREADMILL = "TREADMILL",
  OTHER = "OTHER",
}

export enum StallStatus {
  OCCUPIED = "OCCUPIED",
  VACANT = "VACANT",
  MAINTENANCE = "MAINTENANCE",
  RESERVED = "RESERVED",
}

export interface Barn {
  id: string;
  organizationId: string;
  name: string;
  location: string | null;
  capacity: number;
  stalls: Stall[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Stall {
  id: string;
  barnId: string;
  number: string;
  status: StallStatus;
  horseId: string | null;
  horseName: string | null;
  notes: string | null;
}

export interface Task {
  id: string;
  organizationId: string;
  horseId: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string | null;
  assigneeName: string | null;
  dueAt: Date | null;
  completedAt: Date | null;
  completedBy: string | null;
  recurrence: TaskRecurrence;
  recurrenceCron: string | null;
  parentTaskId: string | null;
  tags: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChecklistTemplate {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  items: ChecklistItem[];
  recurrence: TaskRecurrence;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChecklistItem {
  id: string;
  label: string;
  order: number;
  required: boolean;
}

export interface ChecklistInstance {
  id: string;
  templateId: string;
  organizationId: string;
  date: Date;
  completedItems: { itemId: string; completedAt: Date; completedBy: string }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface FeedLog {
  id: string;
  organizationId: string;
  horseId: string;
  feedType: FeedType;
  productName: string;
  quantityLbs: number;
  fedAt: Date;
  fedBy: string;
  notes: string | null;
  createdAt: Date;
}

export interface TherapyLog {
  id: string;
  organizationId: string;
  horseId: string;
  therapyType: TherapyType;
  durationMinutes: number;
  performedAt: Date;
  performedBy: string;
  settings: string | null; // device settings, temperature, etc.
  notes: string | null;
  createdAt: Date;
}

export interface CreateTaskInput {
  organizationId: string;
  horseId?: string;
  title: string;
  description?: string;
  priority?: TaskPriority;
  assigneeId?: string;
  dueAt?: Date | string;
  recurrence?: TaskRecurrence;
  recurrenceCron?: string;
  parentTaskId?: string;
  tags?: string[];
}

export interface CreateFeedLogInput {
  organizationId: string;
  horseId: string;
  feedType: FeedType;
  productName: string;
  quantityLbs: number;
  fedAt: Date | string;
  fedBy: string;
  notes?: string;
}

export interface CreateTherapyLogInput {
  organizationId: string;
  horseId: string;
  therapyType: TherapyType;
  durationMinutes: number;
  performedAt: Date | string;
  performedBy: string;
  settings?: string;
  notes?: string;
}
