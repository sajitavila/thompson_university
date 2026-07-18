import { defineStore, acceptHMRUpdate } from 'pinia';
import type { Exam } from 'src/types';
import { examService } from 'src/services/exam.service';

export const useExamStore = defineStore('exam', {
  state: () => ({
    exams: [] as Exam[],
    loaded: false,
  }),

  getters: {
    getById: (state) => (id: string) => state.exams.find((e) => e.id === id),
    scheduled: (state) => state.exams.filter((e) => e.status === 'programado'),
    finished: (state) => state.exams.filter((e) => e.status === 'finalizado'),
    byType: (state) => (type: Exam['type']) => state.exams.filter((e) => e.type === type),
    totalExams: (state) => state.exams.length,
  },

  actions: {
    async fetchExams(filters?: { search?: string; type?: string; status?: string }) {
      const result = await examService.getAll(filters);
      this.exams = result.items;
      this.loaded = true;
      return result;
    },

    async fetchScheduled() {
      const exams = await examService.getScheduled();
      this.exams = exams;
      this.loaded = true;
    },

    async addExam(data: Omit<Exam, 'id'>) {
      const exam = await examService.create(data);
      this.exams.push(exam);
      return exam;
    },

    async updateExam(id: string, data: Partial<Exam>) {
      const updated = await examService.update(id, data);
      if (updated) {
        const index = this.exams.findIndex((e) => e.id === id);
        if (index !== -1) this.exams[index] = updated;
      }
      return updated;
    },

    async deleteExam(id: string) {
      const ok = await examService.remove(id);
      if (ok) {
        this.exams = this.exams.filter((e) => e.id !== id);
      }
      return ok;
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useExamStore, import.meta.hot));
}
