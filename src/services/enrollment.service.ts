import { api } from './api';
import type { PaginatedResponse } from './api';
import type { Enrollment } from 'src/types';

interface ApiResponse<T> {
  status: 'success' | 'error';
  data: T;
  message?: string;
}

export const enrollmentService = {
  async getAll(filters?: { search?: string; studentId?: string; examId?: string; status?: string }, page = 1, limit = 15): Promise<PaginatedResponse<Enrollment>> {
    const params: Record<string, unknown> = { page, limit };
    if (filters?.search) params.search = filters.search;
    if (filters?.studentId) params.studentId = filters.studentId;
    if (filters?.examId) params.examId = filters.examId;
    if (filters?.status) params.status = filters.status;
    const { data } = await api.get<PaginatedResponse<Enrollment>>('/enrollments', { params });
    return data;
  },

  async getById(id: string): Promise<Enrollment | null> {
    try {
      const { data } = await api.get<ApiResponse<Enrollment>>(`/enrollments/${id}`);
      return data.data;
    } catch {
      return null;
    }
  },

  async check(studentId: string, examId: string): Promise<boolean> {
    const { data } = await api.get<{ enrolled: boolean }>('/enrollments/check', { params: { studentId, examId } });
    return data.enrolled;
  },

  async create(enrollment: { studentId: string; examId: string }): Promise<Enrollment> {
    const { data } = await api.post<ApiResponse<Enrollment>>('/enrollments', enrollment);
    return data.data;
  },

  async update(id: string, enrollment: Partial<Enrollment>): Promise<Enrollment | null> {
    try {
      const { data } = await api.put<ApiResponse<Enrollment>>(`/enrollments/${id}`, enrollment);
      return data.data;
    } catch {
      return null;
    }
  },

  async remove(id: string): Promise<boolean> {
    try {
      await api.delete(`/enrollments/${id}`);
      return true;
    } catch {
      return false;
    }
  },
};
