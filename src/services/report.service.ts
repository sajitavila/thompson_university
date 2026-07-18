import { api } from './api';

interface ApiResponse<T> {
  status: 'success' | 'error';
  data: T;
  message?: string;
}

export interface ReportRow {
  student: string;
  exam: string;
  score: number;
  date: string;
}

export interface AllStudentRow {
  name: string;
  cedula: string;
  phone: string;
  email: string;
  registrationDate: string;
}

export interface PendingPaymentRow {
  id: number;
  studentId: number;
  firstName: string;
  lastName: string;
  concept: string;
  amount: number;
  paymentDate: string;
  method: string;
  status: string;
}

export interface ReportStats {
  totalStudents: number;
  totalExams: number;
  totalGrades: number;
  passedGrades: number;
  failedGrades: number;
  passRate: number;
  totalPendingPayments: number;
  totalPaidAmount: number;
}

export const reportService = {
  async getPassed(): Promise<ReportRow[]> {
    const { data } = await api.get<ApiResponse<ReportRow[]>>('/reports/passed');
    return data.data;
  },

  async getFailed(): Promise<ReportRow[]> {
    const { data } = await api.get<ApiResponse<ReportRow[]>>('/reports/failed');
    return data.data;
  },

  async getPendingPayments(): Promise<PendingPaymentRow[]> {
    const { data } = await api.get<ApiResponse<PendingPaymentRow[]>>('/reports/pending-payments');
    return data.data;
  },

  async getAllStudents(): Promise<AllStudentRow[]> {
    const { data } = await api.get<ApiResponse<AllStudentRow[]>>('/reports/all-students');
    return data.data;
  },

  async getStats(): Promise<ReportStats> {
    const { data } = await api.get<ApiResponse<ReportStats>>('/reports/stats');
    return data.data;
  },
};
