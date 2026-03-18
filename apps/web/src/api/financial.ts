import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from './client';
import type {
  Expense,
  Revenue,
  Invoice,
  CostPerHorseSummary,
  CreateExpenseInput,
  CreateRevenueInput,
  CreateInvoiceInput,
  ExpenseCategory,
  InvoiceStatus,
} from '@nuestable/shared';

interface ExpenseParams {
  page?: number;
  limit?: number;
  horseId?: string;
  category?: ExpenseCategory;
  dateFrom?: string;
  dateTo?: string;
}

interface InvoiceParams {
  page?: number;
  limit?: number;
  status?: InvoiceStatus;
  recipientUserId?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

async function fetchExpenses(params: ExpenseParams): Promise<PaginatedResponse<Expense>> {
  const { data } = await apiClient.get('/financial/expenses', { params });
  return data;
}

async function createExpense(input: CreateExpenseInput): Promise<Expense> {
  const { data } = await apiClient.post('/financial/expenses', input);
  return data;
}

async function fetchRevenues(params: { horseId?: string; dateFrom?: string; dateTo?: string }): Promise<Revenue[]> {
  const { data } = await apiClient.get('/financial/revenues', { params });
  return data;
}

async function createRevenue(input: CreateRevenueInput): Promise<Revenue> {
  const { data } = await apiClient.post('/financial/revenues', input);
  return data;
}

async function fetchInvoices(params: InvoiceParams): Promise<PaginatedResponse<Invoice>> {
  const { data } = await apiClient.get('/financial/invoices', { params });
  return data;
}

async function fetchInvoice(id: string): Promise<Invoice> {
  const { data } = await apiClient.get(`/financial/invoices/${id}`);
  return data;
}

async function createInvoice(input: CreateInvoiceInput): Promise<Invoice> {
  const { data } = await apiClient.post('/financial/invoices', input);
  return data;
}

async function sendInvoice(id: string): Promise<Invoice> {
  const { data } = await apiClient.post(`/financial/invoices/${id}/send`);
  return data;
}

async function markInvoicePaid(id: string): Promise<Invoice> {
  const { data } = await apiClient.post(`/financial/invoices/${id}/mark-paid`);
  return data;
}

async function fetchCostPerHorse(params: { dateFrom?: string; dateTo?: string }): Promise<CostPerHorseSummary[]> {
  const { data } = await apiClient.get('/financial/cost-per-horse', { params });
  return data;
}

export function useExpenses(params: ExpenseParams = {}) {
  return useQuery({
    queryKey: ['expenses', params],
    queryFn: () => fetchExpenses(params),
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createExpense,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['expenses'] }),
  });
}

export function useRevenues(params: { horseId?: string; dateFrom?: string; dateTo?: string } = {}) {
  return useQuery({
    queryKey: ['revenues', params],
    queryFn: () => fetchRevenues(params),
  });
}

export function useCreateRevenue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createRevenue,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['revenues'] }),
  });
}

export function useInvoices(params: InvoiceParams = {}) {
  return useQuery({
    queryKey: ['invoices', params],
    queryFn: () => fetchInvoices(params),
  });
}

export function useInvoice(id: string | undefined) {
  return useQuery({
    queryKey: ['invoices', id],
    queryFn: () => fetchInvoice(id!),
    enabled: !!id,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createInvoice,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invoices'] }),
  });
}

export function useSendInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: sendInvoice,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invoices'] }),
  });
}

export function useMarkInvoicePaid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markInvoicePaid,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invoices'] }),
  });
}

export function useCostPerHorse(params: { dateFrom?: string; dateTo?: string } = {}) {
  return useQuery({
    queryKey: ['cost-per-horse', params],
    queryFn: () => fetchCostPerHorse(params),
  });
}
