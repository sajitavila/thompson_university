import { defineStore, acceptHMRUpdate } from 'pinia';
import type { Enrollment } from 'src/types';
import { enrollmentService } from 'src/services/enrollment.service';

export const useEnrollmentStore = defineStore('enrollment', {
  state: () => ({
    enrollments: [] as Enrollment[],
    loaded: false,
  }),

  getters: {
    getById: (state) => (id: string) => state.enrollments.find((e) => e.id === id),
    byStudent: (state) => (studentId: string) =>
      state.enrollments.filter((e) => e.studentId === studentId),
    byExam: (state) => (examId: string) =>
      state.enrollments.filter((e) => e.examId === examId),
    active: (state) => state.enrollments.filter((e) => e.status === 'inscrito'),
    totalEnrollments: (state) => state.enrollments.length,
    isStudentEnrolled: (state) => (studentId: string, examId: string) =>
      state.enrollments.some(
        (e) => e.studentId === studentId && e.examId === examId && e.status === 'inscrito'
      ),
  },

  actions: {
    async fetchEnrollments(filters?: { search?: string; studentId?: string; examId?: string; status?: string }) {
      const result = await enrollmentService.getAll(filters);
      this.enrollments = result.items;
      this.loaded = true;
      return result;
    },

    async addEnrollment(data: { studentId: string; examId: string; status?: string }) {
      const enrollment = await enrollmentService.create(data);
      this.enrollments.push(enrollment);
      return enrollment;
    },

    async updateEnrollment(id: string, data: Partial<Enrollment>) {
      const updated = await enrollmentService.update(id, data);
      if (updated) {
        const index = this.enrollments.findIndex((e) => e.id === id);
        if (index !== -1) this.enrollments[index] = updated;
      }
      return updated;
    },

    async deleteEnrollment(id: string) {
      const ok = await enrollmentService.remove(id);
      if (ok) {
        this.enrollments = this.enrollments.filter((e) => e.id !== id);
      }
      return ok;
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useEnrollmentStore, import.meta.hot));
}
