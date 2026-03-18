import { MedicationRoute } from "../types/health.js";

// ---------------------------------------------------------------------------
// Common racing medications with HISA withdrawal periods
// ---------------------------------------------------------------------------

export interface MedicationDefinition {
  /** Brand / common name */
  name: string;
  /** Generic / active ingredient */
  genericName: string;
  /** Drug class or category */
  category: string;
  /** Common administration routes */
  routes: MedicationRoute[];
  /** HISA-mandated withdrawal period in hours before race time */
  withdrawalHours: number;
  /** Whether the medication is a controlled substance under HISA */
  controlled: boolean;
  /** Additional regulatory notes */
  notes: string;
}

/**
 * Common racing medications with HISA (Horseracing Integrity and Safety
 * Authority) withdrawal periods. These represent the federally mandated
 * controlled medication schedules effective under HISA Anti-Doping and
 * Medication Control rules.
 *
 * Times are the minimum withdrawal period in hours before post time.
 */
export const COMMON_MEDICATIONS: readonly MedicationDefinition[] = [
  // -- NSAIDs ---------------------------------------------------------------
  {
    name: "Phenylbutazone (Bute)",
    genericName: "Phenylbutazone",
    category: "NSAID",
    routes: [MedicationRoute.ORAL, MedicationRoute.IV],
    withdrawalHours: 168, // 7 days
    controlled: true,
    notes:
      "Maximum 2 mg/mL plasma threshold on race day. Only one NSAID permitted under HISA stacking rule.",
  },
  {
    name: "Flunixin Meglumine (Banamine)",
    genericName: "Flunixin Meglumine",
    category: "NSAID",
    routes: [MedicationRoute.IV, MedicationRoute.ORAL],
    withdrawalHours: 24,
    controlled: true,
    notes:
      "Maximum 20 ng/mL plasma threshold. Cannot be stacked with other NSAIDs under HISA rules.",
  },
  {
    name: "Ketoprofen (Ketofen)",
    genericName: "Ketoprofen",
    category: "NSAID",
    routes: [MedicationRoute.IV],
    withdrawalHours: 24,
    controlled: true,
    notes: "Maximum 2 ng/mL plasma threshold. NSAID stacking rules apply.",
  },
  {
    name: "Firocoxib (Equioxx)",
    genericName: "Firocoxib",
    category: "NSAID (COX-2 selective)",
    routes: [MedicationRoute.ORAL],
    withdrawalHours: 336, // 14 days
    controlled: true,
    notes:
      "Long half-life COX-2 inhibitor. 14-day withdrawal period. NSAID stacking rules apply.",
  },
  {
    name: "Diclofenac (Surpass)",
    genericName: "Diclofenac",
    category: "NSAID (Topical)",
    routes: [MedicationRoute.TOPICAL],
    withdrawalHours: 72, // 3 days
    controlled: true,
    notes: "Topical NSAID. Despite topical route, still subject to NSAID stacking rule.",
  },

  // -- Diuretics / Race-Day Medications -------------------------------------
  {
    name: "Furosemide (Lasix/Salix)",
    genericName: "Furosemide",
    category: "Diuretic",
    routes: [MedicationRoute.IV],
    withdrawalHours: 24,
    controlled: true,
    notes:
      "Permitted race-day medication for EIPH (bleeders) in some jurisdictions under HISA. " +
      "Must be administered by a licensed vet 4 hours (+/- 15 min) before post time. " +
      "Being phased out in two-year-old stakes races.",
  },

  // -- Corticosteroids ------------------------------------------------------
  {
    name: "Methylprednisolone Acetate (Depo-Medrol)",
    genericName: "Methylprednisolone Acetate",
    category: "Corticosteroid",
    routes: [MedicationRoute.INTRA_ARTICULAR],
    withdrawalHours: 336, // 14 days
    controlled: true,
    notes: "Intra-articular use. Strict 14-day stand-down under HISA.",
  },
  {
    name: "Triamcinolone Acetonide (Kenalog)",
    genericName: "Triamcinolone Acetonide",
    category: "Corticosteroid",
    routes: [MedicationRoute.INTRA_ARTICULAR],
    withdrawalHours: 336, // 14 days
    controlled: true,
    notes: "Intra-articular corticosteroid. 14-day withdrawal under HISA.",
  },
  {
    name: "Betamethasone (Celestone)",
    genericName: "Betamethasone",
    category: "Corticosteroid",
    routes: [MedicationRoute.INTRA_ARTICULAR, MedicationRoute.IM],
    withdrawalHours: 336, // 14 days
    controlled: true,
    notes: "14-day stand-down for intra-articular administration under HISA.",
  },
  {
    name: "Dexamethasone",
    genericName: "Dexamethasone",
    category: "Corticosteroid",
    routes: [MedicationRoute.IV, MedicationRoute.IM, MedicationRoute.ORAL],
    withdrawalHours: 72, // 3 days
    controlled: true,
    notes: "Shorter-acting corticosteroid. 72-hour withdrawal period.",
  },
  {
    name: "Prednisolone",
    genericName: "Prednisolone",
    category: "Corticosteroid",
    routes: [MedicationRoute.ORAL],
    withdrawalHours: 72, // 3 days
    controlled: true,
    notes: "Oral corticosteroid with 72-hour withdrawal.",
  },

  // -- Sedatives / Tranquilizers -------------------------------------------
  {
    name: "Acepromazine (PromAce)",
    genericName: "Acepromazine Maleate",
    category: "Tranquilizer",
    routes: [MedicationRoute.IV, MedicationRoute.IM],
    withdrawalHours: 72,
    controlled: true,
    notes: "Phenothiazine tranquilizer. Prohibited class — detection = violation on race day.",
  },
  {
    name: "Detomidine (Dormosedan)",
    genericName: "Detomidine",
    category: "Sedative (Alpha-2 agonist)",
    routes: [MedicationRoute.IV, MedicationRoute.IM, MedicationRoute.ORAL],
    withdrawalHours: 48,
    controlled: true,
    notes: "Alpha-2 agonist sedative. 48-hour withdrawal.",
  },
  {
    name: "Xylazine (Rompun)",
    genericName: "Xylazine",
    category: "Sedative (Alpha-2 agonist)",
    routes: [MedicationRoute.IV, MedicationRoute.IM],
    withdrawalHours: 48,
    controlled: true,
    notes: "Alpha-2 agonist. 48-hour withdrawal.",
  },

  // -- Gastric / Omeprazole ------------------------------------------------
  {
    name: "Omeprazole (GastroGard)",
    genericName: "Omeprazole",
    category: "Proton Pump Inhibitor",
    routes: [MedicationRoute.ORAL],
    withdrawalHours: 24,
    controlled: true,
    notes:
      "Used for gastric ulcer prevention/treatment. 24-hour withdrawal. " +
      "Injectable formulation (not approved in US) has longer withdrawal.",
  },

  // -- Bronchodilators -----------------------------------------------------
  {
    name: "Clenbuterol (Ventipulmin)",
    genericName: "Clenbuterol",
    category: "Bronchodilator (Beta-2 agonist)",
    routes: [MedicationRoute.ORAL],
    withdrawalHours: 336, // 14 days
    controlled: true,
    notes:
      "Beta-2 agonist bronchodilator. 14-day withdrawal. Also has anabolic properties; " +
      "closely monitored by HISA.",
  },
  {
    name: "Albuterol",
    genericName: "Albuterol Sulfate",
    category: "Bronchodilator (Beta-2 agonist)",
    routes: [MedicationRoute.INHALATION, MedicationRoute.ORAL],
    withdrawalHours: 48,
    controlled: true,
    notes: "Short-acting beta-2 agonist. 48-hour withdrawal.",
  },

  // -- Joint Therapies -----------------------------------------------------
  {
    name: "Hyaluronic Acid (Legend / Hyvisc)",
    genericName: "Hyaluronate Sodium",
    category: "Joint Supplement / Viscosupplementation",
    routes: [MedicationRoute.IV, MedicationRoute.INTRA_ARTICULAR],
    withdrawalHours: 48,
    controlled: true,
    notes: "IV or intra-articular. 48-hour withdrawal for IV; IA may require longer stand-down.",
  },
  {
    name: "Adequan (Polysulfated Glycosaminoglycan)",
    genericName: "Polysulfated Glycosaminoglycan",
    category: "Joint Therapy",
    routes: [MedicationRoute.IM, MedicationRoute.INTRA_ARTICULAR],
    withdrawalHours: 48,
    controlled: true,
    notes: "PSGAG. 48-hour withdrawal for IM administration.",
  },

  // -- Antibiotics (commonly used, generally not controlled) ----------------
  {
    name: "Trimethoprim-Sulfamethoxazole (SMZs)",
    genericName: "Trimethoprim-Sulfamethoxazole",
    category: "Antibiotic",
    routes: [MedicationRoute.ORAL],
    withdrawalHours: 48,
    controlled: false,
    notes: "Common antibiotic. 48-hour withdrawal. Not a controlled substance.",
  },
  {
    name: "Gentamicin",
    genericName: "Gentamicin Sulfate",
    category: "Antibiotic (Aminoglycoside)",
    routes: [MedicationRoute.IV, MedicationRoute.IM, MedicationRoute.INTRA_ARTICULAR],
    withdrawalHours: 48,
    controlled: false,
    notes: "Aminoglycoside antibiotic. 48-hour withdrawal.",
  },
  {
    name: "Penicillin (Procaine Penicillin G)",
    genericName: "Procaine Penicillin G",
    category: "Antibiotic",
    routes: [MedicationRoute.IM],
    withdrawalHours: 48,
    controlled: false,
    notes:
      "Note: Procaine is a controlled substance — procaine metabolite can cause a positive. " +
      "48-hour minimum withdrawal; many trainers use 7+ days.",
  },
  {
    name: "Ceftiofur (Excede / Naxcel)",
    genericName: "Ceftiofur",
    category: "Antibiotic (Cephalosporin)",
    routes: [MedicationRoute.IM],
    withdrawalHours: 48,
    controlled: false,
    notes: "Long-acting cephalosporin. 48-hour withdrawal.",
  },

  // -- Vitamins / Supplements (threshold substances) ------------------------
  {
    name: "Vitamin E / Selenium (E-SE)",
    genericName: "Vitamin E / Sodium Selenite",
    category: "Supplement",
    routes: [MedicationRoute.IM, MedicationRoute.ORAL],
    withdrawalHours: 24,
    controlled: false,
    notes: "Antioxidant supplement. 24-hour withdrawal for injectable form.",
  },
  {
    name: "Methocarbamol (Robaxin)",
    genericName: "Methocarbamol",
    category: "Muscle Relaxant",
    routes: [MedicationRoute.IV, MedicationRoute.ORAL],
    withdrawalHours: 48,
    controlled: true,
    notes: "Centrally-acting muscle relaxant. 48-hour withdrawal.",
  },
] as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Look up a medication by name (case-insensitive partial match).
 */
export function findMedication(query: string): MedicationDefinition | undefined {
  const lower = query.toLowerCase();
  return COMMON_MEDICATIONS.find(
    (m) =>
      m.name.toLowerCase().includes(lower) ||
      m.genericName.toLowerCase().includes(lower),
  );
}

/**
 * Calculate the withdrawal end date given an administration time and
 * withdrawal period in hours.
 */
export function calculateWithdrawalEnd(
  administeredAt: Date,
  withdrawalHours: number,
): Date {
  return new Date(administeredAt.getTime() + withdrawalHours * 60 * 60 * 1000);
}

/**
 * Get remaining withdrawal hours from now. Returns 0 if already clear.
 */
export function getWithdrawalHoursRemaining(withdrawalEndsAt: Date): number {
  const remaining = (withdrawalEndsAt.getTime() - Date.now()) / (60 * 60 * 1000);
  return Math.max(0, Math.round(remaining * 100) / 100);
}
