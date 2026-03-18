import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from './client';
import type { Horse, HorseListItem, CreateHorseInput, UpdateHorseInput, HorseStatus } from '@nuestable/shared';

interface HorseListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: HorseStatus;
  trainerId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

async function fetchHorses(params: HorseListParams): Promise<PaginatedResponse<HorseListItem>> {
  const { data } = await apiClient.get('/horses', { params });
  return data;
}

async function fetchHorse(id: string): Promise<Horse> {
  const { data } = await apiClient.get(`/horses/${id}`);
  return data;
}

async function createHorse(input: CreateHorseInput): Promise<Horse> {
  const { data } = await apiClient.post('/horses', input);
  return data;
}

async function updateHorse(input: UpdateHorseInput): Promise<Horse> {
  const { id, ...body } = input;
  const { data } = await apiClient.patch(`/horses/${id}`, body);
  return data;
}

async function deleteHorse(id: string): Promise<void> {
  await apiClient.delete(`/horses/${id}`);
}

export function useHorses(params: HorseListParams = {}) {
  return useQuery({
    queryKey: ['horses', params],
    queryFn: () => fetchHorses(params),
  });
}

export function useHorse(id: string | undefined) {
  return useQuery({
    queryKey: ['horses', id],
    queryFn: () => fetchHorse(id!),
    enabled: !!id,
  });
}

export function useCreateHorse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createHorse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['horses'] });
    },
  });
}

export function useUpdateHorse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateHorse,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['horses'] });
      queryClient.setQueryData(['horses', data.id], data);
    },
  });
}

export function useDeleteHorse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteHorse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['horses'] });
    },
  });
}
