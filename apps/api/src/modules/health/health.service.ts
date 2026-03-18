import type { PrismaClient, Prisma } from "@prisma/client";
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "../../config/constants.js";
import { NotFoundError } from "../../lib/errors.js";
import type {
  CreateHealthRecordInput,
  CreateMedicationInput,
  CreateVaccinationInput,
  CreateInjuryInput,
  UpdateInjuryInput,
  CreateLabResultInput,
  HealthListQuery,
} from "./health.schemas.js";

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type ClearanceStatus = "CLEAR" | "HOLD" | "FAIL";

export interface PreRaceClearance {
  horseId: string;
  horseName: string;
  status: ClearanceStatus;
  reasons: { check: string; status: ClearanceStatus; message: string }[];
  evaluatedAt: Date;
}

export class HealthService {
  constructor(private readonly prisma: PrismaClient) {}

  // ---------------------------------------------------------------------------
  // Health records (general)
  // ---------------------------------------------------------------------------

  async listHealthRecords(
    orgId: string,
    query: HealthListQuery,
  ): Promise<PaginatedResult<any>> {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
    const skip = (page - 1) * limit;

    const where: Prisma.HealthRecordWhereInput = {
      orgId,
    };

    if (query.horseId) where.horseId = query.horseId;
    if (query.search) {
      where.OR = [
        { description: { contains: query.search, mode: "insensitive" } },
      ];
    }
    if (query.dateFrom || query.dateTo) {
      where.date = {};
      if (query.dateFrom) (where.date as any).gte = query.dateFrom;
      if (query.dateTo) (where.date as any).lte = query.dateTo;
    }

    let orderBy: Prisma.HealthRecordOrderByWithRelationInput = { date: "desc" };
    if (query.sort) {
      const [field, dir] = query.sort.split(":");
      if (field && (dir === "asc" || dir === "desc")) {
        orderBy = { [field]: dir };
      }
    }

    const [records, total] = await Promise.all([
      this.prisma.healthRecord.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: { horse: { select: { name: true } } },
      }),
      this.prisma.healthRecord.count({ where }),
    ]);

    return {
      data: records,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async createHealthRecord(
    orgId: string,
    createdBy: string,
    input: CreateHealthRecordInput,
  ): Promise<any> {
    return this.prisma.healthRecord.create({
      data: {
        orgId,
        horseId: input.horseId,
        type: input.type,
        date: input.date,
        description: input.description,
        vetName: input.vetName ?? null,
        findings: input.findings ?? null,
        treatment: input.treatment ?? null,
        followUpDate: input.followUpDate ?? null,
        attachmentUrls: input.attachmentUrls ?? [],
      },
    });
  }

  // ---------------------------------------------------------------------------
  // Medications
  // ---------------------------------------------------------------------------

  async listMedications(
    orgId: string,
    query: HealthListQuery,
  ): Promise<PaginatedResult<any>> {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
    const skip = (page - 1) * limit;

    const where: Prisma.MedicationLogWhereInput = {
      orgId,
    };

    if (query.horseId) where.horseId = query.horseId;
    if (query.search) {
      where.OR = [
        { medicationName: { contains: query.search, mode: "insensitive" } },
      ];
    }
    if (query.dateFrom || query.dateTo) {
      where.administeredAt = {};
      if (query.dateFrom) (where.administeredAt as any).gte = query.dateFrom;
      if (query.dateTo) (where.administeredAt as any).lte = query.dateTo;
    }

    const [records, total] = await Promise.all([
      this.prisma.medicationLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { administeredAt: "desc" },
        include: {
          horse: { select: { name: true } },
          administeredBy: { select: { firstName: true, lastName: true } },
        },
      }),
      this.prisma.medicationLog.count({ where }),
    ]);

    return {
      data: records,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async createMedication(
    orgId: string,
    input: CreateMedicationInput,
  ): Promise<any> {
    const administeredAt = new Date(input.administeredAt);
    const withdrawalEndsAt = input.withdrawalHours > 0
      ? new Date(administeredAt.getTime() + input.withdrawalHours * 60 * 60 * 1000)
      : null;

    return this.prisma.medicationLog.create({
      data: {
        orgId,
        horseId: input.horseId,
        medicationName: input.medicationName,
        dosage: input.dosage,
        route: input.route,
        administeredAt,
        administeredById: input.administeredById,
        withdrawalHours: input.withdrawalHours,
        withdrawalEndsAt,
        isControlled: input.isControlled ?? false,
        notes: input.notes ?? null,
      },
    });
  }

  /**
   * Get all active medication withdrawal countdowns.
   */
  async getWithdrawals(orgId: string, horseId?: string): Promise<any[]> {
    const now = new Date();

    const where: Prisma.MedicationLogWhereInput = {
      orgId,
      withdrawalEndsAt: { gt: now },
    };
    if (horseId) where.horseId = horseId;

    const records = await this.prisma.medicationLog.findMany({
      where,
      include: { horse: { select: { name: true } } },
      orderBy: { withdrawalEndsAt: "asc" },
    });

    return records.map((r: any) => {
      const hoursRemaining =
        (new Date(r.withdrawalEndsAt).getTime() - now.getTime()) / (1000 * 60 * 60);
      return {
        horseId: r.horseId,
        horseName: r.horse?.name ?? "Unknown",
        medicationName: r.medicationName,
        administeredAt: r.administeredAt,
        withdrawalEndsAt: r.withdrawalEndsAt,
        hoursRemaining: Math.round(hoursRemaining * 10) / 10,
        status: hoursRemaining <= 24 ? "WARNING" : "IN_WITHDRAWAL",
      };
    });
  }

  // ---------------------------------------------------------------------------
  // Vaccinations
  // ---------------------------------------------------------------------------

  async listVaccinations(
    orgId: string,
    query: HealthListQuery,
  ): Promise<PaginatedResult<any>> {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
    const skip = (page - 1) * limit;

    const where: Prisma.VaccinationWhereInput = {
      orgId,
    };

    if (query.horseId) where.horseId = query.horseId;
    if (query.dateFrom || query.dateTo) {
      where.givenDate = {};
      if (query.dateFrom) (where.givenDate as any).gte = query.dateFrom;
      if (query.dateTo) (where.givenDate as any).lte = query.dateTo;
    }

    const [records, total] = await Promise.all([
      this.prisma.vaccination.findMany({
        where,
        skip,
        take: limit,
        orderBy: { givenDate: "desc" },
        include: { horse: { select: { name: true } } },
      }),
      this.prisma.vaccination.count({ where }),
    ]);

    return {
      data: records,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async createVaccination(
    orgId: string,
    input: CreateVaccinationInput,
  ): Promise<any> {
    return this.prisma.vaccination.create({
      data: {
        orgId,
        horseId: input.horseId,
        vaccine: input.vaccine,
        batchNumber: input.batchNumber ?? null,
        givenDate: input.givenDate,
        expiresAt: input.expiresAt ?? null,
        vetName: input.vetName ?? null,
        notes: input.notes ?? null,
      },
    });
  }

  /**
   * Get vaccinations expiring within the given number of days.
   */
  async getVaccinationsDue(orgId: string, daysAhead: number = 30): Promise<any[]> {
    const now = new Date();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + daysAhead);

    return this.prisma.vaccination.findMany({
      where: {
        orgId,
        expiresAt: { gte: now, lte: cutoff },
      },
      include: { horse: { select: { name: true } } },
      orderBy: { expiresAt: "asc" },
    });
  }

  // ---------------------------------------------------------------------------
  // Injuries
  // ---------------------------------------------------------------------------

  async listInjuries(
    orgId: string,
    query: HealthListQuery,
  ): Promise<PaginatedResult<any>> {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
    const skip = (page - 1) * limit;

    const where: Prisma.InjuryWhereInput = {
      orgId,
    };

    if (query.horseId) where.horseId = query.horseId;
    if (query.search) {
      where.OR = [
        { description: { contains: query.search, mode: "insensitive" } },
        { location: { contains: query.search, mode: "insensitive" } },
      ];
    }

    const [records, total] = await Promise.all([
      this.prisma.injury.findMany({
        where,
        skip,
        take: limit,
        orderBy: { dateOccurred: "desc" },
        include: { horse: { select: { name: true } } },
      }),
      this.prisma.injury.count({ where }),
    ]);

    return {
      data: records,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async createInjury(orgId: string, input: CreateInjuryInput): Promise<any> {
    return this.prisma.injury.create({
      data: {
        orgId,
        horseId: input.horseId,
        description: input.description,
        location: input.location,
        severity: input.severity,
        dateOccurred: input.dateOccurred,
        treatmentPlan: input.treatmentPlan ?? null,
        status: "ACTIVE",
        notes: input.notes ?? null,
      },
    });
  }

  async updateInjury(
    orgId: string,
    injuryId: string,
    input: UpdateInjuryInput,
  ): Promise<any> {
    const injury = await this.prisma.injury.findFirst({
      where: { id: injuryId, orgId },
    });
    if (!injury) {
      throw new NotFoundError("Injury record", injuryId);
    }

    return this.prisma.injury.update({
      where: { id: injuryId },
      data: input,
    });
  }

  // ---------------------------------------------------------------------------
  // Lab results
  // ---------------------------------------------------------------------------

  async listLabResults(
    orgId: string,
    query: HealthListQuery,
  ): Promise<PaginatedResult<any>> {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
    const skip = (page - 1) * limit;

    const where: Prisma.LabResultWhereInput = {
      orgId,
    };

    if (query.horseId) where.horseId = query.horseId;
    if (query.search) {
      where.OR = [
        { testType: { contains: query.search, mode: "insensitive" } },
        { lab: { contains: query.search, mode: "insensitive" } },
      ];
    }

    const [records, total] = await Promise.all([
      this.prisma.labResult.findMany({
        where,
        skip,
        take: limit,
        orderBy: { testDate: "desc" },
        include: { horse: { select: { name: true } } },
      }),
      this.prisma.labResult.count({ where }),
    ]);

    return {
      data: records,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async createLabResult(orgId: string, input: CreateLabResultInput): Promise<any> {
    return this.prisma.labResult.create({
      data: {
        orgId,
        horseId: input.horseId,
        testType: input.testType,
        testDate: input.testDate,
        resultDate: input.resultDate ?? null,
        lab: input.lab ?? null,
        results: input.results,
        isNormal: input.isNormal ?? null,
        notes: input.notes ?? null,
        attachmentUrl: input.attachmentUrl ?? null,
      },
    });
  }

  // ---------------------------------------------------------------------------
  // Pre-race clearance check
  // ---------------------------------------------------------------------------

  async getPreRaceClearance(
    orgId: string,
    horseId: string,
  ): Promise<PreRaceClearance> {
    const horse = await this.prisma.horse.findFirst({
      where: { id: horseId, orgId },
      select: { id: true, name: true, status: true },
    });
    if (!horse) {
      throw new NotFoundError("Horse", horseId);
    }

    const now = new Date();
    const reasons: PreRaceClearance["reasons"] = [];
    let overallStatus: ClearanceStatus = "CLEAR";

    // 1. Check active medication withdrawal periods
    const activeMeds = await this.prisma.medicationLog.findMany({
      where: {
        horseId,
        orgId,
        withdrawalEndsAt: { gt: now },
      },
      orderBy: { withdrawalEndsAt: "desc" },
    });

    if (activeMeds.length > 0) {
      const latestWithdrawal = activeMeds[0]!;
      const hoursRemaining =
        (new Date(latestWithdrawal.withdrawalEndsAt!).getTime() - now.getTime()) /
        (1000 * 60 * 60);

      if (hoursRemaining > 24) {
        overallStatus = "FAIL";
        reasons.push({
          check: "medication_withdrawal",
          status: "FAIL",
          message: `${activeMeds.length} medication(s) in active withdrawal. Latest: ${latestWithdrawal.medicationName} clears at ${latestWithdrawal.withdrawalEndsAt!.toISOString()} (${Math.round(hoursRemaining)}h remaining)`,
        });
      } else {
        if (overallStatus === "CLEAR") overallStatus = "HOLD";
        reasons.push({
          check: "medication_withdrawal",
          status: "HOLD",
          message: `${activeMeds.length} medication(s) approaching clearance. Latest: ${latestWithdrawal.medicationName} clears at ${latestWithdrawal.withdrawalEndsAt!.toISOString()} (${Math.round(hoursRemaining)}h remaining)`,
        });
      }
    } else {
      reasons.push({
        check: "medication_withdrawal",
        status: "CLEAR",
        message: "No active medication withdrawal periods",
      });
    }

    // 2. Check Coggins document validity
    const cogginsDoc = await this.prisma.document.findFirst({
      where: {
        horseId,
        orgId,
        category: "COGGINS",
        status: "COMPLETED",
      },
      orderBy: { createdAt: "desc" },
    });

    if (!cogginsDoc) {
      overallStatus = "FAIL";
      reasons.push({
        check: "coggins",
        status: "FAIL",
        message: "No valid Coggins test document on file",
      });
    } else if (cogginsDoc.expiresAt && new Date(cogginsDoc.expiresAt) <= now) {
      overallStatus = "FAIL";
      reasons.push({
        check: "coggins",
        status: "FAIL",
        message: `Coggins document expired on ${cogginsDoc.expiresAt.toISOString().slice(0, 10)}`,
      });
    } else if (cogginsDoc.expiresAt) {
      const daysUntilExpiry =
        (new Date(cogginsDoc.expiresAt).getTime() - now.getTime()) /
        (1000 * 60 * 60 * 24);
      if (daysUntilExpiry <= 30) {
        if (overallStatus === "CLEAR") overallStatus = "HOLD";
        reasons.push({
          check: "coggins",
          status: "HOLD",
          message: `Coggins document expires in ${Math.round(daysUntilExpiry)} days (${cogginsDoc.expiresAt.toISOString().slice(0, 10)})`,
        });
      } else {
        reasons.push({
          check: "coggins",
          status: "CLEAR",
          message: `Coggins document valid until ${cogginsDoc.expiresAt.toISOString().slice(0, 10)}`,
        });
      }
    } else {
      reasons.push({
        check: "coggins",
        status: "CLEAR",
        message: "Coggins document on file (no expiration set)",
      });
    }

    // 3. Check active injuries
    const activeInjuries = await this.prisma.injury.findMany({
      where: {
        horseId,
        orgId,
        status: { in: ["ACTIVE", "HEALING"] },
      },
    });

    if (activeInjuries.length > 0) {
      const hasActive = activeInjuries.some((i) => i.status === "ACTIVE");
      const hasSevere = activeInjuries.some((i) => i.severity === "SEVERE" || i.severity === "CRITICAL");

      if (hasActive && hasSevere) {
        overallStatus = "FAIL";
        reasons.push({
          check: "injuries",
          status: "FAIL",
          message: `${activeInjuries.length} active/healing injury(ies). SEVERE active injury: ${activeInjuries.find((i) => i.severity === "SEVERE" || i.severity === "CRITICAL")?.description}`,
        });
      } else if (hasActive) {
        if (overallStatus === "CLEAR") overallStatus = "HOLD";
        reasons.push({
          check: "injuries",
          status: "HOLD",
          message: `${activeInjuries.length} active/healing injury(ies): ${activeInjuries.map((i) => i.description).join(", ")}`,
        });
      } else {
        if (overallStatus === "CLEAR") overallStatus = "HOLD";
        reasons.push({
          check: "injuries",
          status: "HOLD",
          message: `${activeInjuries.length} healing injury(ies): ${activeInjuries.map((i) => i.description).join(", ")}`,
        });
      }
    } else {
      reasons.push({
        check: "injuries",
        status: "CLEAR",
        message: "No active or healing injuries",
      });
    }

    // 4. Fitness assessment -- check horse status
    if (horse.status === "LAYUP" || horse.status === "INJURED") {
      overallStatus = "FAIL";
      reasons.push({
        check: "fitness",
        status: "FAIL",
        message: `Horse is currently on ${horse.status.toLowerCase()} status`,
      });
    } else if (horse.status === "RETIRED" || horse.status === "SOLD" || horse.status === "DECEASED") {
      overallStatus = "FAIL";
      reasons.push({
        check: "fitness",
        status: "FAIL",
        message: `Horse status is ${horse.status}; not eligible to race`,
      });
    } else if (horse.status === "ACTIVE") {
      reasons.push({
        check: "fitness",
        status: "CLEAR",
        message: "Horse status is ACTIVE",
      });
    } else {
      if (overallStatus === "CLEAR") overallStatus = "HOLD";
      reasons.push({
        check: "fitness",
        status: "HOLD",
        message: `Horse status is ${horse.status}; review needed`,
      });
    }

    return {
      horseId: horse.id,
      horseName: horse.name,
      status: overallStatus,
      reasons,
      evaluatedAt: now,
    };
  }
}
