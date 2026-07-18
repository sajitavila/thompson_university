import { api } from './api';
import type { PaginatedResponse } from './api';
import type { Exam } from 'src/types';

interface ApiResponse<T> {
  status: 'success' | 'error';
  data: T;
  message?: string;
}

export const examService = {
  async getAll(filters?: { search?: string; type?: string; status?: string; dateFrom?: string; dateTo?: string }, page = 1, limit = 15): Promise<PaginatedResponse<Exam>> {
    const params: Record<string, unknown> = { page, limit };
    if (filters?.search) params.search = filters.search;
    if (filters?.type) params.type = filters.type;
    if (filters?.status) params.status = filters.status;
    if (filters?.dateFrom) params.date_from = filters.dateFrom;
    if (filters?.dateTo) params.date_to = filters.dateTo;
    const { data } = await api.get<PaginatedResponse<Exam>>('/exams', { params });
    return data;
  },

  async getById(id: string): Promise<Exam | null> {
    try {
      const { data } = await api.get<ApiResponse<Exam>>(`/exams/${id}`);
      return data.data;
    } catch {
      return null;
    }
  },

  async getScheduled(): Promise<Exam[]> {
    const { data } = await api.get<ApiResponse<Exam[]>>('/exams/scheduled');
    return data.data;
  },

  async create(exam: Omit<Exam, 'id'>): Promise<Exam> {
    const { data } = await api.post<ApiResponse<Exam>>('/exams', exam);
    return data.data;
  },

  async update(id: string, exam: Partial<Exam>): Promise<Exam | null> {
    try {
      const { data } = await api.put<ApiResponse<Exam>>(`/exams/${id}`, exam);
      return data.data;
    } catch {
      return null;
    }
  },

  async remove(id: string): Promise<boolean> {
    try {
      await api.delete(`/exams/${id}`);
      return true;
    } catch {
      return false;
    }
  },
};
