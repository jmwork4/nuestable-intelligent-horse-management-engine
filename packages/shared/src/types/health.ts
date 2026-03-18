// ---------------------------------------------------------------------------
// Health, medications, vaccinations & injuries
// ---------------------------------------------------------------------------

export enum MedicationRoute {
  ORAL = "ORAL",
  IV = "IV",
  IM = "IM",
  TOPICAL = "TOPICAL",
  INTRA_ARTICULAR = "INTRA_ARTICULAR",
  OPHTHALMIC = "OPHTHALMIC",
  INHALATION = "INHALATION",
  SUBCUTANEOUS = "SUBCUTANEOUS",
  OTHER = "OTHER",
}

export enum MedicationStatus {
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum WithdrawalStatus {
  CLEAR = "CLEAR",
  IN_WITHDRAWAL = "IN_WITHDRAWAL",
  WARNING = "WARNING", // approaching clearance but not yet clear
}

export enum VaccinationType {
  INFLUENZA = "INFLUENZA",
  RHINOPNEUMONITIS = "RHINOPNEUMONITIS",
  TETANUS = "TETANUS",
  RABIES = "RABIES",
  WEST_NILE = "WEST_NILE",
  STRANGLES = "STRANGLES",
  POTOMAC_HORSE_FEVER = "POTOMAC_HORSE_FEVER",
  ENCEPHALOMYELITIS = "ENCEPHALOMYELITIS",
  BOTULISM = "BOTULISM",
  OTHER = "OTHER",
}

export enum InjuryStatus {
  ACTIVE = "ACTIVE",
  RECOVERING = "RECOVERING",
  RESOLVED = "RESOLVED",
}

export enum LabResultStatus {
  PENDING = "PENDING",
  RECEIVED = "RECEIVED",
  ABNORMAL = "ABNORMAL",
  NORMAL = "NORMAL",
}

export interface MedicationRecord {
  id: string;
  organizationId: string;
  horseId: string;
  medicationName: string;
  genericName: string | null;
  dosage: string;
  route: MedicationRoute;
  frequency: string | null;
  administeredAt: Date;
  administeredBy: string;
  prescribedBy: string | null;
  withdrawalHours: number;
  withdrawalEndsAt: Date;
  withdrawalStatus: WithdrawalStatus;
  status: MedicationStatus;
  notes: string | null;
  batchNumber: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface WithdrawalCountdown {
  horseId: string;
  horseName: string;
  medicationName: string;
  administeredAt: Date;
  withdrawalEndsAt: Date;
  hoursRemaining: number;
  status: WithdrawalStatus;
}

export interface VaccinationRecord {
  id: string;
  organizationId: string;
  horseId: string;
  type: VaccinationType;
  vaccineName: string;
  administeredAt: Date;
  administeredBy: string;
  nextDueDate: Date | null;
  batchNumber: string | null;
  manufacturer: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface InjuryRecord {
  id: string;
  organizationId: string;
  horseId: string;
  description: string;
  location: string;
  severity: "MILD" | "MODERATE" | "SEVERE";
  occurredAt: Date;
  diagnosedBy: string | null;
  treatmentPlan: string | null;
  status: InjuryStatus;
  resolvedAt: Date | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface LabResult {
  id: string;
  organizationId: string;
  horseId: string;
  testName: string;
  labName: string | null;
  collectedAt: Date;
  resultReceivedAt: Date | null;
  status: LabResultStatus;
  resultSummary: string | null;
  resultFileUrl: string | null;
  orderedBy: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMedicationInput {
  organizationId: string;
  horseId: string;
  medicationName: string;
  genericName?: string;
  dosage: string;
  route: MedicationRoute;
  frequency?: string;
  administeredAt: Date | string;
  administeredBy: string;
  prescribedBy?: string;
  withdrawalHours: number;
  notes?: string;
  batchNumber?: string;
}

export interface CreateVaccinationInput {
  organizationId: string;
  horseId: string;
  type: VaccinationType;
  vaccineName: string;
  administeredAt: Date | string;
  administeredBy: string;
  nextDueDate?: Date | string;
  batchNumber?: string;
  manufacturer?: string;
  notes?: string;
}

export interface CreateInjuryInput {
  organizationId: string;
  horseId: string;
  description: string;
  location: string;
  severity: "MILD" | "MODERATE" | "SEVERE";
  occurredAt: Date | string;
  diagnosedBy?: string;
  treatmentPlan?: string;
  notes?: string;
}
