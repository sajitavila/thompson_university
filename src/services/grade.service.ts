import { api } from './api';
import type { PaginatedResponse } from './api';
import type { Grade } from 'src/types';

interface ApiResponse<T> {
  status: 'success' | 'error';
  data: T;
  message?: string;
}

export const gradeService = {
  async getAll(filters?: { search?: string; studentId?: string; examId?: string; passed?: string }, page = 1, limit = 15): Promise<PaginatedResponse<Grade>> {
    const params: Record<string, unknown> = { page, limit };
    if (filters?.search) params.search = filters.search;
    if (filters?.studentId) params.studentId = filters.studentId;
    if (filters?.examId) params.examId = filters.examId;
    if (filters?.passed !== undefined) params.passed = filters.passed;
    const { data } = await api.get<PaginatedResponse<Grade>>('/grades', { params });
    return data;
  },

  async getById(id: string): Promise<Grade | null> {
    try {
      const { data } = await api.get<ApiResponse<Grade>>(`/grades/${id}`);
      return data.data;
    } catch {
      return null;
    }
  },

  async create(grade: { enrollmentId: string; score: number; gradedDate: string }): Promise<Grade> {
    const { data } = await api.post<ApiResponse<Grade>>('/grades', grade);
    return data.data;
  },

  async update(id: string, grade: Partial<Grade>): Promise<Grade | null> {
    try {
      const { data } = await api.put<ApiResponse<Grade>>(`/grades/${id}`, grade);
      return data.data;
    } catch {
      return null;
    }
  },

  async remove(id: string): Promise<boolean> {
    try {
      await api.delete(`/grades/${id}`);
      return true;
    } catch {
      return false;
    }
  },
};
