import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from './client';
import type {
  Task,
  TaskStatus,
  ChecklistInstance,
  ChecklistTemplate,
  FeedLog,
  TherapyLog,
  Barn,
  CreateTaskInput,
  CreateFeedLogInput,
  CreateTherapyLogInput,
} from '@nuestable/shared';

interface TaskListParams {
  page?: number;
  limit?: number;
  status?: TaskStatus;
  assigneeId?: string;
  horseId?: string;
  date?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Tasks
async function fetchTasks(params: TaskListParams): Promise<PaginatedResponse<Task>> {
  const { data } = await apiClient.get('/operations/tasks', { params });
  return data;
}

async function createTask(input: CreateTaskInput): Promise<Task> {
  const { data } = await apiClient.post('/operations/tasks', input);
  return data;
}

async function updateTaskStatus(id: string, status: TaskStatus): Promise<Task> {
  const { data } = await apiClient.patch(`/operations/tasks/${id}`, { status });
  return data;
}

// Checklists
async function fetchChecklists(date?: string): Promise<ChecklistInstance[]> {
  const { data } = await apiClient.get('/operations/checklists', { params: { date } });
  return data;
}

async function fetchChecklistTemplates(): Promise<ChecklistTemplate[]> {
  const { data } = await apiClient.get('/operations/checklists/templates');
  return data;
}

async function completeChecklistItem(instanceId: string, itemId: string): Promise<ChecklistInstance> {
  const { data } = await apiClient.post(`/operations/checklists/${instanceId}/items/${itemId}/complete`);
  return data;
}

// Feed logs
async function fetchFeedLogs(params: { horseId?: string; date?: string }): Promise<FeedLog[]> {
  const { data } = await apiClient.get('/operations/feed-logs', { params });
  return data;
}

async function createFeedLog(input: CreateFeedLogInput): Promise<FeedLog> {
  const { data } = await apiClient.post('/operations/feed-logs', input);
  return data;
}

// Therapy logs
async function fetchTherapyLogs(params: { horseId?: string; date?: string }): Promise<TherapyLog[]> {
  const { data } = await apiClient.get('/operations/therapy-logs', { params });
  return data;
}

async function createTherapyLog(input: CreateTherapyLogInput): Promise<TherapyLog> {
  const { data } = await apiClient.post('/operations/therapy-logs', input);
  return data;
}

// Barns
async function fetchBarns(): Promise<Barn[]> {
  const { data } = await apiClient.get('/operations/barns');
  return data;
}

export function useTasks(params: TaskListParams = {}) {
  return useQuery({
    queryKey: ['tasks', params],
    queryFn: () => fetchTasks(params),
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTask,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });
}

export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) => updateTaskStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });
}

export function useChecklists(date?: string) {
  return useQuery({
    queryKey: ['checklists', date],
    queryFn: () => fetchChecklists(date),
  });
}

export function useChecklistTemplates() {
  return useQuery({
    queryKey: ['checklists', 'templates'],
    queryFn: fetchChecklistTemplates,
  });
}

export function useCompleteChecklistItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ instanceId, itemId }: { instanceId: string; itemId: string }) =>
      completeChecklistItem(instanceId, itemId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['checklists'] }),
  });
}

export function useFeedLogs(params: { horseId?: string; date?: string } = {}) {
  return useQuery({
    queryKey: ['feed-logs', params],
    queryFn: () => fetchFeedLogs(params),
  });
}

export function useCreateFeedLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createFeedLog,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['feed-logs'] }),
  });
}

export function useTherapyLogs(params: { horseId?: string; date?: string } = {}) {
  return useQuery({
    queryKey: ['therapy-logs', params],
    queryFn: () => fetchTherapyLogs(params),
  });
}

export function useCreateTherapyLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTherapyLog,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['therapy-logs'] }),
  });
}

export function useBarns() {
  return useQuery({
    queryKey: ['barns'],
    queryFn: fetchBarns,
  });
}
