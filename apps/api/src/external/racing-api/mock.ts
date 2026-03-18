import type {
  IRacingApiClient,
  RaceCard,
  RaceEntry,
  RaceResult,
  FinishPosition,
  HorsePastPerformance,
  PastRace,
} from "./client.js";

const TRACKS = [
  { code: "GP", name: "Gulfstream Park", state: "FL" },
  { code: "KEE", name: "Keeneland", state: "KY" },
  { code: "SA", name: "Santa Anita Park", state: "CA" },
  { code: "CD", name: "Churchill Downs", state: "KY" },
] as const;

const HORSE_NAMES = [
  "Midnight Thunder",
  "Desert Storm",
  "Lucky Charm",
  "Iron Will",
  "Silver Streak",
  "Golden Sunrise",
  "Dark Rebel",
  "Ocean Breeze",
  "Wild Frontier",
  "Crimson Bolt",
  "Storm Chaser",
  "Royal Dynasty",
  "Blue Diamond",
  "Shadow Runner",
  "Phoenix Rising",
  "Noble Spirit",
  "Brave Heart",
  "Steel Magnolia",
  "Rapid Fire",
  "Cloud Nine",
];

const JOCKEYS = [
  "J. Velazquez",
  "I. Ortiz Jr.",
  "L. Saez",
  "J. Rosario",
  "T. Gaffalione",
  "F. Prat",
  "J. Castellano",
  "M. Smith",
  "R. Santana Jr.",
  "J. Leparoux",
];

const TRAINERS = [
  "T. Pletcher",
  "B. Cox",
  "C. Brown",
  "S. Asmussen",
  "B. Baffert",
  "M. Maker",
  "W. Mott",
  "D. O'Neill",
  "K. McPeek",
  "J. Sisterson",
];

const RACE_TYPES = [
  { type: "MAIDEN", label: "Maiden Special Weight" },
  { type: "CLAIMING", label: "Claiming $25,000" },
  { type: "CLAIMING", label: "Claiming $50,000" },
  { type: "ALLOWANCE", label: "Allowance Optional Claiming" },
  { type: "STAKES", label: "Stakes - Listed" },
  { type: "GRADED_STAKES", label: "Grade III Stakes" },
  { type: "GRADED_STAKES", label: "Grade II Stakes" },
  { type: "GRADED_STAKES", label: "Grade I Stakes" },
  { type: "HANDICAP", label: "Handicap" },
];

const DISTANCES = [
  { label: "6 Furlongs", furlongs: 6 },
  { label: "6 1/2 Furlongs", furlongs: 6.5 },
  { label: "7 Furlongs", furlongs: 7 },
  { label: "1 Mile", furlongs: 8 },
  { label: "1 1/16 Miles", furlongs: 8.5 },
  { label: "1 1/8 Miles", furlongs: 9 },
  { label: "1 1/4 Miles", furlongs: 10 },
  { label: "1 1/2 Miles", furlongs: 12 },
];

function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

function pick<T>(arr: readonly T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)]!;
}

function generateEntries(
  count: number,
  rand: () => number,
): RaceEntry[] {
  const used = new Set<string>();
  const entries: RaceEntry[] = [];

  for (let i = 0; i < count; i++) {
    let horse: string;
    do {
      horse = pick(HORSE_NAMES, rand);
    } while (used.has(horse));
    used.add(horse);

    const finishes = [
      Math.ceil(rand() * 10),
      Math.ceil(rand() * 10),
      Math.ceil(rand() * 10),
    ];

    entries.push({
      programNumber: i + 1,
      horseName: horse,
      jockey: pick(JOCKEYS, rand),
      trainer: pick(TRAINERS, rand),
      weight: 118 + Math.floor(rand() * 8),
      morningLineOdds: `${Math.ceil(rand() * 15)}-1`,
      lastThreeFinishes: finishes.join("-"),
    });
  }

  return entries;
}

export class MockRacingApiClient implements IRacingApiClient {
  async getRaceCards(trackCode: string, date: string): Promise<RaceCard[]> {
    const track = TRACKS.find((t) => t.code === trackCode);
    if (!track) return [];

    const seed = hashCode(`${trackCode}-${date}-cards`);
    const rand = seededRandom(seed);
    const raceCount = 8 + Math.floor(rand() * 4); // 8-11 races

    const cards: RaceCard[] = [];
    for (let raceNum = 1; raceNum <= raceCount; raceNum++) {
      const raceRand = seededRandom(seed + raceNum);
      const raceTypeInfo = pick(RACE_TYPES, raceRand);
      const distance = pick(DISTANCES, raceRand);
      const surface = raceRand() > 0.3 ? "DIRT" : "TURF";
      const entryCount = 6 + Math.floor(raceRand() * 8); // 6-13 entries
      const hour = 12 + Math.floor(raceNum / 2);
      const minute = raceNum % 2 === 0 ? "30" : "00";

      const purseMultiplier =
        raceTypeInfo.type === "GRADED_STAKES"
          ? 100000
          : raceTypeInfo.type === "STAKES"
            ? 50000
            : raceTypeInfo.type === "ALLOWANCE"
              ? 25000
              : 10000;

      cards.push({
        id: `${trackCode}-${date}-R${raceNum}`,
        trackName: track.name,
        trackCode: track.code,
        raceNumber: raceNum,
        raceType: raceTypeInfo.type,
        surface,
        distance: distance.label,
        purse: purseMultiplier * (1 + Math.floor(raceRand() * 5)),
        postTime: `${date}T${hour}:${minute}:00-05:00`,
        conditions: raceTypeInfo.label,
        entries: generateEntries(
          Math.min(entryCount, HORSE_NAMES.length),
          raceRand,
        ),
      });
    }

    return cards;
  }

