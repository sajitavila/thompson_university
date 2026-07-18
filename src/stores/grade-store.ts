import { defineStore, acceptHMRUpdate } from 'pinia';
import type { Grade } from 'src/types';
import { gradeService } from 'src/services/grade.service';

export const useGradeStore = defineStore('grade', {
  state: () => ({
    grades: [] as Grade[],
    loaded: false,
  }),

  getters: {
    getById: (state) => (id: string) => state.grades.find((g) => g.id === id),
    byEnrollment: (state) => (enrollmentId: string) =>
      state.grades.find((g) => g.enrollmentId === enrollmentId),
    byStudent: (state) => (studentId: string) =>
      state.grades.filter((g) => g.studentId === studentId),
    byExam: (state) => (examId: string) => state.grades.filter((g) => g.examId === examId),
    passed: (state) => state.grades.filter((g) => g.passed),
    failed: (state) => state.grades.filter((g) => !g.passed),
    totalGrades: (state) => state.grades.length,
    passRate: (state) => {
      if (state.grades.length === 0) return 0;
      const passedCount = state.grades.filter((g) => g.passed).length;
      return Math.round((passedCount / state.grades.length) * 100);
    },
  },

  actions: {
    async fetchGrades(filters?: { search?: string; studentId?: string; examId?: string; passed?: string }) {
      const result = await gradeService.getAll(filters);
      this.grades = result.items;
      this.loaded = true;
      return result;
    },

    async addGrade(data: { enrollmentId: string; score: number; gradedDate: string; studentId?: string; examId?: string }) {
      const grade = await gradeService.create(data);
      this.grades.push(grade);
      return grade;
    },

    async updateGrade(id: string, data: Partial<Grade>) {
      const updated = await gradeService.update(id, data);
      if (updated) {
        const index = this.grades.findIndex((g) => g.id === id);
        if (index !== -1) this.grades[index] = updated;
      }
      return updated;
    },

    async deleteGrade(id: string) {
      const ok = await gradeService.remove(id);
      if (ok) {
        this.grades = this.grades.filter((g) => g.id !== id);
      }
      return ok;
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useGradeStore, import.meta.hot));
}
