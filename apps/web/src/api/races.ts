import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from './client';
import type {
  Race,
  RaceStatus,
  EligibilityCheck,
  CreateRaceEntryInput,
  RecordRaceResultInput,
} from '@nuestable/shared';

interface RaceListParams {
  page?: number;
  limit?: number;
  status?: RaceStatus;
  trackName?: string;
  dateFrom?: string;
  dateTo?: string;
  surface?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface RaceDayData {
  races: Race[];
  date: string;
}

async function fetchRaces(params: RaceListParams): Promise<PaginatedResponse<Race>> {
  const { data } = await apiClient.get('/races', { params });
  return data;
}

async function fetchRace(id: string): Promise<Race> {
  const { data } = await apiClient.get(`/races/${id}`);
  return data;
}

async function fetchRaceDayDashboard(date?: string): Promise<RaceDayData> {
  const { data } = await apiClient.get('/races/today', { params: { date } });
  return data;
}

async function checkEligibility(horseId: string): Promise<EligibilityCheck[]> {
  const { data } = await apiClient.get(`/races/eligibility/${horseId}`);
  return data;
}

async function createEntry(input: CreateRaceEntryInput): Promise<void> {
  await apiClient.post(`/races/${input.raceId}/entries`, input);
}

async function recordResult(input: RecordRaceResultInput): Promise<void> {
  await apiClient.post(`/races/${input.raceId}/results`, input);
}

async function scratchEntry(raceId: string, entryId: string, reason: string): Promise<void> {
  await apiClient.post(`/races/${raceId}/entries/${entryId}/scratch`, { reason });
}

export function useRaces(params: RaceListParams = {}) {
  return useQuery({
    queryKey: ['races', params],
    queryFn: () => fetchRaces(params),
  });
}

export function useRace(id: string | undefined) {
  return useQuery({
    queryKey: ['races', id],
    queryFn: () => fetchRace(id!),
    enabled: !!id,
  });
}

export function useRaceDashboard(date?: string) {
  return useQuery({
    queryKey: ['races', 'today', date],
    queryFn: () => fetchRaceDayDashboard(date),
    refetchInterval: 30_000,
  });
}

export function useEligibility(horseId: string | undefined) {
  return useQuery({
    queryKey: ['races', 'eligibility', horseId],
    queryFn: () => checkEligibility(horseId!),
    enabled: !!horseId,
  });
}

export function useCreateEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['races'] });
    },
  });
}

export function useRecordResult() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: recordResult,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['races'] });
    },
  });
}

export function useScratchEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ raceId, entryId, reason }: { raceId: string; entryId: string; reason: string }) =>
      scratchEntry(raceId, entryId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['races'] });
    },
  });
}