  async getRaceResults(
    trackCode: string,
    date: string,
  ): Promise<RaceResult[]> {
    const cards = await this.getRaceCards(trackCode, date);
    const seed = hashCode(`${trackCode}-${date}-results`);

    return cards.map((card, idx) => {
      const rand = seededRandom(seed + idx);

      const shuffled = [...card.entries].sort(() => rand() - 0.5);
      const trackConditions = ["Fast", "Good", "Firm", "Yielding", "Sloppy"];

      const finishOrder: FinishPosition[] = shuffled.map((entry, pos) => {
        const minutes = Math.floor(rand() * 2) + 1;
        const seconds = (rand() * 30 + 20).toFixed(2);
        const margins = ["nose", "head", "neck", "1/2", "1", "1 1/4", "2", "3", "5"];

        const result: FinishPosition = {
          position: pos + 1,
          programNumber: entry.programNumber,
          horseName: entry.horseName,
          jockey: entry.jockey,
          trainer: entry.trainer,
          officialTime: `${minutes}:${seconds}`,
          margin: pos === 0 ? "-" : pick(margins, rand),
          odds: entry.morningLineOdds,
        };

        if (pos < 3) {
          const basePayouts = [
            { type: "WIN", amount: Math.round((rand() * 20 + 3) * 100) / 100 },
            { type: "PLACE", amount: Math.round((rand() * 10 + 2) * 100) / 100 },
            { type: "SHOW", amount: Math.round((rand() * 6 + 2) * 100) / 100 },
          ];
          result.payouts = basePayouts.slice(pos);
        }

        return result;
      });

      const fractionalCount = card.distance.includes("Mile") ? 4 : 3;
      const fractionalTimes: string[] = [];
      let cumulative = 0;
      for (let f = 0; f < fractionalCount; f++) {
        cumulative += 22 + rand() * 4;
        fractionalTimes.push(`:${cumulative.toFixed(2)}`);
      }

      return {
        raceId: card.id,
        trackName: card.trackName,
        trackCode: card.trackCode,
        raceNumber: card.raceNumber,
        date,
        surface: card.surface,
        distance: card.distance,
        finishOrder,
        fractionalTimes,
        finalTime: finishOrder[0]?.officialTime ?? "0:00.00",
        trackCondition: pick(trackConditions, rand),
      };
    });
  }

  async getHorsePastPerformances(
    horseName: string,
  ): Promise<HorsePastPerformance | null> {
    if (!HORSE_NAMES.includes(horseName)) return null;

    const seed = hashCode(horseName);
    const rand = seededRandom(seed);

    const sires = [
      "Tapit",
      "Into Mischief",
      "Curlin",
      "Quality Road",
      "War Front",
      "Medaglia d'Oro",
      "Uncle Mo",
      "Nyquist",
    ];
    const dams = [
      "Zenyatta",
      "Rachel Alexandra",
      "Beholder",
      "Songbird",
      "Monomoy Girl",
      "Swiss Skydiver",
      "Midnight Bisou",
      "Blue Prize",
    ];
    const sexes = ["Colt", "Filly", "Gelding", "Mare", "Stallion"];
    const comments = [
      "Rallied wide, closed strongly",
      "Stalked pace, tired late",
      "Set the pace, drew off",
      "Bumped at start, recovered",
      "Rated off pace, steady finish",
      "Broke slowly, passed tired horses",
      "Pressed leader, weakened",
      "Wide throughout, game effort",
      "Saved ground, found room late",
      "Tracked leader, took over in stretch",
    ];

    const raceCount = 5 + Math.floor(rand() * 10);
    const races: PastRace[] = [];

    for (let i = 0; i < raceCount; i++) {
      const daysAgo = 14 + i * (20 + Math.floor(rand() * 30));
      const raceDate = new Date();
      raceDate.setDate(raceDate.getDate() - daysAgo);

      const track = pick(TRACKS, rand);
      const distance = pick(DISTANCES, rand);
      const fieldSize = 6 + Math.floor(rand() * 8);

      races.push({
        date: raceDate.toISOString().split("T")[0]!,
        trackCode: track.code,
        raceNumber: 1 + Math.floor(rand() * 10),
        surface: rand() > 0.3 ? "DIRT" : "TURF",
        distance: distance.label,
        finishPosition: 1 + Math.floor(rand() * fieldSize),
        fieldSize,
        officialTime: `${1 + Math.floor(rand())}:${(20 + rand() * 30).toFixed(2)}`,
        speedFigure: 60 + Math.floor(rand() * 40),
        jockey: pick(JOCKEYS, rand),
        weight: 118 + Math.floor(rand() * 8),
        comment: pick(comments, rand),
      });
    }

    return {
      horseName,
      sireLineage: pick(sires, rand),
      damLineage: pick(dams, rand),
      age: 2 + Math.floor(rand() * 6),
      sex: pick(sexes, rand),
      races,
    };
  }

  async getTracks(): Promise<{ code: string; name: string; state: string }[]> {
    return TRACKS.map((t) => ({ code: t.code, name: t.name, state: t.state }));
  }
}
