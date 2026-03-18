// ---------------------------------------------------------------------------
// Horse-related types — mirrors Prisma enums & models
// ---------------------------------------------------------------------------

export enum HorseSex {
  COLT = "COLT",
  FILLY = "FILLY",
  GELDING = "GELDING",
  MARE = "MARE",
  STALLION = "STALLION",
  RIDGLING = "RIDGLING",
}

export enum HorseStatus {
  ACTIVE = "ACTIVE",
  RETIRED = "RETIRED",
  SOLD = "SOLD",
  DECEASED = "DECEASED",
  LAYUP = "LAYUP",
  CLAIMED = "CLAIMED",
}

export enum HorseBreed {
  THOROUGHBRED = "THOROUGHBRED",
  QUARTER_HORSE = "QUARTER_HORSE",
  STANDARDBRED = "STANDARDBRED",
  ARABIAN = "ARABIAN",
  APPALOOSA = "APPALOOSA",
  PAINT = "PAINT",
  OTHER = "OTHER",
}

export enum Surface {
  DIRT = "DIRT",
  TURF = "TURF",
  SYNTHETIC = "SYNTHETIC",
  ALL_WEATHER = "ALL_WEATHER",
}

export interface Pedigree {
  sire: string | null;
  dam: string | null;
  sireOfDam: string | null;
  sireLineage?: string[];
  damLineage?: string[];
}

export interface OwnershipShare {
  id: string;
  horseId: string;
  userId: string;
  ownerName: string;
  percentage: number; // 0–100, must sum to 100 across all shares
  effectiveDate: Date;
  endDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Horse {
  id: string;
  organizationId: string;
  name: string;
  registeredName: string | null;
  tattooNumber: string | null;
  chipNumber: string | null;
  foalDate: Date | null;
  sex: HorseSex;
  breed: HorseBreed;
  color: string | null;
  status: HorseStatus;
  pedigree: Pedigree | null;
  ownershipShares: OwnershipShare[];
  imageUrl: string | null;
  notes: string | null;
  barnId: string | null;
  stallId: string | null;
  trainerId: string | null;
  surfacePreferences: Surface[];
  claimPrice: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface HorseListItem
  extends Pick<
    Horse,
    | "id"
    | "name"
    | "sex"
    | "breed"
    | "status"
    | "imageUrl"
    | "trainerId"
    | "barnId"
    | "stallId"
  > {
  ownerNames: string[];
  nextRaceDate: Date | null;
  nextRaceName: string | null;
}

export interface CreateHorseInput {
  organizationId: string;
  name: string;
  registeredName?: string;
  tattooNumber?: string;
  chipNumber?: string;
  foalDate?: Date | string;
  sex: HorseSex;
  breed: HorseBreed;
  color?: string;
  status?: HorseStatus;
  pedigree?: Pedigree;
  imageUrl?: string;
  notes?: string;
  barnId?: string;
  stallId?: string;
  trainerId?: string;
  surfacePreferences?: Surface[];
  claimPrice?: number;
  ownershipShares?: Omit<OwnershipShare, "id" | "horseId" | "createdAt" | "updatedAt">[];
}

export interface UpdateHorseInput extends Partial<Omit<CreateHorseInput, "organizationId">> {
  id: string;
}
