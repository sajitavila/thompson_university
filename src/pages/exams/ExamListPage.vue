<template>
  <q-page padding>
    <div class="row items-center q-mb-lg">
      <div class="col">
        <div class="text-h5 text-weight-bold">Examenes</div>
        <div class="text-caption text-grey-7">Programar y gestionar examenes</div>
      </div>
      <div class="col-auto">
        <q-btn color="primary" icon="add" label="Nuevo" to="/exams/new" />
      </div>
    </div>

    <q-card flat bordered>
      <TableBuilder :config="tableConfig">
        <template #column-type="{ row }">
          <q-chip :color="getTypeColor(row.type)" text-color="white" dense size="sm">
            {{ getTypeLabel(row.type) }}
          </q-chip>
        </template>
        <template #column-status="{ row }">
          <q-badge :color="getStatusColor(row.status)">
            {{ getStatusLabel(row.status) }}
          </q-badge>
        </template>
        <template #column-actions="{ row }">
          <q-btn flat round icon="edit" size="sm" :to="`/exams/${row.id}/edit`" />
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
      title="Eliminar examen"
      :message="`Desea eliminar el examen ${deletingExam?.name}?`"
      confirm-label="Eliminar"
      confirm-color="negative"
      icon="delete"
      icon-color="negative"
      @confirm="deleteExam"
    />
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useDialogMessage } from '@benjaminor-dev/quasar-app-extension-dialog-message';
import { TableBuilder, useTableBuilder } from '@benjaminor-dev/quasar-app-extension-table-builder';
import { examService } from 'src/services/exam.service';
import ConfirmDialog from 'src/components/ConfirmDialog.vue';
import type { Exam } from 'src/types';

const message = useDialogMessage();
const { defineTable } = useTableBuilder();

const showDeleteDialog = ref(false);
const deletingExam = ref<Exam | null>(null);

const tableConfig = defineTable<{ search: string }, Exam>({
  tableName: 'examsTable',
  title: 'Examenes',
  pagination: { mode: 'server', pageSize: 15 },
  columns: [
    { name: 'name', label: 'Nombre', field: 'name', align: 'left', sortable: true },
    { name: 'type', label: 'Tipo', field: 'type', align: 'center' },
    { name: 'date', label: 'Fecha', field: 'date', align: 'left', sortable: true },
    { name: 'time', label: 'Hora', field: 'time', align: 'left' },
    { name: 'location', label: 'Lugar', field: 'location', align: 'left' },
    { name: 'maxCapacity', label: 'Cupo', field: 'maxCapacity', align: 'center' },
    { name: 'status', label: 'Estado', field: 'status', align: 'center' },
    { name: 'actions', label: 'Acciones', align: 'center' },
  ],
  filters: {
    form: {
      fields: [
        { type: 'InputSearch', model: 'search', label: 'Buscar examen' },
      ],
    },
  },
  fetch: async ({ filters, page, pageSize }) => {
    const result = await examService.getAll({ search: filters.search }, page, pageSize);
    return { rows: result.items, pagination: { total: result.total, page, pageSize } };
  },
  fetchOnMount: true,
});

function getTypeColor(type: string): string {
  const colors: Record<string, string> = { cedula: 'blue', titulo: 'purple', certificado: 'teal' };
  return colors[type] || 'grey';
}

function getTypeLabel(type: string): string {
  const labels: Record<string, string> = { cedula: 'Cedula', titulo: 'Titulo', certificado: 'Certificado' };
  return labels[type] || type;
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    programado: 'info',
    en_curso: 'warning',
    finalizado: 'positive',
    cancelado: 'negative',
  };
  return colors[status] || 'grey';
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    programado: 'Programado',
    en_curso: 'En curso',
    finalizado: 'Finalizado',
    cancelado: 'Cancelado',
  };
  return labels[status] || status;
}

function confirmDelete(exam: Exam) {
  deletingExam.value = exam;
  showDeleteDialog.value = true;
}

async function deleteExam() {
  if (deletingExam.value) {
    await examService.remove(deletingExam.value.id);
    await message.success({ text: 'Examen eliminado correctamente' });
    deletingExam.value = null;
  }
}
</script>
