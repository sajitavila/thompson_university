import { api } from './api';
import type { PaginatedResponse } from './api';
import type { Student } from 'src/types';

interface ApiResponse<T> {
  status: 'success' | 'error';
  data: T;
  message?: string;
}

export const studentService = {
  async getAll(search?: string, page = 1, limit = 15): Promise<PaginatedResponse<Student>> {
    const params: Record<string, unknown> = { page, limit };
    if (search) params.search = search;
    const { data } = await api.get<PaginatedResponse<Student>>('/students', { params });
    return data;
  },

  async getById(id: string): Promise<Student | null> {
    try {
      const { data } = await api.get<ApiResponse<Student>>(`/students/${id}`);
      return data.data;
    } catch {
      return null;
    }
  },

  async create(student: Omit<Student, 'id' | 'registrationDate'>): Promise<Student> {
    const { data } = await api.post<ApiResponse<Student>>('/students', student);
    return data.data;
  },

  async update(id: string, student: Partial<Student>): Promise<Student | null> {
    try {
      const { data } = await api.put<ApiResponse<Student>>(`/students/${id}`, student);
      return data.data;
    } catch {
      return null;
    }
  },

  async remove(id: string): Promise<boolean> {
    try {
      await api.delete(`/students/${id}`);
      return true;
    } catch {
      return false;
    }
  },
};
