import { defineStore, acceptHMRUpdate } from 'pinia';
import type { Payment } from 'src/types';
import { paymentService } from 'src/services/payment.service';

export const usePaymentStore = defineStore('payment', {
  state: () => ({
    payments: [] as Payment[],
    loaded: false,
  }),

  getters: {
    getById: (state) => (id: string) => state.payments.find((p) => p.id === id),
    byStudent: (state) => (studentId: string) =>
      state.payments.filter((p) => p.studentId === studentId),
    pending: (state) => state.payments.filter((p) => p.status === 'pendiente'),
    paid: (state) => state.payments.filter((p) => p.status === 'pagado'),
    totalPending: (state) =>
      state.payments
        .filter((p) => p.status === 'pendiente')
        .reduce((sum, p) => sum + p.amount, 0),
    totalPaid: (state) =>
      state.payments
        .filter((p) => p.status === 'pagado')
        .reduce((sum, p) => sum + p.amount, 0),
    totalPayments: (state) => state.payments.length,
  },

  actions: {
    async fetchPayments(filters?: { search?: string; studentId?: string; concept?: string; status?: string }) {
      const result = await paymentService.getAll(filters);
      this.payments = result.items;
      this.loaded = true;
      return result;
    },

    async addPayment(data: Omit<Payment, 'id'>) {
      const payment = await paymentService.create(data);
      this.payments.push(payment);
      return payment;
    },

    async updatePayment(id: string, data: Partial<Payment>) {
      const updated = await paymentService.update(id, data);
      if (updated) {
        const index = this.payments.findIndex((p) => p.id === id);
        if (index !== -1) this.payments[index] = updated;
      }
      return updated;
    },

    async deletePayment(id: string) {
      const ok = await paymentService.remove(id);
      if (ok) {
        this.payments = this.payments.filter((p) => p.id !== id);
      }
      return ok;
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(usePaymentStore, import.meta.hot));
}
