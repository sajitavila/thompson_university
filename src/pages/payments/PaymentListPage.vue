<template>
  <q-page padding>
    <div class="row items-center q-mb-lg">
      <div class="col">
        <div class="text-h5 text-weight-bold">Pagos</div>
        <div class="text-caption text-grey-7">Control de pagos de estudiantes</div>
      </div>
      <div class="col-auto">
        <q-btn color="primary" icon="add" label="Nuevo pago" to="/payments/new" />
      </div>
    </div>

    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-sm-4">
        <StatsCard
          label="Total recaudado"
          :value="`$${summary.totalPaid}`"
          icon="paid"
          color="positive"
        />
      </div>
      <div class="col-12 col-sm-4">
        <StatsCard
          label="Pendiente"
          :value="`$${summary.totalPending}`"
          icon="pending_actions"
          color="warning"
        />
      </div>
      <div class="col-12 col-sm-4">
        <StatsCard
          label="Total pagos"
          :value="summary.totalPayments"
          icon="receipt_long"
          color="primary"
        />
      </div>
    </div>

    <q-card flat bordered>
      <TableBuilder :config="tableConfig">
        <template #column-student="{ row }">
          {{ row.firstName }} {{ row.lastName }}
        </template>
        <template #column-concept="{ row }">
          <q-chip :color="getConceptColor(row.concept)" text-color="white" dense size="sm">
            {{ getConceptLabel(row.concept) }}
          </q-chip>
        </template>
        <template #column-amount="{ row }">
          <span class="text-weight-bold">${{ row.amount }}</span>
        </template>
        <template #column-status="{ row }">
          <q-badge :color="row.status === 'pagado' ? 'positive' : 'warning'">
            {{ row.status === 'pagado' ? 'Pagado' : 'Pendiente' }}
          </q-badge>
        </template>
        <template #column-actions="{ row }">
          <q-btn flat round icon="edit" size="sm" :to="`/payments/${row.id}/edit`" />
          <q-btn
            flat
            round
            icon="delete"
            size="sm"
            color="negative"
            @click="confirmDelete(row)"
          />
        </template>
      </TableBuilder>
    </q-card>

    <ConfirmDialog
      v-model="showDeleteDialog"
      title="Eliminar pago"
      message="Desea eliminar este registro de pago?"
      confirm-label="Eliminar"
      confirm-color="negative"
      icon="delete"
      icon-color="negative"
      @confirm="deletePayment"
    />
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useDialogMessage } from '@benjaminor-dev/quasar-app-extension-dialog-message';
import { TableBuilder, useTableBuilder } from '@benjaminor-dev/quasar-app-extension-table-builder';
import { paymentService } from 'src/services/payment.service';
import StatsCard from 'src/components/StatsCard.vue';
import ConfirmDialog from 'src/components/ConfirmDialog.vue';
import type { Payment } from 'src/types';

const message = useDialogMessage();
const { defineTable } = useTableBuilder();

const showDeleteDialog = ref(false);
const deletingPayment = ref<Payment | null>(null);

const summary = ref({ totalPaid: 0, totalPending: 0, totalPayments: 0 });

onMounted(async () => {
  const s = await paymentService.getSummary();
  summary.value = { totalPaid: s.totalPaid, totalPending: s.totalPending, totalPayments: s.countPending + s.countPaid };
});

const tableConfig = defineTable<{ search: string; concept: string | null; status: string | null }, Payment>({
  tableName: 'paymentsTable',
  title: 'Pagos',
  pagination: { mode: 'server', pageSize: 15 },
  columns: [
    { name: 'student', label: 'Estudiante', field: 'studentId', align: 'left' },
    { name: 'concept', label: 'Concepto', field: 'concept', align: 'center' },
    { name: 'amount', label: 'Monto', field: 'amount', align: 'right', sortable: true },
    { name: 'method', label: 'Metodo', field: 'method', align: 'left' },
    { name: 'date', label: 'Fecha', field: 'paymentDate', align: 'left', sortable: true },
    { name: 'status', label: 'Estado', field: 'status', align: 'center' },
    { name: 'actions', label: 'Acciones', align: 'center' },
  ],
  filters: {
    form: {
      fields: [
        { type: 'InputSearch', model: 'search', label: 'Buscar por estudiante' },
        {
          type: 'InputSelect',
          model: 'concept',
          label: 'Concepto',
          props: {
            options: [
              { label: 'Inscripcion', value: 'inscripcion' },
              { label: 'Examen', value: 'examen' },
              { label: 'Certificado', value: 'certificado' },
              { label: 'Reposicion', value: 'reposicion' },
            ],
            clearable: true,
          },
        },
        {
          type: 'InputSelect',
          model: 'status',
          label: 'Estado',
          props: {
            options: [
              { label: 'Pagado', value: 'pagado' },
              { label: 'Pendiente', value: 'pendiente' },
            ],
            clearable: true,
          },
        },
      ],
    },
  },
  fetch: async ({ filters, page, pageSize }) => {
    const result = await paymentService.getAll({
      search: filters.search,
      ...filters.concept != null ? { concept: filters.concept } : {},
      ...filters.status != null ? { status: filters.status } : {},
    }, page, pageSize);
    return { rows: result.items, pagination: { total: result.total, page, pageSize } };
  },
  fetchOnMount: true,
});

function getConceptColor(concept: string): string {
  const colors: Record<string, string> = {
    inscripcion: 'blue',
    examen: 'purple',
    certificado: 'teal',
    reposicion: 'orange',
  };
  return colors[concept] || 'grey';
}

function getConceptLabel(concept: string): string {
  const labels: Record<string, string> = {
    inscripcion: 'Inscripcion',
    examen: 'Examen',
    certificado: 'Certificado',
    reposicion: 'Reposicion',
  };
  return labels[concept] || concept;
}

function confirmDelete(payment: Payment) {
  deletingPayment.value = payment;
  showDeleteDialog.value = true;
}

async function deletePayment() {
  if (deletingPayment.value) {
    await paymentService.remove(deletingPayment.value.id);
    await message.success({ text: 'Pago eliminado correctamente' });
    deletingPayment.value = null;
  }
}
</script>
