import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from './client';
import type {
  Document,
  DocumentListItem,
  DocumentCategory,
  DocumentStatus,
  UploadDocumentInput,
  VerifyDocumentInput,
} from '@nuestable/shared';

interface DocumentListParams {
  page?: number;
  limit?: number;
  category?: DocumentCategory;
  status?: DocumentStatus;
  horseId?: string;
  search?: string;
  expiringWithinDays?: number;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface ExpiryTrackerItem {
  horseId: string;
  horseName: string;
  documents: {
    category: DocumentCategory;
    status: 'valid' | 'expiring_soon' | 'expired' | 'missing';
    expiresAt: string | null;
    documentId: string | null;
  }[];
}

async function fetchDocuments(params: DocumentListParams): Promise<PaginatedResponse<DocumentListItem>> {
  const { data } = await apiClient.get('/documents', { params });
  return data;
}

async function fetchDocument(id: string): Promise<Document> {
  const { data } = await apiClient.get(`/documents/${id}`);
  return data;
}

async function uploadDocument(input: UploadDocumentInput): Promise<Document> {
  const { data } = await apiClient.post('/documents', input);
  return data;
}

async function uploadFile(file: File): Promise<{ url: string; fileType: string; fileSizeBytes: number }> {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await apiClient.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

async function verifyDocument(input: VerifyDocumentInput): Promise<Document> {
  const { data } = await apiClient.post(`/documents/${input.documentId}/verify`, input);
  return data;
}

async function fetchExpiryTracker(): Promise<ExpiryTrackerItem[]> {
  const { data } = await apiClient.get('/documents/expiry-tracker');
  return data;
}

export function useDocuments(params: DocumentListParams = {}) {
  return useQuery({
    queryKey: ['documents', params],
    queryFn: () => fetchDocuments(params),
  });
}

export function useDocument(id: string | undefined) {
  return useQuery({
    queryKey: ['documents', id],
    queryFn: () => fetchDocument(id!),
    enabled: !!id,
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}

export function useUploadFile() {
  return useMutation({
    mutationFn: uploadFile,
  });
}

export function useVerifyDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: verifyDocument,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.setQueryData(['documents', data.id], data);
    },
  });
}

export function useExpiryTracker() {
  return useQuery({
    queryKey: ['documents', 'expiry-tracker'],
    queryFn: fetchExpiryTracker,
  });
}
