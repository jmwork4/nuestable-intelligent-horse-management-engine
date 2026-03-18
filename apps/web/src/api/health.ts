import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from './client';
import type {
  MedicationRecord,
  VaccinationRecord,
  InjuryRecord,
  WithdrawalCountdown,
  CreateMedicationInput,
  CreateVaccinationInput,
  CreateInjuryInput,
} from '@nuestable/shared';

interface MedicationParams {
  horseId?: string;
  active?: boolean;
}

interface ClearanceItem {
  horseId: string;
  horseName: string;
  checks: {
    name: string;
    status: 'CLEAR' | 'HOLD' | 'FAIL';
    detail: string;
  }[];
  overallStatus: 'CLEAR' | 'HOLD' | 'FAIL';
}

async function fetchMedications(params: MedicationParams): Promise<MedicationRecord[]> {
  const { data } = await apiClient.get('/health/medications', { params });
  return data;
}

async function createMedication(input: CreateMedicationInput): Promise<MedicationRecord> {
  const { data } = await apiClient.post('/health/medications', input);
  return data;
}

async function fetchWithdrawals(): Promise<WithdrawalCountdown[]> {
  const { data } = await apiClient.get('/health/withdrawals');
  return data;
}

async function fetchVaccinations(horseId?: string): Promise<VaccinationRecord[]> {
  const { data } = await apiClient.get('/health/vaccinations', { params: { horseId } });
  return data;
}

async function createVaccination(input: CreateVaccinationInput): Promise<VaccinationRecord> {
  const { data } = await apiClient.post('/health/vaccinations', input);
  return data;
}

async function fetchInjuries(params: { horseId?: string; active?: boolean }): Promise<InjuryRecord[]> {
  const { data } = await apiClient.get('/health/injuries', { params });
  return data;
}

async function createInjury(input: CreateInjuryInput): Promise<InjuryRecord> {
  const { data } = await apiClient.post('/health/injuries', input);
  return data;
}

async function updateInjury(id: string, updates: Partial<InjuryRecord>): Promise<InjuryRecord> {
  const { data } = await apiClient.patch(`/health/injuries/${id}`, updates);
  return data;
}

async function fetchPreRaceClearance(horseId?: string): Promise<ClearanceItem[]> {
  const { data } = await apiClient.get('/health/clearance', { params: { horseId } });
  return data;
}

export function useMedications(params: MedicationParams = {}) {
  return useQuery({
    queryKey: ['medications', params],
    queryFn: () => fetchMedications(params),
  });
}

export function useCreateMedication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createMedication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
      queryClient.invalidateQueries({ queryKey: ['withdrawals'] });
    },
  });
}

export function useWithdrawals() {
  return useQuery({
    queryKey: ['withdrawals'],
    queryFn: fetchWithdrawals,
    refetchInterval: 60_000,
  });
}

export function useVaccinations(horseId?: string) {
  return useQuery({
    queryKey: ['vaccinations', horseId],
    queryFn: () => fetchVaccinations(horseId),
  });
}

export function useCreateVaccination() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createVaccination,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vaccinations'] }),
  });
}

export function useInjuries(params: { horseId?: string; active?: boolean } = {}) {
  return useQuery({
    queryKey: ['injuries', params],
    queryFn: () => fetchInjuries(params),
  });
}

export function useCreateInjury() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createInjury,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['injuries'] }),
  });
}

export function useUpdateInjury() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...updates }: Partial<InjuryRecord> & { id: string }) => updateInjury(id, updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['injuries'] }),
  });
}

export function usePreRaceClearance(horseId?: string) {
  return useQuery({
    queryKey: ['clearance', horseId],
    queryFn: () => fetchPreRaceClearance(horseId),
  });
}
