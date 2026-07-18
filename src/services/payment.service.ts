import { api } from './api';
import type { PaginatedResponse } from './api';
import type { Payment } from 'src/types';

interface ApiResponse<T> {
  status: 'success' | 'error';
  data: T;
  message?: string;
}

export interface PaymentSummary {
  totalPending: number;
  totalPaid: number;
  countPending: number;
  countPaid: number;
}

export const paymentService = {
  async getAll(filters?: { search?: string; studentId?: string; concept?: string; status?: string }, page = 1, limit = 15): Promise<PaginatedResponse<Payment>> {
    const params: Record<string, unknown> = { page, limit };
    if (filters?.search) params.search = filters.search;
    if (filters?.studentId) params.studentId = filters.studentId;
    if (filters?.concept) params.concept = filters.concept;
    if (filters?.status) params.status = filters.status;
    const { data } = await api.get<PaginatedResponse<Payment>>('/payments', { params });
    return data;
  },

  async getById(id: string): Promise<Payment | null> {
    try {
      const { data } = await api.get<ApiResponse<Payment>>(`/payments/${id}`);
      return data.data;
    } catch {
      return null;
    }
  },

  async getSummary(): Promise<PaymentSummary> {
    const { data } = await api.get<ApiResponse<PaymentSummary>>('/payments/summary');
    return data.data;
  },

  async create(payment: Omit<Payment, 'id'>): Promise<Payment> {
    const { data } = await api.post<ApiResponse<Payment>>('/payments', payment);
    return data.data;
  },

  async update(id: string, payment: Partial<Payment>): Promise<Payment | null> {
    try {
      const { data } = await api.put<ApiResponse<Payment>>(`/payments/${id}`, payment);
      return data.data;
    } catch {
      return null;
    }
  },

  async remove(id: string): Promise<boolean> {
    try {
      await api.delete(`/payments/${id}`);
      return true;
    } catch {
      return false;
    }
  },
};
