import { defineStore, acceptHMRUpdate } from 'pinia';
import type { Student } from 'src/types';
import { studentService } from 'src/services/student.service';

export const useStudentStore = defineStore('student', {
  state: () => ({
    students: [] as Student[],
    loaded: false,
  }),

  getters: {
    getById: (state) => (id: string) => state.students.find((s) => s.id === id),
    searchByName: (state) => (query: string) => {
      const q = query.toLowerCase();
      return state.students.filter(
        (s) =>
          s.firstName.toLowerCase().includes(q) ||
          s.lastName.toLowerCase().includes(q) ||
          s.cedula.includes(q)
      );
    },
    totalStudents: (state) => state.students.length,
  },

  actions: {
    async fetchStudents(search?: string) {
      const result = await studentService.getAll(search);
      this.students = result.items;
      this.loaded = true;
      return result;
    },

    async addStudent(data: Omit<Student, 'id' | 'registrationDate'>) {
      const student = await studentService.create(data);
      this.students.push(student);
      return student;
    },

    async updateStudent(id: string, data: Partial<Student>) {
      const updated = await studentService.update(id, data);
      if (updated) {
        const index = this.students.findIndex((s) => s.id === id);
        if (index !== -1) this.students[index] = updated;
      }
      return updated;
    },

    async deleteStudent(id: string) {
      const ok = await studentService.remove(id);
      if (ok) {
        this.students = this.students.filter((s) => s.id !== id);
      }
      return ok;
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useStudentStore, import.meta.hot));
}
