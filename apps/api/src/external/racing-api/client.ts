import { getEnv } from "../../config/env.js";
import { getLogger } from "../../lib/logger.js";
import { MockRacingApiClient } from "./mock.js";

export interface RaceCard {
  id: string;
  trackName: string;
  trackCode: string;
  raceNumber: number;
  raceType: string;
  surface: string;
  distance: string;
  purse: number;
  postTime: string;
  conditions: string;
  entries: RaceEntry[];
}

export interface RaceEntry {
  programNumber: number;
  horseName: string;
  jockey: string;
  trainer: string;
  weight: number;
  morningLineOdds: string;
  lastThreeFinishes: string;
}

export interface RaceResult {
  raceId: string;
  trackName: string;
  trackCode: string;
  raceNumber: number;
  date: string;
  surface: string;
  distance: string;
  finishOrder: FinishPosition[];
  fractionalTimes: string[];
  finalTime: string;
  trackCondition: string;
}

export interface FinishPosition {
  position: number;
  programNumber: number;
  horseName: string;
  jockey: string;
  trainer: string;
  officialTime: string;
  margin: string;
  odds: string;
  payouts?: { type: string; amount: number }[];
}

export interface HorsePastPerformance {
  horseName: string;
  sireLineage: string;
  damLineage: string;
  age: number;
  sex: string;
  races: PastRace[];
}

export interface PastRace {
  date: string;
  trackCode: string;
  raceNumber: number;
  surface: string;
  distance: string;
  finishPosition: number;
  fieldSize: number;
  officialTime: string;
  speedFigure: number;
  jockey: string;
  weight: number;
  comment: string;
}

export interface IRacingApiClient {
  getRaceCards(trackCode: string, date: string): Promise<RaceCard[]>;
  getRaceResults(trackCode: string, date: string): Promise<RaceResult[]>;
  getHorsePastPerformances(horseName: string): Promise<HorsePastPerformance | null>;
  getTracks(): Promise<{ code: string; name: string; state: string }[]>;
}

class LiveRacingApiClient implements IRacingApiClient {
  private baseUrl: string;
  private apiKey: string;
  private logger = getLogger();

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  private async request<T>(path: string): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    this.logger.debug({ url }, "Racing API request");

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const body = await response.text();
      this.logger.error(
        { status: response.status, body, url },
        "Racing API request failed",
      );
      throw new Error(
        `Racing API error: ${response.status} ${response.statusText}`,
      );
    }

    return response.json() as Promise<T>;
  }

  async getRaceCards(trackCode: string, date: string): Promise<RaceCard[]> {
    return this.request<RaceCard[]>(
      `/tracks/${trackCode}/cards?date=${date}`,
    );
  }

  async getRaceResults(trackCode: string, date: string): Promise<RaceResult[]> {
    return this.request<RaceResult[]>(
      `/tracks/${trackCode}/results?date=${date}`,
    );
  }

  async getHorsePastPerformances(
    horseName: string,
  ): Promise<HorsePastPerformance | null> {
    try {
      return await this.request<HorsePastPerformance>(
        `/horses/${encodeURIComponent(horseName)}/pp`,
      );
    } catch {
      return null;
    }
  }

  async getTracks(): Promise<{ code: string; name: string; state: string }[]> {
    return this.request(`/tracks`);
  }
}

export function createRacingApiClient(): IRacingApiClient {
  const env = getEnv();

  if (env.RACING_API_BASE_URL && env.RACING_API_KEY) {
    return new LiveRacingApiClient(env.RACING_API_BASE_URL, env.RACING_API_KEY);
  }

  return new MockRacingApiClient();
}
