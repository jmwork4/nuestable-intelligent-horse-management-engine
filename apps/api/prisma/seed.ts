// ─────────────────────────────────────────────────────────────────────────────
// Nuestable — Horse Intelligent Management Engine
// Database Seed Script
// ─────────────────────────────────────────────────────────────────────────────

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ─── Helpers ─────────────────────────────────────────────────────────────────

const now = new Date();

function daysAgo(n: number): Date {
  const d = new Date(now);
  d.setDate(d.getDate() - n);
  return d;
}

function daysFromNow(n: number): Date {
  const d = new Date(now);
  d.setDate(d.getDate() + n);
  return d;
}

function hoursFromNow(n: number): Date {
  const d = new Date(now);
  d.setHours(d.getHours() + n);
  return d;
}

function foalDateForAge(age: number): Date {
  const d = new Date(now);
  d.setFullYear(d.getFullYear() - age);
  d.setMonth(2); // March
  d.setDate(15 + Math.floor(Math.random() * 15));
  return d;
}

function randomTime(date: Date, hour: number): Date {
  const d = new Date(date);
  d.setHours(hour, Math.floor(Math.random() * 60), 0, 0);
  return d;
}

// ─── Main Seed ───────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Seeding Nuestable database...\n");

  // Clean existing data (reverse order of dependencies)
  console.log("  Cleaning existing data...");
  await prisma.alertDeliveryLog.deleteMany();
  await prisma.notificationPref.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.syndicateVoteEntry.deleteMany();
  await prisma.syndicateVote.deleteMany();
  await prisma.message.deleteMany();
  await prisma.messageThread.deleteMany();
  await prisma.payout.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.revenue.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.labResult.deleteMany();
  await prisma.injury.deleteMany();
  await prisma.vaccination.deleteMany();
  await prisma.medicationLog.deleteMany();
  await prisma.healthRecord.deleteMany();
  await prisma.operationLog.deleteMany();
  await prisma.taskAssignment.deleteMany();
  await prisma.therapyLog.deleteMany();
  await prisma.feedLog.deleteMany();
  await prisma.dailyChecklistItem.deleteMany();
  await prisma.dailyChecklist.deleteMany();
  await prisma.document.deleteMany();
  await prisma.tripNote.deleteMany();
  await prisma.raceEntry.deleteMany();
  await prisma.race.deleteMany();
  await prisma.mediaItem.deleteMany();
  await prisma.purchaseSale.deleteMany();
  await prisma.horseOwnership.deleteMany();
  await prisma.horse.deleteMany();
  await prisma.stall.deleteMany();
  await prisma.barn.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  // ── Organization ─────────────────────────────────────────────────────────

  console.log("  Creating organization...");
  const org = await prisma.organization.create({
    data: {
      name: "Emerald Downs Racing Stable",
      slug: "emerald-downs-racing-stable",
      plan: "professional",
    },
  });

  // ── Users ────────────────────────────────────────────────────────────────

  console.log("  Creating users...");
  const passwordHash = await bcrypt.hash("password123", 10);

  const usersData = [
    { firstName: "Michael", lastName: "Torres", email: "michael.torres@emeralddowns.com", role: "ADMIN" as const },
    { firstName: "Sarah", lastName: "Chen", email: "sarah.chen@emeralddowns.com", role: "TRAINER" as const },
    { firstName: "James", lastName: "Rodriguez", email: "james.rodriguez@emeralddowns.com", role: "BARN_MANAGER" as const },
    { firstName: "William", lastName: "Hartfield III", email: "william.hartfield@emeralddowns.com", role: "OWNER" as const },
    { firstName: "Catherine", lastName: "Blackwell", email: "catherine.blackwell@emeralddowns.com", role: "OWNER" as const },
    { firstName: "Robert", lastName: "Kim", email: "robert.kim@emeralddowns.com", role: "OWNER" as const },
    { firstName: "Amanda", lastName: "Foster", email: "amanda.foster@emeralddowns.com", role: "VET" as const },
    { firstName: "Diego", lastName: "Martinez", email: "diego.martinez@emeralddowns.com", role: "GROOM" as const },
    { firstName: "Keisha", lastName: "Washington", email: "keisha.washington@emeralddowns.com", role: "GROOM" as const },
  ];

  const users: Record<string, Awaited<ReturnType<typeof prisma.user.create>>> = {};
  for (const u of usersData) {
    const user = await prisma.user.create({
      data: {
        orgId: org.id,
        email: u.email,
        passwordHash,
        firstName: u.firstName,
        lastName: u.lastName,
        role: u.role,
        phone: `+1${String(Math.floor(2000000000 + Math.random() * 8000000000))}`,
        isActive: true,
      },
    });
    users[`${u.firstName} ${u.lastName}`] = user;
  }

  const admin = users["Michael Torres"]!;
  const trainer = users["Sarah Chen"]!;
  const asstTrainer = users["James Rodriguez"]!;
  const owner1 = users["William Hartfield III"]!;
  const owner2 = users["Catherine Blackwell"]!;
  const owner3 = users["Robert Kim"]!;
  const vet = users["Amanda Foster"]!;
  const staff1 = users["Diego Martinez"]!;
  const staff2 = users["Keisha Washington"]!;

  // ── Barn & Stalls ────────────────────────────────────────────────────────

  console.log("  Creating barn and stalls...");
  const barn = await prisma.barn.create({
    data: {
      orgId: org.id,
      name: "Barn A",
      location: "Main Training Complex",
      capacity: 20,
    },
  });

  const stalls: Awaited<ReturnType<typeof prisma.stall.create>>[] = [];
  for (let i = 1; i <= 20; i++) {
    const stall = await prisma.stall.create({
      data: {
        orgId: org.id,
        barnId: barn.id,
        number: `A${String(i).padStart(2, "0")}`,
        status: i <= 15 ? "OCCUPIED" : "AVAILABLE",
      },
    });
    stalls.push(stall);
  }

  // ── Horses ───────────────────────────────────────────────────────────────

  console.log("  Creating horses...");
  const horsesData = [
    { name: "Midnight Thunder", sex: "STALLION" as const, age: 4, status: "ACTIVE" as const, color: "Bay", sireName: "Storm Cat", damName: "Midnight Whisper", regNum: "KY-2022-001" },
    { name: "Golden Sunrise", sex: "FILLY" as const, age: 3, status: "ACTIVE" as const, color: "Chestnut", sireName: "Goldencents", damName: "Morning Star", regNum: "KY-2023-002" },
    { name: "Iron Legacy", sex: "GELDING" as const, age: 5, status: "ACTIVE" as const, color: "Dark Bay", sireName: "Tapit", damName: "Iron Maiden", regNum: "KY-2021-003" },
    { name: "Sapphire Dream", sex: "MARE" as const, age: 4, status: "ACTIVE" as const, color: "Gray", sireName: "Medaglia d'Oro", damName: "Blue Sapphire", regNum: "KY-2022-004" },
    { name: "Copper Ridge", sex: "COLT" as const, age: 3, status: "ACTIVE" as const, color: "Chestnut", sireName: "Into Mischief", damName: "Copper Queen", regNum: "KY-2023-005" },
    { name: "Shadow Dancer", sex: "FILLY" as const, age: 3, status: "ACTIVE" as const, color: "Black", sireName: "Curlin", damName: "Dark Dancer", regNum: "KY-2023-006" },
    { name: "Silver Streak", sex: "GELDING" as const, age: 6, status: "ACTIVE" as const, color: "Gray", sireName: "Speightstown", damName: "Silver Moon", regNum: "KY-2020-007" },
    { name: "Thunder Bay", sex: "COLT" as const, age: 2, status: "ACTIVE" as const, color: "Bay", sireName: "Gun Runner", damName: "Bay Thunder", regNum: "KY-2024-008" },
    { name: "Rose Garden", sex: "MARE" as const, age: 5, status: "LAYUP" as const, color: "Chestnut", sireName: "American Pharoah", damName: "Wild Rose", regNum: "KY-2021-009" },
    { name: "King's Ransom", sex: "STALLION" as const, age: 4, status: "ACTIVE" as const, color: "Dark Bay", sireName: "Quality Road", damName: "Royal Queen", regNum: "KY-2022-010" },
    { name: "Desert Wind", sex: "GELDING" as const, age: 4, status: "ACTIVE" as const, color: "Bay", sireName: "Nyquist", damName: "Sahara Wind", regNum: "KY-2022-011" },
    { name: "Lucky Charm", sex: "FILLY" as const, age: 3, status: "ACTIVE" as const, color: "Chestnut", sireName: "Justify", damName: "Four Leaf", regNum: "KY-2023-012" },
    { name: "Pacific Storm", sex: "COLT" as const, age: 3, status: "ACTIVE" as const, color: "Gray", sireName: "Arrogate", damName: "Pacific Blue", regNum: "KY-2023-013" },
    { name: "Velvet Touch", sex: "MARE" as const, age: 6, status: "RETIRED" as const, color: "Bay", sireName: "Uncle Mo", damName: "Silk Touch", regNum: "KY-2020-014" },
    { name: "Blazing Trail", sex: "GELDING" as const, age: 4, status: "ACTIVE" as const, color: "Chestnut", sireName: "Flightline", damName: "Trail Blazer", regNum: "KY-2022-015" },
  ];

  const horses: Awaited<ReturnType<typeof prisma.horse.create>>[] = [];
  for (let i = 0; i < horsesData.length; i++) {
    const h = horsesData[i]!;
    const horse = await prisma.horse.create({
      data: {
        orgId: org.id,
        name: h.name,
        registeredName: h.name,
        foalDate: foalDateForAge(h.age),
        sex: h.sex,
        color: h.color,
        sireName: h.sireName,
        damName: h.damName,
        registrationNum: h.regNum,
        chipNumber: `985${String(100000000 + Math.floor(Math.random() * 900000000))}`,
        status: h.status,
        currentBarnId: barn.id,
        currentStallId: stalls[i]!.id,
      },
    });
    horses.push(horse);
  }

  // ── Horse Ownerships ─────────────────────────────────────────────────────

  console.log("  Creating ownership records...");

  // Horses 1-5 (indices 0-4): 100% William Hartfield III
  for (let i = 0; i < 5; i++) {
    await prisma.horseOwnership.create({
      data: {
        orgId: org.id,
        horseId: horses[i]!.id,
        userId: owner1.id,
        ownerName: "William Hartfield III",
        ownershipPct: 100,
        startDate: daysAgo(365),
      },
    });
  }

  // Horses 6-8 (indices 5-7): 60% Catherine Blackwell, 40% Robert Kim
  for (let i = 5; i < 8; i++) {
    await prisma.horseOwnership.create({
      data: {
        orgId: org.id,
        horseId: horses[i]!.id,
        userId: owner2.id,
        ownerName: "Catherine Blackwell",
        ownershipPct: 60,
        startDate: daysAgo(300),
      },
    });
    await prisma.horseOwnership.create({
      data: {
        orgId: org.id,
        horseId: horses[i]!.id,
        userId: owner3.id,
        ownerName: "Robert Kim",
        ownershipPct: 40,
        startDate: daysAgo(300),
      },
    });
  }

  // Horses 9-11 (indices 8-10): 50% William Hartfield III, 50% Catherine Blackwell
  for (let i = 8; i < 11; i++) {
    await prisma.horseOwnership.create({
      data: {
        orgId: org.id,
        horseId: horses[i]!.id,
        userId: owner1.id,
        ownerName: "William Hartfield III",
        ownershipPct: 50,
        startDate: daysAgo(200),
      },
    });
    await prisma.horseOwnership.create({
      data: {
        orgId: org.id,
        horseId: horses[i]!.id,
        userId: owner2.id,
        ownerName: "Catherine Blackwell",
        ownershipPct: 50,
        startDate: daysAgo(200),
      },
    });
  }

  // Horses 12-15 (indices 11-14): 100% Robert Kim
  for (let i = 11; i < 15; i++) {
    await prisma.horseOwnership.create({
      data: {
        orgId: org.id,
        horseId: horses[i]!.id,
        userId: owner3.id,
        ownerName: "Robert Kim",
        ownershipPct: 100,
        startDate: daysAgo(180),
      },
    });
  }

  // ── Races ────────────────────────────────────────────────────────────────

  console.log("  Creating races...");

  const racesData = [
    // Past races (OFFICIAL)
    { trackName: "Gulfstream Park", trackCode: "GP", raceDate: daysAgo(42), postTime: randomTime(daysAgo(42), 14), raceNumber: 6, raceName: "Gulfstream Park Allowance", raceType: "ALLOWANCE" as const, surface: "DIRT" as const, distance: "1 1/16 miles", distanceFurlongs: 8.5, purse: 75000, status: "OFFICIAL" as const, isStakes: false },
    { trackName: "Keeneland", trackCode: "KEE", raceDate: daysAgo(35), postTime: randomTime(daysAgo(35), 15), raceNumber: 4, raceName: "Keeneland Maiden Special Weight", raceType: "MAIDEN" as const, surface: "TURF" as const, distance: "1 mile", distanceFurlongs: 8.0, purse: 60000, status: "OFFICIAL" as const, isStakes: false },
    { trackName: "Santa Anita", trackCode: "SA", raceDate: daysAgo(28), postTime: randomTime(daysAgo(28), 16), raceNumber: 8, raceName: "San Gabriel Stakes", raceType: "GRADED_STAKES" as const, surface: "TURF" as const, distance: "1 1/8 miles", distanceFurlongs: 9.0, purse: 200000, status: "OFFICIAL" as const, isStakes: true, stakesGrade: "G2" },
    { trackName: "Churchill Downs", trackCode: "CD", raceDate: daysAgo(21), postTime: randomTime(daysAgo(21), 13), raceNumber: 3, raceName: "Churchill Downs Claiming", raceType: "CLAIMING" as const, surface: "DIRT" as const, distance: "6 furlongs", distanceFurlongs: 6.0, purse: 35000, claimingPrice: 25000, status: "OFFICIAL" as const, isStakes: false },
    { trackName: "Gulfstream Park", trackCode: "GP", raceDate: daysAgo(14), postTime: randomTime(daysAgo(14), 14), raceNumber: 7, raceName: "Gulfstream Park Handicap", raceType: "HANDICAP" as const, surface: "DIRT" as const, distance: "7 furlongs", distanceFurlongs: 7.0, purse: 100000, status: "OFFICIAL" as const, isStakes: false },
    { trackName: "Saratoga", trackCode: "SAR", raceDate: daysAgo(10), postTime: randomTime(daysAgo(10), 15), raceNumber: 5, raceName: "Saratoga Maiden Special Weight", raceType: "MAIDEN" as const, surface: "DIRT" as const, distance: "6 1/2 furlongs", distanceFurlongs: 6.5, purse: 55000, status: "OFFICIAL" as const, isStakes: false },
    { trackName: "Santa Anita", trackCode: "SA", raceDate: daysAgo(7), postTime: randomTime(daysAgo(7), 16), raceNumber: 9, raceName: "Santa Anita Allowance Optional Claiming", raceType: "OPTIONAL_CLAIMING" as const, surface: "DIRT" as const, distance: "1 mile", distanceFurlongs: 8.0, purse: 85000, claimingPrice: 62500, status: "OFFICIAL" as const, isStakes: false },
    { trackName: "Keeneland", trackCode: "KEE", raceDate: daysAgo(3), postTime: randomTime(daysAgo(3), 14), raceNumber: 10, raceName: "Blue Grass Prep Stakes", raceType: "STAKES" as const, surface: "DIRT" as const, distance: "1 1/8 miles", distanceFurlongs: 9.0, purse: 300000, status: "OFFICIAL" as const, isStakes: true },
    // Past race - scratched entry
    { trackName: "Churchill Downs", trackCode: "CD", raceDate: daysAgo(5), postTime: randomTime(daysAgo(5), 15), raceNumber: 6, raceName: "Churchill Downs Starter Allowance", raceType: "STARTER_ALLOWANCE" as const, surface: "DIRT" as const, distance: "1 mile", distanceFurlongs: 8.0, purse: 50000, status: "OFFICIAL" as const, isStakes: false },
    { trackName: "Gulfstream Park", trackCode: "GP", raceDate: daysAgo(2), postTime: randomTime(daysAgo(2), 13), raceNumber: 2, raceName: "Gulfstream Park Maiden Claiming", raceType: "MAIDEN_CLAIMING" as const, surface: "TURF" as const, distance: "1 mile", distanceFurlongs: 8.0, purse: 28000, claimingPrice: 20000, status: "OFFICIAL" as const, isStakes: false },
    // Upcoming races
    { trackName: "Santa Anita", trackCode: "SA", raceDate: daysFromNow(4), postTime: randomTime(daysFromNow(4), 16), raceNumber: 7, raceName: "Santa Anita Derby Prep", raceType: "STAKES" as const, surface: "DIRT" as const, distance: "1 1/16 miles", distanceFurlongs: 8.5, purse: 200000, status: "ENTRIES_OPEN" as const, isStakes: true, entryDeadline: daysFromNow(2) },
    { trackName: "Keeneland", trackCode: "KEE", raceDate: daysFromNow(7), postTime: randomTime(daysFromNow(7), 14), raceNumber: 5, raceName: "Keeneland Allowance", raceType: "ALLOWANCE" as const, surface: "TURF" as const, distance: "1 mile", distanceFurlongs: 8.0, purse: 75000, status: "ENTRIES_OPEN" as const, isStakes: false, entryDeadline: daysFromNow(5) },
    { trackName: "Churchill Downs", trackCode: "CD", raceDate: daysFromNow(10), postTime: randomTime(daysFromNow(10), 13), raceNumber: 8, raceName: "Kentucky Derby Presented by Woodford Reserve", raceType: "GRADED_STAKES" as const, surface: "DIRT" as const, distance: "1 1/4 miles", distanceFurlongs: 10.0, purse: 500000, status: "SCHEDULED" as const, isStakes: true, stakesGrade: "G1", entryDeadline: daysFromNow(7) },
    { trackName: "Saratoga", trackCode: "SAR", raceDate: daysFromNow(14), postTime: randomTime(daysFromNow(14), 15), raceNumber: 4, raceName: "Saratoga Claiming", raceType: "CLAIMING" as const, surface: "DIRT" as const, distance: "6 furlongs", distanceFurlongs: 6.0, purse: 40000, claimingPrice: 30000, status: "SCHEDULED" as const, isStakes: false, entryDeadline: daysFromNow(12) },
    { trackName: "Gulfstream Park", trackCode: "GP", raceDate: daysFromNow(18), postTime: randomTime(daysFromNow(18), 14), raceNumber: 6, raceName: "Gulfstream Park Maiden Special Weight", raceType: "MAIDEN" as const, surface: "DIRT" as const, distance: "7 furlongs", distanceFurlongs: 7.0, purse: 60000, status: "SCHEDULED" as const, isStakes: false, entryDeadline: daysFromNow(16) },
    { trackName: "Santa Anita", trackCode: "SA", raceDate: daysFromNow(21), postTime: randomTime(daysFromNow(21), 16), raceNumber: 10, raceName: "Gold Cup at Santa Anita", raceType: "GRADED_STAKES" as const, surface: "DIRT" as const, distance: "1 1/4 miles", distanceFurlongs: 10.0, purse: 400000, status: "SCHEDULED" as const, isStakes: true, stakesGrade: "G1", entryDeadline: daysFromNow(18) },
    { trackName: "Keeneland", trackCode: "KEE", raceDate: daysFromNow(25), postTime: randomTime(daysFromNow(25), 15), raceNumber: 3, raceName: "Keeneland Maiden Claiming", raceType: "MAIDEN_CLAIMING" as const, surface: "TURF" as const, distance: "1 mile", distanceFurlongs: 8.0, purse: 30000, claimingPrice: 20000, status: "SCHEDULED" as const, isStakes: false, entryDeadline: daysFromNow(23) },
    { trackName: "Churchill Downs", trackCode: "CD", raceDate: daysFromNow(30), postTime: randomTime(daysFromNow(30), 14), raceNumber: 9, raceName: "Stephen Foster Stakes", raceType: "GRADED_STAKES" as const, surface: "DIRT" as const, distance: "1 1/8 miles", distanceFurlongs: 9.0, purse: 350000, status: "SCHEDULED" as const, isStakes: true, stakesGrade: "G2", entryDeadline: daysFromNow(27) },
    { trackName: "Saratoga", trackCode: "SAR", raceDate: daysFromNow(35), postTime: randomTime(daysFromNow(35), 15), raceNumber: 7, raceName: "Saratoga Allowance Optional Claiming", raceType: "OPTIONAL_CLAIMING" as const, surface: "TURF" as const, distance: "1 1/16 miles", distanceFurlongs: 8.5, purse: 90000, claimingPrice: 75000, status: "SCHEDULED" as const, isStakes: false, entryDeadline: daysFromNow(33) },
    { trackName: "Santa Anita", trackCode: "SA", raceDate: daysFromNow(40), postTime: randomTime(daysFromNow(40), 16), raceNumber: 5, raceName: "Santa Anita Handicap", raceType: "HANDICAP" as const, surface: "DIRT" as const, distance: "1 1/4 miles", distanceFurlongs: 10.0, purse: 250000, status: "SCHEDULED" as const, isStakes: false, entryDeadline: daysFromNow(38) },
  ];

  const races: Awaited<ReturnType<typeof prisma.race.create>>[] = [];
  for (const r of racesData) {
    const race = await prisma.race.create({
      data: {
        orgId: org.id,
        trackName: r.trackName,
        trackCode: r.trackCode,
        raceDate: r.raceDate,
        postTime: r.postTime,
        raceNumber: r.raceNumber,
        raceName: r.raceName,
        raceType: r.raceType,
        surface: r.surface,
        distance: r.distance,
        distanceFurlongs: r.distanceFurlongs,
        purse: r.purse,
        claimingPrice: r.claimingPrice ?? null,
        conditions: `${r.raceType === "MAIDEN" ? "For maidens" : r.raceType === "CLAIMING" ? `Claiming price $${(r.claimingPrice ?? 0).toLocaleString()}` : r.raceType === "ALLOWANCE" ? "For non-winners of two races" : `${r.raceName} conditions`}. ${r.distance} on the ${r.surface?.toLowerCase()}.`,
        status: r.status,
        isStakes: r.isStakes,
        stakesGrade: r.stakesGrade ?? null,
        entryDeadline: r.entryDeadline ?? null,
      },
    });
    races.push(race);
  }

  // ── Race Entries (past races with results) ───────────────────────────────

  console.log("  Creating race entries and results...");

  const jockeys = ["John Velazquez", "Irad Ortiz Jr.", "Joel Rosario", "Flavien Prat", "Tyler Gaffalione", "Luis Saez", "Jose Ortiz", "Javier Castellano"];

  interface EntryData {
    raceIdx: number;
    horseIdx: number;
    postPosition: number;
    jockey: string;
    finishPosition: number | null;
    officialTime: string | null;
    margin: string | null;
    speedFigure: number | null;
    purseEarned: number | null;
    status: "FINISHED" | "SCRATCHED" | "ENTERED" | "CONFIRMED";
    scratchReason?: string;
  }

  const entriesData: EntryData[] = [
    // Race 0: Gulfstream Allowance - Midnight Thunder wins
    { raceIdx: 0, horseIdx: 0, postPosition: 3, jockey: jockeys[0]!, finishPosition: 1, officialTime: "1:43.21", margin: "2 lengths", speedFigure: 92, purseEarned: 45000, status: "FINISHED" },
    { raceIdx: 0, horseIdx: 2, postPosition: 5, jockey: jockeys[1]!, finishPosition: 2, officialTime: "1:43.55", margin: "head", speedFigure: 89, purseEarned: 15000, status: "FINISHED" },
    { raceIdx: 0, horseIdx: 10, postPosition: 1, jockey: jockeys[2]!, finishPosition: 4, officialTime: "1:44.10", margin: "3 lengths", speedFigure: 84, purseEarned: 3750, status: "FINISHED" },

    // Race 1: Keeneland Maiden - Golden Sunrise wins
    { raceIdx: 1, horseIdx: 1, postPosition: 4, jockey: jockeys[3]!, finishPosition: 1, officialTime: "1:36.82", margin: "1 1/2 lengths", speedFigure: 86, purseEarned: 36000, status: "FINISHED" },
    { raceIdx: 1, horseIdx: 11, postPosition: 2, jockey: jockeys[4]!, finishPosition: 3, officialTime: "1:37.30", margin: "2 lengths", speedFigure: 80, purseEarned: 6600, status: "FINISHED" },

    // Race 2: San Gabriel Stakes G2 - Iron Legacy 2nd
    { raceIdx: 2, horseIdx: 2, postPosition: 6, jockey: jockeys[1]!, finishPosition: 2, officialTime: "1:48.15", margin: "neck", speedFigure: 96, purseEarned: 40000, status: "FINISHED" },
    { raceIdx: 2, horseIdx: 9, postPosition: 3, jockey: jockeys[5]!, finishPosition: 4, officialTime: "1:48.90", margin: "3 lengths", speedFigure: 91, purseEarned: 10000, status: "FINISHED" },

    // Race 3: Churchill Claiming - Silver Streak 1st
    { raceIdx: 3, horseIdx: 6, postPosition: 2, jockey: jockeys[6]!, finishPosition: 1, officialTime: "1:10.44", margin: "3 1/2 lengths", speedFigure: 85, purseEarned: 21000, status: "FINISHED" },
    { raceIdx: 3, horseIdx: 14, postPosition: 7, jockey: jockeys[7]!, finishPosition: 3, officialTime: "1:11.02", margin: "1 length", speedFigure: 80, purseEarned: 3850, status: "FINISHED" },

    // Race 4: Gulfstream Handicap - Blazing Trail 1st, Sapphire Dream 2nd
    { raceIdx: 4, horseIdx: 14, postPosition: 4, jockey: jockeys[0]!, finishPosition: 1, officialTime: "1:22.67", margin: "1 length", speedFigure: 94, purseEarned: 60000, status: "FINISHED" },
    { raceIdx: 4, horseIdx: 3, postPosition: 1, jockey: jockeys[3]!, finishPosition: 2, officialTime: "1:22.83", margin: "2 lengths", speedFigure: 91, purseEarned: 20000, status: "FINISHED" },
    { raceIdx: 4, horseIdx: 0, postPosition: 6, jockey: jockeys[1]!, finishPosition: 3, officialTime: "1:23.10", margin: "1/2 length", speedFigure: 89, purseEarned: 10000, status: "FINISHED" },

    // Race 5: Saratoga Maiden - Shadow Dancer wins
    { raceIdx: 5, horseIdx: 5, postPosition: 3, jockey: jockeys[4]!, finishPosition: 1, officialTime: "1:17.45", margin: "4 lengths", speedFigure: 88, purseEarned: 33000, status: "FINISHED" },
    { raceIdx: 5, horseIdx: 7, postPosition: 5, jockey: jockeys[2]!, finishPosition: 2, officialTime: "1:18.12", margin: "1 length", speedFigure: 82, purseEarned: 11000, status: "FINISHED" },
    { raceIdx: 5, horseIdx: 12, postPosition: 1, jockey: jockeys[6]!, finishPosition: 5, officialTime: "1:19.01", margin: "6 lengths", speedFigure: 74, purseEarned: 1650, status: "FINISHED" },

    // Race 6: Santa Anita AOC - King's Ransom 1st
    { raceIdx: 6, horseIdx: 9, postPosition: 2, jockey: jockeys[5]!, finishPosition: 1, officialTime: "1:35.92", margin: "2 1/2 lengths", speedFigure: 95, purseEarned: 51000, status: "FINISHED" },
    { raceIdx: 6, horseIdx: 10, postPosition: 5, jockey: jockeys[7]!, finishPosition: 3, officialTime: "1:36.55", margin: "2 lengths", speedFigure: 88, purseEarned: 9350, status: "FINISHED" },

    // Race 7: Blue Grass Prep - Copper Ridge 2nd, Midnight Thunder 1st
    { raceIdx: 7, horseIdx: 0, postPosition: 5, jockey: jockeys[0]!, finishPosition: 1, officialTime: "1:49.33", margin: "3/4 length", speedFigure: 98, purseEarned: 180000, status: "FINISHED" },
    { raceIdx: 7, horseIdx: 4, postPosition: 3, jockey: jockeys[3]!, finishPosition: 2, officialTime: "1:49.46", margin: "1 1/2 lengths", speedFigure: 95, purseEarned: 60000, status: "FINISHED" },
    { raceIdx: 7, horseIdx: 12, postPosition: 7, jockey: jockeys[6]!, finishPosition: 5, officialTime: "1:50.20", margin: "4 lengths", speedFigure: 85, purseEarned: 9000, status: "FINISHED" },

    // Race 8: Churchill Starter Allowance - with a scratch
    { raceIdx: 8, horseIdx: 6, postPosition: 4, jockey: jockeys[1]!, finishPosition: 2, officialTime: "1:36.80", margin: "1 length", speedFigure: 83, purseEarned: 10000, status: "FINISHED" },
    { raceIdx: 8, horseIdx: 3, postPosition: 2, jockey: jockeys[3]!, finishPosition: null, officialTime: null, margin: null, speedFigure: null, purseEarned: null, status: "SCRATCHED", scratchReason: "Trainer decision - track condition" },

    // Race 9: Gulfstream Maiden Claiming - Lucky Charm 1st
    { raceIdx: 9, horseIdx: 11, postPosition: 3, jockey: jockeys[4]!, finishPosition: 1, officialTime: "1:37.50", margin: "5 lengths", speedFigure: 78, purseEarned: 16800, status: "FINISHED" },

    // Upcoming race entries
    { raceIdx: 10, horseIdx: 0, postPosition: 4, jockey: jockeys[0]!, finishPosition: null, officialTime: null, margin: null, speedFigure: null, purseEarned: null, status: "ENTERED" },
    { raceIdx: 10, horseIdx: 4, postPosition: 2, jockey: jockeys[3]!, finishPosition: null, officialTime: null, margin: null, speedFigure: null, purseEarned: null, status: "ENTERED" },
    { raceIdx: 10, horseIdx: 9, postPosition: 6, jockey: jockeys[5]!, finishPosition: null, officialTime: null, margin: null, speedFigure: null, purseEarned: null, status: "CONFIRMED" },

    { raceIdx: 11, horseIdx: 3, postPosition: 3, jockey: jockeys[3]!, finishPosition: null, officialTime: null, margin: null, speedFigure: null, purseEarned: null, status: "ENTERED" },
    { raceIdx: 11, horseIdx: 10, postPosition: 5, jockey: jockeys[7]!, finishPosition: null, officialTime: null, margin: null, speedFigure: null, purseEarned: null, status: "ENTERED" },
    { raceIdx: 11, horseIdx: 14, postPosition: 1, jockey: jockeys[0]!, finishPosition: null, officialTime: null, margin: null, speedFigure: null, purseEarned: null, status: "ENTERED" },
  ];

  for (const e of entriesData) {
    await prisma.raceEntry.create({
      data: {
        orgId: org.id,
        raceId: races[e.raceIdx]!.id,
        horseId: horses[e.horseIdx]!.id,
        postPosition: e.postPosition,
        morningLineOdds: `${Math.floor(2 + Math.random() * 15)}-1`,
        jockeyName: e.jockey,
        weight: `${118 + Math.floor(Math.random() * 8)}`,
        finishPosition: e.finishPosition,
        officialTime: e.officialTime,
        margin: e.margin,
        speedFigure: e.speedFigure,
        purseEarned: e.purseEarned,
        status: e.status,
        scratchReason: e.scratchReason ?? null,
      },
    });
  }

  // ── Health Records ───────────────────────────────────────────────────────

  console.log("  Creating health records...");

  // General vet exams for various horses
  const healthRecordsData = [
    { horseIdx: 0, date: daysAgo(60), type: "EXAM" as const, description: "Pre-season wellness exam", vetName: "Dr. Amanda Foster", findings: "Sound, good body condition score 5/9. Heart rate 32bpm, resp 12. No abnormalities noted.", treatment: "None required", followUpDate: daysFromNow(120) },
    { horseIdx: 1, date: daysAgo(45), type: "EXAM" as const, description: "Pre-race physical exam", vetName: "Dr. Amanda Foster", findings: "Fit and ready to race. All vitals normal. Gait analysis shows no lameness.", treatment: "Cleared for racing", followUpDate: null },
    { horseIdx: 2, date: daysAgo(30), type: "DENTAL" as const, description: "Annual dental float", vetName: "Dr. Amanda Foster", findings: "Sharp enamel points on upper molars. Minor wave in lower arcade.", treatment: "Full dental float performed. Smoothed enamel points and corrected wave.", followUpDate: daysFromNow(335) },
    { horseIdx: 3, date: daysAgo(50), type: "FARRIER" as const, description: "Regular shoeing - all fours", vetName: null, findings: "Good hoof quality. Slight medial flare on left front corrected.", treatment: "Full set of aluminum racing plates. Corrective trim on LF.", followUpDate: daysFromNow(5) },
    { horseIdx: 4, date: daysAgo(20), type: "EXAM" as const, description: "Post-workout evaluation", vetName: "Dr. Amanda Foster", findings: "Mild heat in right front ankle post-breeze. No lameness at jog.", treatment: "Cold therapy and poultice. Recheck in 48 hours.", followUpDate: daysAgo(18) },
    { horseIdx: 5, date: daysAgo(15), type: "SCOPE" as const, description: "Upper airway endoscopy", vetName: "Dr. Amanda Foster", findings: "Grade I laryngeal hemiplegia (left side). Dynamic pharyngeal collapse not observed.", treatment: "No treatment necessary at this time. Monitor during exercise.", followUpDate: daysFromNow(165) },
    { horseIdx: 6, date: daysAgo(40), type: "BLOODWORK" as const, description: "Pre-race blood panel", vetName: "Dr. Amanda Foster", findings: "CBC and chemistry within normal limits. PCV 42%, TP 6.8.", treatment: "No action required. Horse in good metabolic condition.", followUpDate: null },
    { horseIdx: 7, date: daysAgo(25), type: "IMAGING" as const, description: "Right front fetlock radiographs", vetName: "Dr. Amanda Foster", findings: "No significant radiographic abnormalities. Clean joint margins. No chip fragments.", treatment: "No treatment needed. Continue training program.", followUpDate: null },
    { horseIdx: 8, date: daysAgo(14), type: "EXAM" as const, description: "Lameness evaluation - left hind", vetName: "Dr. Amanda Foster", findings: "Grade 2/5 lameness on left hind. Positive to hock flexion. Ultrasound reveals mild suspensory branch desmitis.", treatment: "Stall rest, controlled hand-walking. PRP injection scheduled. Placed on layup program.", followUpDate: daysFromNow(60) },
    { horseIdx: 9, date: daysAgo(55), type: "CHIROPRACTIC" as const, description: "Routine chiropractic adjustment", vetName: "Dr. Sarah Mitchell, DC", findings: "Mild restrictions at T14-T16 and L2. Poll slightly rotated right.", treatment: "Full spinal adjustment performed. All restrictions resolved.", followUpDate: daysFromNow(25) },
    { horseIdx: 10, date: daysAgo(35), type: "FARRIER" as const, description: "Regular shoeing", vetName: null, findings: "Normal hoof growth. Good angle alignment.", treatment: "Reset front shoes, trimmed hinds. Applied hoof hardener.", followUpDate: daysFromNow(7) },
    { horseIdx: 11, date: daysAgo(22), type: "EXAM" as const, description: "Pre-race physical", vetName: "Dr. Amanda Foster", findings: "Sound at jog. Good body condition. Alert and bright. Cleared for entry.", treatment: "None required", followUpDate: null },
    { horseIdx: 12, date: daysAgo(18), type: "DEWORMING" as const, description: "Routine deworming", vetName: "Dr. Amanda Foster", findings: "Fecal egg count was 250 EPG prior to treatment.", treatment: "Administered ivermectin (Eqvalan) 1.87% oral paste, weight-appropriate dose.", followUpDate: daysFromNow(162) },
    { horseIdx: 13, date: daysAgo(90), type: "EXAM" as const, description: "Retirement soundness evaluation", vetName: "Dr. Amanda Foster", findings: "Chronic bilateral forelimb arthritic changes. Grade 2/5 lameness at trot on hard surface. Good overall health otherwise.", treatment: "Joint supplements recommended. Turnout program. No further racing recommended.", followUpDate: daysFromNow(90) },
    { horseIdx: 14, date: daysAgo(12), type: "ACUPUNCTURE" as const, description: "Performance acupuncture session", vetName: "Dr. Lisa Yang, TCVM", findings: "Qi stagnation in hindquarters. Sensitivity at BL18, BL23.", treatment: "Dry needle acupuncture at 12 points. Good response to treatment.", followUpDate: daysFromNow(16) },
  ];

  for (const hr of healthRecordsData) {
    await prisma.healthRecord.create({
      data: {
        orgId: org.id,
        horseId: horses[hr.horseIdx]!.id,
        date: hr.date,
        type: hr.type,
        description: hr.description,
        vetName: hr.vetName,
        findings: hr.findings,
        treatment: hr.treatment,
        followUpDate: hr.followUpDate,
        attachmentUrls: [],
      },
    });
  }

  // ── Medications ──────────────────────────────────────────────────────────

  console.log("  Creating medication logs...");

  const medsData = [
    { horseIdx: 0, name: "Phenylbutazone (Bute)", dosage: "2g", route: "Oral", administeredAt: daysAgo(5), withdrawalHours: 168, isControlled: false, notes: "Post-race anti-inflammatory" },
    { horseIdx: 2, name: "Furosemide (Lasix)", dosage: "250mg", route: "IV", administeredAt: daysAgo(28), withdrawalHours: 24, isControlled: false, notes: "Pre-race administration per EIPH protocol" },
    { horseIdx: 3, name: "Flunixin Meglumine (Banamine)", dosage: "500mg", route: "IV", administeredAt: daysAgo(6), withdrawalHours: 168, isControlled: false, notes: "Anti-inflammatory for mild colic episode" },
    { horseIdx: 4, name: "Phenylbutazone (Bute)", dosage: "1g", route: "Oral", administeredAt: daysAgo(18), withdrawalHours: 168, isControlled: false, notes: "Post-workout ankle soreness" },
    { horseIdx: 5, name: "Omeprazole (GastroGard)", dosage: "2.28g", route: "Oral", administeredAt: daysAgo(1), withdrawalHours: 0, isControlled: false, notes: "Ulcer prevention - daily maintenance" },
    { horseIdx: 6, name: "Furosemide (Lasix)", dosage: "250mg", route: "IV", administeredAt: daysAgo(5), withdrawalHours: 24, isControlled: false, notes: "Pre-race EIPH protocol" },
    { horseIdx: 8, name: "Adequan (PSGAG)", dosage: "500mg", route: "IM", administeredAt: daysAgo(7), withdrawalHours: 0, isControlled: false, notes: "Joint therapy - loading dose 3 of 7" },
    { horseIdx: 8, name: "Phenylbutazone (Bute)", dosage: "2g", route: "Oral", administeredAt: daysAgo(1), withdrawalHours: 168, isControlled: false, notes: "Pain management for suspensory injury" },
    // Active withdrawal period medication
    { horseIdx: 0, name: "Dexamethasone", dosage: "10mg", route: "IA (intra-articular)", administeredAt: daysAgo(2), withdrawalHours: 336, isControlled: true, notes: "Left front fetlock joint injection - 14 day withdrawal" },
    { horseIdx: 14, name: "Methocarbamol (Robaxin)", dosage: "5g", route: "IV", administeredAt: daysAgo(3), withdrawalHours: 168, isControlled: false, notes: "Muscle relaxant post-race" },
  ];

  for (const m of medsData) {
    const adminAt = m.administeredAt;
    const withdrawalEnds = m.withdrawalHours > 0 ? new Date(adminAt.getTime() + m.withdrawalHours * 60 * 60 * 1000) : null;
    await prisma.medicationLog.create({
      data: {
        orgId: org.id,
        horseId: horses[m.horseIdx]!.id,
        medicationName: m.name,
        dosage: m.dosage,
        route: m.route,
        administeredAt: adminAt,
        administeredById: vet.id,
        withdrawalHours: m.withdrawalHours,
        withdrawalEndsAt: withdrawalEnds,
        isControlled: m.isControlled,
        notes: m.notes,
      },
    });
  }

  // ── Vaccinations ─────────────────────────────────────────────────────────

  console.log("  Creating vaccination records...");

  const vaccines = ["Eastern/Western Encephalomyelitis", "West Nile Virus", "Tetanus", "Influenza", "Rhinopneumonitis (EHV-1/4)", "Rabies", "Strangles"];

  for (let i = 0; i < horses.length; i++) {
    // Each horse gets core vaccines
    for (const vaccine of vaccines.slice(0, 4)) {
      await prisma.vaccination.create({
        data: {
          orgId: org.id,
          horseId: horses[i]!.id,
          vaccine,
          batchNumber: `VAX${String(2025 + Math.floor(Math.random() * 2))}-${String(Math.floor(1000 + Math.random() * 9000))}`,
          givenDate: daysAgo(120 + Math.floor(Math.random() * 60)),
          expiresAt: daysFromNow(180 + Math.floor(Math.random() * 60)),
          vetName: "Dr. Amanda Foster",
        },
      });
    }
  }

  // ── Injury (Rose Garden) ─────────────────────────────────────────────────

  console.log("  Creating injury record for Rose Garden...");
  await prisma.injury.create({
    data: {
      orgId: org.id,
      horseId: horses[8]!.id, // Rose Garden
      description: "Left hind suspensory branch desmitis",
      location: "Left hind - proximal suspensory branch",
      severity: "MODERATE",
      dateOccurred: daysAgo(14),
      status: "ACTIVE",
      treatmentPlan: "Phase 1 (Weeks 1-4): Stall rest with controlled hand-walking 15 min 2x daily. PRP injection at 2-week mark.\nPhase 2 (Weeks 5-8): Gradual increase to 30 min hand-walking, begin water treadmill.\nPhase 3 (Weeks 9-12): Begin turnout in small paddock, light under-tack jogging.\nPhase 4 (Weeks 13-16): Resume training if ultrasound shows healing.\nExpected return: 4-6 months.",
      notes: "Injury discovered during routine post-workout evaluation. Ultrasound confirmed mild to moderate fiber disruption in the medial branch of the suspensory ligament. PRP therapy initiated. Prognosis for return to racing is favorable with proper rehabilitation.",
    },
  });

  // ── Documents ────────────────────────────────────────────────────────────

  console.log("  Creating documents...");

  // Coggins tests - some expiring soon
  for (let i = 0; i < horses.length; i++) {
    const isExpiringSoon = i === 2 || i === 7; // Iron Legacy and Thunder Bay expire soon
    const expiresAt = isExpiringSoon ? daysFromNow(10 + i) : daysFromNow(180 + Math.floor(Math.random() * 180));

    await prisma.document.create({
      data: {
        orgId: org.id,
        horseId: horses[i]!.id,
        title: `Coggins Test - ${horses[i]!.name}`,
        category: "COGGINS",
        fileUrl: `/documents/coggins/${horses[i]!.id}.pdf`,
        fileSize: 150000 + Math.floor(Math.random() * 100000),
        mimeType: "application/pdf",
        expiresAt,
        status: "COMPLETED",
        uploadedById: vet.id,
      },
    });
  }

  // Registration certificates
  for (let i = 0; i < horses.length; i++) {
    await prisma.document.create({
      data: {
        orgId: org.id,
        horseId: horses[i]!.id,
        title: `Jockey Club Registration - ${horses[i]!.name}`,
        category: "REGISTRATION",
        fileUrl: `/documents/registration/${horses[i]!.id}.pdf`,
        fileSize: 200000 + Math.floor(Math.random() * 150000),
        mimeType: "application/pdf",
        status: "COMPLETED",
        uploadedById: admin.id,
      },
    });
  }

  // Insurance policies
  const insuredHorses = [0, 2, 3, 6, 8, 9, 13]; // High-value or at-risk horses
  for (const idx of insuredHorses) {
    await prisma.document.create({
      data: {
        orgId: org.id,
        horseId: horses[idx]!.id,
        title: `Mortality & Loss of Use Insurance - ${horses[idx]!.name}`,
        category: "INSURANCE",
        fileUrl: `/documents/insurance/${horses[idx]!.id}.pdf`,
        fileSize: 350000 + Math.floor(Math.random() * 200000),
        mimeType: "application/pdf",
        expiresAt: daysFromNow(90 + Math.floor(Math.random() * 270)),
        status: "COMPLETED",
        uploadedById: admin.id,
      },
    });
  }

  // Health certificates
  for (const idx of [0, 1, 4, 5, 9]) {
    await prisma.document.create({
      data: {
        orgId: org.id,
        horseId: horses[idx]!.id,
        title: `Health Certificate - ${horses[idx]!.name}`,
        category: "HEALTH_CERTIFICATE",
        fileUrl: `/documents/health-cert/${horses[idx]!.id}.pdf`,
        fileSize: 120000 + Math.floor(Math.random() * 80000),
        mimeType: "application/pdf",
        expiresAt: daysFromNow(20 + Math.floor(Math.random() * 10)),
        status: "COMPLETED",
        uploadedById: vet.id,
      },
    });
  }

  // ── Expenses ─────────────────────────────────────────────────────────────

  console.log("  Creating expenses...");

  const expensesData = [
    // Training fees (monthly per horse)
    ...Array.from({ length: 15 }, (_, i) => ({ horseIdx: i, category: "TRAINING" as const, description: `Monthly training fee - ${horsesData[i]!.name}`, amount: 3500, date: daysAgo(15), vendorName: "Emerald Downs Racing Stable", isRecurring: true })),
    ...Array.from({ length: 15 }, (_, i) => ({ horseIdx: i, category: "TRAINING" as const, description: `Monthly training fee - ${horsesData[i]!.name}`, amount: 3500, date: daysAgo(45), vendorName: "Emerald Downs Racing Stable", isRecurring: true })),

    // Vet bills
    { horseIdx: 0, category: "VETERINARY" as const, description: "Pre-season wellness exam", amount: 350, date: daysAgo(60), vendorName: "Equine Medical Associates", isRecurring: false },
    { horseIdx: 2, category: "VETERINARY" as const, description: "Dental float procedure", amount: 275, date: daysAgo(30), vendorName: "Equine Medical Associates", isRecurring: false },
    { horseIdx: 5, category: "VETERINARY" as const, description: "Upper airway endoscopy", amount: 450, date: daysAgo(15), vendorName: "Equine Medical Associates", isRecurring: false },
    { horseIdx: 7, category: "VETERINARY" as const, description: "Fetlock radiographs (4 views)", amount: 380, date: daysAgo(25), vendorName: "Equine Medical Associates", isRecurring: false },
    { horseIdx: 8, category: "VETERINARY" as const, description: "Lameness evaluation + ultrasound", amount: 650, date: daysAgo(14), vendorName: "Equine Medical Associates", isRecurring: false },
    { horseIdx: 8, category: "VETERINARY" as const, description: "PRP injection preparation and administration", amount: 1200, date: daysAgo(7), vendorName: "Equine Medical Associates", isRecurring: false },
    { horseIdx: 0, category: "VETERINARY" as const, description: "Intra-articular joint injection", amount: 500, date: daysAgo(2), vendorName: "Equine Medical Associates", isRecurring: false },

    // Farrier
    { horseIdx: 3, category: "FARRIER" as const, description: "Full set aluminum racing plates + corrective trim", amount: 325, date: daysAgo(50), vendorName: "Tom Bradshaw Farrier Services", isRecurring: false },
    { horseIdx: 10, category: "FARRIER" as const, description: "Reset fronts, trim hinds", amount: 185, date: daysAgo(35), vendorName: "Tom Bradshaw Farrier Services", isRecurring: false },
    ...Array.from({ length: 8 }, (_, i) => ({ horseIdx: i * 2, category: "FARRIER" as const, description: `Regular shoeing - ${horsesData[i * 2]!.name}`, amount: 225 + Math.floor(Math.random() * 100), date: daysAgo(20 + Math.floor(Math.random() * 15)), vendorName: "Tom Bradshaw Farrier Services", isRecurring: false })),

    // Entry fees
    { horseIdx: 0, category: "REGISTRATION" as const, description: "Blue Grass Prep Stakes entry fee", amount: 500, date: daysAgo(7), vendorName: "Keeneland Association", isRecurring: false },
    { horseIdx: 4, category: "REGISTRATION" as const, description: "Blue Grass Prep Stakes entry fee", amount: 500, date: daysAgo(7), vendorName: "Keeneland Association", isRecurring: false },
    { horseIdx: 0, category: "REGISTRATION" as const, description: "Santa Anita Derby Prep entry fee", amount: 750, date: daysAgo(1), vendorName: "Santa Anita Park", isRecurring: false },

    // Jockey fees
    { horseIdx: 0, category: "JOCKEY_FEE" as const, description: "Jockey fee - Blue Grass Prep (win mount)", amount: 2500, date: daysAgo(3), vendorName: "John Velazquez", isRecurring: false },
    { horseIdx: 5, category: "JOCKEY_FEE" as const, description: "Jockey fee - Saratoga MSW (win mount)", amount: 1500, date: daysAgo(10), vendorName: "Tyler Gaffalione", isRecurring: false },
    { horseIdx: 14, category: "JOCKEY_FEE" as const, description: "Jockey fee - GP Handicap (win mount)", amount: 2000, date: daysAgo(14), vendorName: "John Velazquez", isRecurring: false },

    // Feed
    ...Array.from({ length: 15 }, (_, i) => ({ horseIdx: i, category: "FEED" as const, description: `Monthly feed - ${horsesData[i]!.name}`, amount: 450 + Math.floor(Math.random() * 150), date: daysAgo(10), vendorName: "Triple Crown Nutrition", isRecurring: true })),

    // Transport
    { horseIdx: 0, category: "TRANSPORT" as const, description: "Van to Keeneland for Blue Grass Prep", amount: 1800, date: daysAgo(5), vendorName: "Sallee Horse Vans", isRecurring: false },
    { horseIdx: 5, category: "TRANSPORT" as const, description: "Van to Saratoga", amount: 2200, date: daysAgo(12), vendorName: "Sallee Horse Vans", isRecurring: false },

    // Therapy
    { horseIdx: 14, category: "THERAPY" as const, description: "Acupuncture session", amount: 250, date: daysAgo(12), vendorName: "Dr. Lisa Yang, TCVM", isRecurring: false },
    { horseIdx: 9, category: "THERAPY" as const, description: "Chiropractic adjustment", amount: 200, date: daysAgo(55), vendorName: "Dr. Sarah Mitchell, DC", isRecurring: false },

    // Medication
    { horseIdx: 5, category: "MEDICATION" as const, description: "GastroGard (30 day supply)", amount: 1350, date: daysAgo(30), vendorName: "Valley Vet Supply", isRecurring: true },
    { horseIdx: 8, category: "MEDICATION" as const, description: "Adequan (7 dose series)", amount: 780, date: daysAgo(21), vendorName: "Equine Medical Associates", isRecurring: false },

    // Insurance
    { horseIdx: 0, category: "INSURANCE" as const, description: "Mortality insurance premium - Midnight Thunder", amount: 4500, date: daysAgo(90), vendorName: "Great American Insurance", isRecurring: true },
    { horseIdx: 9, category: "INSURANCE" as const, description: "Mortality insurance premium - King's Ransom", amount: 3800, date: daysAgo(90), vendorName: "Great American Insurance", isRecurring: true },
  ];

  for (const exp of expensesData) {
    await prisma.expense.create({
      data: {
        orgId: org.id,
        horseId: horses[exp.horseIdx]!.id,
        category: exp.category,
        description: exp.description,
        amount: exp.amount,
        date: exp.date,
        vendorName: exp.vendorName,
        isRecurring: exp.isRecurring,
      },
    });
  }

  // ── Revenues ─────────────────────────────────────────────────────────────

  console.log("  Creating revenues...");

  const revenuesData = [
    { horseIdx: 0, category: "PURSE_EARNINGS" as const, description: "1st place - Gulfstream Park Allowance", amount: 45000, date: daysAgo(42), source: "Gulfstream Park" },
    { horseIdx: 2, category: "PURSE_EARNINGS" as const, description: "2nd place - Gulfstream Park Allowance", amount: 15000, date: daysAgo(42), source: "Gulfstream Park" },
    { horseIdx: 1, category: "PURSE_EARNINGS" as const, description: "1st place - Keeneland MSW", amount: 36000, date: daysAgo(35), source: "Keeneland" },
    { horseIdx: 2, category: "PURSE_EARNINGS" as const, description: "2nd place - San Gabriel Stakes G2", amount: 40000, date: daysAgo(28), source: "Santa Anita" },
    { horseIdx: 9, category: "PURSE_EARNINGS" as const, description: "4th place - San Gabriel Stakes G2", amount: 10000, date: daysAgo(28), source: "Santa Anita" },
    { horseIdx: 6, category: "PURSE_EARNINGS" as const, description: "1st place - Churchill Claiming", amount: 21000, date: daysAgo(21), source: "Churchill Downs" },
    { horseIdx: 14, category: "PURSE_EARNINGS" as const, description: "1st place - Gulfstream Handicap", amount: 60000, date: daysAgo(14), source: "Gulfstream Park" },
    { horseIdx: 3, category: "PURSE_EARNINGS" as const, description: "2nd place - Gulfstream Handicap", amount: 20000, date: daysAgo(14), source: "Gulfstream Park" },
    { horseIdx: 0, category: "PURSE_EARNINGS" as const, description: "3rd place - Gulfstream Handicap", amount: 10000, date: daysAgo(14), source: "Gulfstream Park" },
    { horseIdx: 5, category: "PURSE_EARNINGS" as const, description: "1st place - Saratoga MSW", amount: 33000, date: daysAgo(10), source: "Saratoga" },
    { horseIdx: 7, category: "PURSE_EARNINGS" as const, description: "2nd place - Saratoga MSW", amount: 11000, date: daysAgo(10), source: "Saratoga" },
    { horseIdx: 9, category: "PURSE_EARNINGS" as const, description: "1st place - Santa Anita AOC", amount: 51000, date: daysAgo(7), source: "Santa Anita" },
    { horseIdx: 0, category: "PURSE_EARNINGS" as const, description: "1st place - Blue Grass Prep Stakes", amount: 180000, date: daysAgo(3), source: "Keeneland" },
    { horseIdx: 4, category: "PURSE_EARNINGS" as const, description: "2nd place - Blue Grass Prep Stakes", amount: 60000, date: daysAgo(3), source: "Keeneland" },
    { horseIdx: 11, category: "PURSE_EARNINGS" as const, description: "1st place - Gulfstream Maiden Claiming", amount: 16800, date: daysAgo(2), source: "Gulfstream Park" },
    { horseIdx: 6, category: "PURSE_EARNINGS" as const, description: "2nd place - Churchill Starter Allowance", amount: 10000, date: daysAgo(5), source: "Churchill Downs" },
    { horseIdx: 10, category: "PURSE_EARNINGS" as const, description: "4th place - Gulfstream Park Allowance", amount: 3750, date: daysAgo(42), source: "Gulfstream Park" },
    { horseIdx: 10, category: "PURSE_EARNINGS" as const, description: "3rd place - Santa Anita AOC", amount: 9350, date: daysAgo(7), source: "Santa Anita" },
  ];

  for (const rev of revenuesData) {
    await prisma.revenue.create({
      data: {
        orgId: org.id,
        horseId: horses[rev.horseIdx]!.id,
        category: rev.category,
        description: rev.description,
        amount: rev.amount,
        date: rev.date,
        source: rev.source,
      },
    });
  }

  // ── Invoices ─────────────────────────────────────────────────────────────

  console.log("  Creating invoices...");

  // Invoice 1: Paid - February training for William Hartfield III
  const invoice1 = await prisma.invoice.create({
    data: {
      orgId: org.id,
      invoiceNum: "INV-2026-001",
      ownerId: owner1.id,
      ownerName: "William Hartfield III",
      status: "PAID",
      subtotal: 35000,
      tax: 0,
      total: 35000,
      dueDate: daysAgo(30),
      paidAt: daysAgo(28),
      periodStart: daysAgo(75),
      periodEnd: daysAgo(45),
      notes: "February 2026 training fees - 10 horses (5 sole ownership + 5 partnership)",
    },
  });

  // Invoice 2: Sent - March training for William Hartfield III
  const invoice2 = await prisma.invoice.create({
    data: {
      orgId: org.id,
      invoiceNum: "INV-2026-002",
      ownerId: owner1.id,
      ownerName: "William Hartfield III",
      status: "SENT",
      subtotal: 35000,
      tax: 0,
      total: 35000,
      dueDate: daysFromNow(15),
      periodStart: daysAgo(45),
      periodEnd: daysAgo(15),
      notes: "March 2026 training fees",
    },
  });

  // Invoice 3: Paid - February for Catherine Blackwell
  const invoice3 = await prisma.invoice.create({
    data: {
      orgId: org.id,
      invoiceNum: "INV-2026-003",
      ownerId: owner2.id,
      ownerName: "Catherine Blackwell",
      status: "PAID",
      subtotal: 18200,
      tax: 0,
      total: 18200,
      dueDate: daysAgo(30),
      paidAt: daysAgo(25),
      periodStart: daysAgo(75),
      periodEnd: daysAgo(45),
      notes: "February 2026 training fees - 6 horses (3 syndicate + 3 partnership)",
    },
  });

  // Invoice 4: Draft - March for Robert Kim
  const invoice4 = await prisma.invoice.create({
    data: {
      orgId: org.id,
      invoiceNum: "INV-2026-004",
      ownerId: owner3.id,
      ownerName: "Robert Kim",
      status: "DRAFT",
      subtotal: 24500,
      tax: 0,
      total: 24500,
      dueDate: daysFromNow(30),
      periodStart: daysAgo(45),
      periodEnd: daysAgo(15),
      notes: "March 2026 training fees - 7 horses (4 sole ownership + 3 syndicate)",
    },
  });

  // Invoice 5: Overdue - Vet bill for Catherine Blackwell
  const invoice5 = await prisma.invoice.create({
    data: {
      orgId: org.id,
      invoiceNum: "INV-2026-005",
      ownerId: owner2.id,
      ownerName: "Catherine Blackwell",
      status: "OVERDUE",
      subtotal: 2850,
      tax: 0,
      total: 2850,
      dueDate: daysAgo(5),
      periodStart: daysAgo(60),
      periodEnd: daysAgo(30),
      notes: "Veterinary services - Shadow Dancer, Thunder Bay (scope, bloodwork, medications)",
    },
  });

  // ── Daily Checklists ─────────────────────────────────────────────────────

  console.log("  Creating daily checklists...");

  // Today's checklist
  const todayChecklist = await prisma.dailyChecklist.create({
    data: {
      orgId: org.id,
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
      createdById: trainer.id,
      status: "IN_PROGRESS",
    },
  });

  const checklistItems = [
    { horseIdx: 0, description: "Morning workout - 5 furlong breeze", isCompleted: true, completedById: staff1.id },
    { horseIdx: 1, description: "Light jog - 1 mile", isCompleted: true, completedById: staff1.id },
    { horseIdx: 2, description: "Gate schooling session", isCompleted: false, completedById: null },
    { horseIdx: 3, description: "Farrier appointment - reshoe all fours", isCompleted: false, completedById: null },
    { horseIdx: 4, description: "Morning workout - 4 furlong breeze", isCompleted: true, completedById: staff2.id },
    { horseIdx: 5, description: "Turnout - 2 hours paddock", isCompleted: true, completedById: staff2.id },
    { horseIdx: 6, description: "Swimming session - 15 minutes", isCompleted: false, completedById: null },
    { horseIdx: 7, description: "Walk day - hand walk 30 min", isCompleted: true, completedById: staff1.id },
    { horseIdx: 8, description: "Hand walk 15 min x2 (layup protocol)", isCompleted: true, completedById: staff2.id },
    { horseIdx: 9, description: "Morning workout - 6 furlong breeze", isCompleted: false, completedById: null },
    { horseIdx: null, description: "Clean and disinfect water troughs in Barn A", isCompleted: false, completedById: null },
    { horseIdx: null, description: "Inventory check - supplement supply", isCompleted: true, completedById: staff1.id },
  ];

  for (let i = 0; i < checklistItems.length; i++) {
    const item = checklistItems[i]!;
    await prisma.dailyChecklistItem.create({
      data: {
        checklistId: todayChecklist.id,
        horseId: item.horseIdx !== null ? horses[item.horseIdx]!.id : null,
        description: item.description,
        isCompleted: item.isCompleted,
        completedById: item.completedById,
        completedAt: item.isCompleted ? new Date() : null,
        sortOrder: i,
      },
    });
  }

  // Yesterday's checklist (completed)
  const yesterdayChecklist = await prisma.dailyChecklist.create({
    data: {
      orgId: org.id,
      date: new Date(daysAgo(1).getFullYear(), daysAgo(1).getMonth(), daysAgo(1).getDate()),
      createdById: trainer.id,
      status: "COMPLETED",
    },
  });

  const yesterdayItems = [
    { horseIdx: 0, description: "Easy gallop - 1.5 miles" },
    { horseIdx: 4, description: "Light jog and cool out" },
    { horseIdx: 5, description: "Turnout - 3 hours paddock" },
    { horseIdx: 9, description: "Timed work - 5 furlongs" },
    { horseIdx: 14, description: "Acupuncture appointment" },
    { horseIdx: null, description: "Bedding delivery - restock stalls" },
  ];

  for (let i = 0; i < yesterdayItems.length; i++) {
    const item = yesterdayItems[i]!;
    await prisma.dailyChecklistItem.create({
      data: {
        checklistId: yesterdayChecklist.id,
        horseId: item.horseIdx !== null ? horses[item.horseIdx]!.id : null,
        description: item.description,
        isCompleted: true,
        completedById: [staff1.id, staff2.id][i % 2],
        completedAt: daysAgo(1),
        sortOrder: i,
      },
    });
  }

  // ── Feed Logs ────────────────────────────────────────────────────────────

  console.log("  Creating feed logs...");

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(daysAgo(1).getFullYear(), daysAgo(1).getMonth(), daysAgo(1).getDate());

  for (let i = 0; i < horses.length; i++) {
    // Today AM feed
    await prisma.feedLog.create({
      data: {
        orgId: org.id,
        horseId: horses[i]!.id,
        date: today,
        meal: "AM",
        feedType: "Triple Crown Senior",
        quantity: "6",
        unit: "quarts",
        supplements: i < 5 ? "SmartPak Joint, Vitamin E 5000 IU" : i < 10 ? "SmartPak Hoof, Electrolytes" : "SmartPak Digest Ultra",
        loggedById: staff1.id,
      },
    });

    // Yesterday full day
    for (const meal of ["AM", "PM"] as const) {
      await prisma.feedLog.create({
        data: {
          orgId: org.id,
          horseId: horses[i]!.id,
          date: yesterday,
          meal,
          feedType: "Triple Crown Senior",
          quantity: meal === "AM" ? "6" : "5",
          unit: "quarts",
          supplements: meal === "AM" ? "SmartPak Joint, Vitamin E 5000 IU" : null,
          loggedById: meal === "AM" ? staff1.id : staff2.id,
        },
      });
    }
  }

  // ── Therapy Logs ─────────────────────────────────────────────────────────

  console.log("  Creating therapy logs...");

  const therapyData = [
    { horseIdx: 0, date: daysAgo(5), therapyType: "Cold Spa", duration: 20, provider: "In-house", notes: "Post-race cold water therapy on all four legs. Horse tolerated well." },
    { horseIdx: 2, date: daysAgo(10), therapyType: "Equine Massage", duration: 45, provider: "Jennifer Hill, LMT", notes: "Full body massage focusing on topline and hindquarters. Released tension in gluteals." },
    { horseIdx: 5, date: daysAgo(8), therapyType: "Vibration Plate", duration: 15, provider: "In-house", notes: "10-minute session on TheraPlate. Good muscle activation." },
    { horseIdx: 6, date: daysAgo(4), therapyType: "Swimming", duration: 15, provider: "Emerald Aqua Center", notes: "3 laps in equine pool. Good cardio workout without concussive stress." },
    { horseIdx: 8, date: daysAgo(3), therapyType: "Therapeutic Ultrasound", duration: 10, provider: "Dr. Amanda Foster", notes: "Therapeutic ultrasound to LH suspensory. Continuous mode, 1 MHz, 1.5 W/cm2." },
    { horseIdx: 8, date: daysAgo(1), therapyType: "Cold Spa", duration: 20, provider: "In-house", notes: "Ice boots on LH. Part of daily rehab protocol." },
    { horseIdx: 9, date: daysAgo(6), therapyType: "PEMF Therapy", duration: 30, provider: "In-house", notes: "Pulsed electromagnetic field therapy targeting back and hindquarters. Level 6." },
    { horseIdx: 14, date: daysAgo(12), therapyType: "Acupuncture", duration: 40, provider: "Dr. Lisa Yang, TCVM", notes: "12-point dry needle session. Good response. Hindquarter Qi stagnation addressed." },
  ];

  for (const t of therapyData) {
    await prisma.therapyLog.create({
      data: {
        orgId: org.id,
        horseId: horses[t.horseIdx]!.id,
        date: t.date,
        therapyType: t.therapyType,
        duration: t.duration,
        provider: t.provider,
        notes: t.notes,
        loggedById: t.horseIdx === 8 ? vet.id : trainer.id,
      },
    });
  }

  // ── Notifications ────────────────────────────────────────────────────────

  console.log("  Creating notifications...");

  const notificationsData = [
    // Race results
    { userId: owner1.id, type: "RACE_RESULT" as const, title: "Race Result: Midnight Thunder", body: "Midnight Thunder finished 1st in the Blue Grass Prep Stakes at Keeneland! Purse earned: $180,000.", createdAt: daysAgo(3), isRead: true },
    { userId: owner1.id, type: "RACE_RESULT" as const, title: "Race Result: Copper Ridge", body: "Copper Ridge finished 2nd in the Blue Grass Prep Stakes at Keeneland. Purse earned: $60,000.", createdAt: daysAgo(3), isRead: true },
    { userId: owner2.id, type: "RACE_RESULT" as const, title: "Race Result: Shadow Dancer", body: "Shadow Dancer finished 1st in the Saratoga Maiden Special Weight! Purse earned: $33,000.", createdAt: daysAgo(10), isRead: true },
    { userId: owner3.id, type: "RACE_RESULT" as const, title: "Race Result: Lucky Charm", body: "Lucky Charm finished 1st in the Gulfstream Park Maiden Claiming! Purse earned: $16,800.", createdAt: daysAgo(2), isRead: false },

    // Document expiry warnings
    { userId: trainer.id, type: "DOCUMENT_EXPIRING" as const, title: "Coggins Expiring Soon: Iron Legacy", body: "The Coggins test for Iron Legacy expires in 12 days. Please schedule a new test.", createdAt: daysAgo(1), isRead: false },
    { userId: trainer.id, type: "DOCUMENT_EXPIRING" as const, title: "Coggins Expiring Soon: Thunder Bay", body: "The Coggins test for Thunder Bay expires in 17 days. Please schedule a new test.", createdAt: daysAgo(1), isRead: false },
    { userId: admin.id, type: "DOCUMENT_EXPIRING" as const, title: "Health Certificates Expiring", body: "5 health certificates are expiring within the next 30 days. Review and renew as needed.", createdAt: daysAgo(1), isRead: false },

    // Health alerts
    { userId: trainer.id, type: "HEALTH_ALERT" as const, title: "Active Withdrawal: Midnight Thunder", body: "Midnight Thunder has an active withdrawal period for Dexamethasone (IA injection). Withdrawal ends in 12 days. Do NOT enter in any races until cleared.", createdAt: daysAgo(2), isRead: true },
    { userId: owner1.id, type: "HEALTH_ALERT" as const, title: "Injury Update: Rose Garden", body: "Rose Garden has been placed on layup due to left hind suspensory branch desmitis. PRP therapy has been initiated. Expected return: 4-6 months.", createdAt: daysAgo(14), isRead: true },

    // Race entries
    { userId: owner1.id, type: "RACE_ENTRY" as const, title: "Race Entry: Midnight Thunder", body: "Midnight Thunder has been entered in the Santa Anita Derby Prep on " + daysFromNow(4).toLocaleDateString() + ". Post position: 4.", createdAt: daysAgo(1), isRead: false },
    { userId: owner2.id, type: "RACE_ENTRY" as const, title: "Race Entry: King's Ransom", body: "King's Ransom has been confirmed for the Santa Anita Derby Prep on " + daysFromNow(4).toLocaleDateString() + ". Post position: 6.", createdAt: daysAgo(1), isRead: false },

    // Invoice
    { userId: owner2.id, type: "INVOICE_OVERDUE" as const, title: "Invoice Overdue: INV-2026-005", body: "Invoice INV-2026-005 for $2,850 (veterinary services) is now overdue. Please arrange payment.", createdAt: daysAgo(1), isRead: false },

    // Daily report
    { userId: owner1.id, type: "DAILY_REPORT" as const, title: "Daily Training Report", body: "Today's highlights: Midnight Thunder breezed 5 furlongs in 1:00.2. Copper Ridge worked 4 furlongs in 48.4. All horses healthy and on schedule.", createdAt: daysAgo(1), isRead: false },
  ];

  for (const n of notificationsData) {
    await prisma.notification.create({
      data: {
        orgId: org.id,
        userId: n.userId,
        type: n.type,
        title: n.title,
        body: n.body,
        channel: "IN_APP",
        isRead: n.isRead,
        readAt: n.isRead ? n.createdAt : null,
        deliveredAt: n.createdAt,
        createdAt: n.createdAt,
      },
    });
  }

  // ── Messages ─────────────────────────────────────────────────────────────

  console.log("  Creating messages...");

  // Thread 1: Trainer -> Owner1 about Midnight Thunder
  const thread1 = await prisma.messageThread.create({
    data: {
      orgId: org.id,
      horseId: horses[0]!.id,
      subject: "Midnight Thunder - Blue Grass Prep Update",
    },
  });

  await prisma.message.create({
    data: {
      orgId: org.id,
      threadId: thread1.id,
      senderId: trainer.id,
      recipientId: owner1.id,
      horseId: horses[0]!.id,
      subject: "Midnight Thunder - Blue Grass Prep Update",
      body: "William, great news! Midnight Thunder ran a tremendous race in the Blue Grass Prep today. He broke well from post 5, sat just off the pace, and drew off in the stretch to win by 3/4 of a length. The speed figure came back a 98 - his best yet. John Velazquez said he was full of run at the wire. I'm very excited about the Santa Anita Derby Prep next. We'll ship out on Tuesday. Let me know if you have any questions.",
      isRead: true,
      readAt: daysAgo(3),
      createdAt: daysAgo(3),
    },
  });

  await prisma.message.create({
    data: {
      orgId: org.id,
      threadId: thread1.id,
      senderId: owner1.id,
      recipientId: trainer.id,
      horseId: horses[0]!.id,
      subject: "Re: Midnight Thunder - Blue Grass Prep Update",
      body: "Sarah, what a thrill! I watched the replay five times. The way he switched leads in the turn and powered through the stretch was incredible. A 98 speed figure puts him right up there with the best 3-year-olds. I'm fully on board for the Santa Anita Derby Prep. Keep me posted on the shipping arrangements. Also, how did Copper Ridge come out of the race?",
      isRead: true,
      readAt: daysAgo(2),
      createdAt: daysAgo(2),
    },
  });

  await prisma.message.create({
    data: {
      orgId: org.id,
      threadId: thread1.id,
      senderId: trainer.id,
      recipientId: owner1.id,
      horseId: horses[0]!.id,
      subject: "Re: Midnight Thunder - Blue Grass Prep Update",
      body: "Copper Ridge came out of the race in great shape - ate up his dinner and was bright-eyed the next morning. His 2nd place finish with a 95 speed figure was very encouraging for a 3-year-old colt in only his 3rd start. I want to give him one more prep before pointing him toward bigger targets. I'll have the van booked for Tuesday morning. Midnight Thunder's legs were cold and tight this morning - couldn't be happier with him.",
      isRead: false,
      createdAt: daysAgo(2),
    },
  });

  // Thread 2: Trainer -> Owner2 about Rose Garden injury
  const thread2 = await prisma.messageThread.create({
    data: {
      orgId: org.id,
      horseId: horses[8]!.id,
      subject: "Rose Garden - Injury Update",
    },
  });

  await prisma.message.create({
    data: {
      orgId: org.id,
      threadId: thread2.id,
      senderId: trainer.id,
      recipientId: owner1.id,
      horseId: horses[8]!.id,
      subject: "Rose Garden - Injury Update",
      body: "William and Catherine, I wanted to update you on Rose Garden. After her workout last week, she showed some soreness in her left hind. Dr. Foster performed a thorough lameness exam and ultrasound, which revealed a mild to moderate suspensory branch desmitis. We've started her on a rehabilitation program including stall rest, hand-walking, and PRP therapy. Dr. Foster is optimistic about a full recovery, but we're looking at a 4-6 month timeline before she can return to training. I know this is disappointing, but catching it early gives us the best chance for a complete recovery. I'll send weekly updates.",
      isRead: true,
      readAt: daysAgo(13),
      createdAt: daysAgo(14),
    },
  });

  await prisma.message.create({
    data: {
      orgId: org.id,
      threadId: thread2.id,
      senderId: owner1.id,
      recipientId: trainer.id,
      horseId: horses[8]!.id,
      subject: "Re: Rose Garden - Injury Update",
      body: "Thank you for the thorough update, Sarah. While it's certainly disappointing, I appreciate that you caught this early. Rose Garden's long-term soundness is what matters most. Please proceed with Dr. Foster's recommended treatment plan and keep us updated weekly. Is the insurance policy current? We should file a claim for the vet expenses.",
      isRead: true,
      readAt: daysAgo(13),
      createdAt: daysAgo(13),
    },
  });

  // Thread 3: Vet -> Trainer about medication withdrawal
  const thread3 = await prisma.messageThread.create({
    data: {
      orgId: org.id,
      horseId: horses[0]!.id,
      subject: "Midnight Thunder - Joint Injection & Withdrawal Period",
    },
  });

  await prisma.message.create({
    data: {
      orgId: org.id,
      threadId: thread3.id,
      senderId: vet.id,
      recipientId: trainer.id,
      horseId: horses[0]!.id,
      subject: "Midnight Thunder - Joint Injection & Withdrawal Period",
      body: "Sarah, just a reminder that Midnight Thunder received a dexamethasone intra-articular injection in his left front fetlock 2 days ago. The withdrawal period is 14 days (336 hours). He CANNOT race until the withdrawal clears. This means the earliest he can race is " + daysFromNow(12).toLocaleDateString() + ". Please factor this into entry decisions for the Santa Anita Derby Prep. Let me know if you have questions about the withdrawal timeline.",
      isRead: true,
      readAt: daysAgo(1),
      createdAt: daysAgo(2),
    },
  });

  await prisma.message.create({
    data: {
      orgId: org.id,
      threadId: thread3.id,
      senderId: trainer.id,
      recipientId: vet.id,
      horseId: horses[0]!.id,
      subject: "Re: Midnight Thunder - Joint Injection & Withdrawal Period",
      body: "Thanks Dr. Foster. The Santa Anita Derby Prep is on " + daysFromNow(4).toLocaleDateString() + " - that's within the withdrawal window. I'll need to discuss with William about whether to scratch and wait for a later race, or proceed with the original plan. How is the fetlock responding to the injection?",
      isRead: true,
      readAt: daysAgo(1),
      createdAt: daysAgo(1),
    },
  });

  // ── Summary ──────────────────────────────────────────────────────────────

  console.log("\n✅ Seed completed successfully!\n");
  console.log("  Summary:");
  console.log(`    Organization: ${org.name}`);
  console.log(`    Users: ${Object.keys(users).length}`);
  console.log(`    Horses: ${horses.length}`);
  console.log(`    Races: ${races.length}`);
  console.log(`    Race Entries: ${entriesData.length}`);
  console.log(`    Health Records: ${healthRecordsData.length}`);
  console.log(`    Medications: ${medsData.length}`);
  console.log(`    Documents: ${15 + 15 + insuredHorses.length + 5}`);
  console.log(`    Expenses: ${expensesData.length}`);
  console.log(`    Revenues: ${revenuesData.length}`);
  console.log(`    Invoices: 5`);
  console.log(`    Notifications: ${notificationsData.length}`);
  console.log(`    Message Threads: 3`);
  console.log("\n  Login credentials (all users): password123");
  console.log("  Admin: michael.torres@emeralddowns.com");
  console.log("  Trainer: sarah.chen@emeralddowns.com");
  console.log("  Owner: william.hartfield@emeralddowns.com\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
