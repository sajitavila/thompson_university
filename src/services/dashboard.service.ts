import { api } from './api';
import type { Exam, Grade } from 'src/types';

interface ApiResponse<T> {
  status: 'success' | 'error';
  data: T;
  message?: string;
}

export interface DashboardData {
  stats: {
    totalStudents: number;
    totalExams: number;
    passedGrades: number;
    pendingPayments: number;
  };
  recentGrades: Grade[];
  scheduledExams: Exam[];
}

export const dashboardService = {
  async getData(): Promise<DashboardData> {
    const { data } = await api.get<ApiResponse<DashboardData>>('/dashboard');
    return data.data;
  },
};
