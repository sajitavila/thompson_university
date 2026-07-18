<template>
  <q-page padding>
    <div class="q-mb-lg">
      <div class="text-h5 text-weight-bold">Reportes</div>
      <div class="text-caption text-grey-7">Consultas y reportes del sistema</div>
    </div>

    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-sm-4">
        <q-card flat bordered class="cursor-pointer" @click="activeTab = 'passed'">
          <q-card-section class="text-center">
            <q-icon name="emoji_events" size="48px" color="positive" />
            <div class="text-subtitle1 text-weight-bold q-mt-sm">Aprobados</div>
            <div class="text-h5 text-positive">{{ reportStats.passedCount }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-4">
        <q-card flat bordered class="cursor-pointer" @click="activeTab = 'pending'">
          <q-card-section class="text-center">
            <q-icon name="pending_actions" size="48px" color="warning" />
            <div class="text-subtitle1 text-weight-bold q-mt-sm">Pagos pendientes</div>
            <div class="text-h5 text-warning">{{ reportStats.pendingCount }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-4">
        <q-card flat bordered class="cursor-pointer" @click="activeTab = 'all'">
          <q-card-section class="text-center">
            <q-icon name="people" size="48px" color="primary" />
            <div class="text-subtitle1 text-weight-bold q-mt-sm">Total estudiantes</div>
            <div class="text-h5 text-primary">{{ reportStats.totalStudents }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <q-card flat bordered>
      <q-tabs v-model="activeTab" class="text-primary" align="left">
        <q-tab name="passed" label="Aprobados" icon="check_circle" />
        <q-tab name="failed" label="Reprobados" icon="cancel" />
        <q-tab name="pending" label="Pagos pendientes" icon="pending_actions" />
        <q-tab name="all" label="Todos los estudiantes" icon="people" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="activeTab" animated>
        <q-tab-panel name="passed">
          <TableBuilder :config="passedConfig" />
        </q-tab-panel>

        <q-tab-panel name="failed">
          <TableBuilder :config="failedConfig" />
        </q-tab-panel>

        <q-tab-panel name="pending">
          <TableBuilder :config="pendingConfig">
            <template #column-student="{ row }">
              {{ row.firstName }} {{ row.lastName }}
            </template>
          </TableBuilder>
        </q-tab-panel>

        <q-tab-panel name="all">
          <TableBuilder :config="allStudentsConfig" />
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { TableBuilder, useTableBuilder } from '@benjaminor-dev/quasar-app-extension-table-builder';
import { reportService } from 'src/services/report.service';

const { defineTable } = useTableBuilder();

const activeTab = ref('passed');
const reportStats = ref({ passedCount: 0, pendingCount: 0, totalStudents: 0 });

onMounted(async () => {
  const stats = await reportService.getStats();
  reportStats.value = { passedCount: stats.passedGrades, pendingCount: stats.totalPendingPayments, totalStudents: stats.totalStudents };
});

const passedConfig = defineTable<Record<string, never>, { student: string; exam: string; score: number; date: string }>({
  tableName: 'passedReportTable',
  columns: [
    { name: 'student', label: 'Estudiante', field: 'student', align: 'left', sortable: true },
    { name: 'exam', label: 'Examen', field: 'exam', align: 'left' },
    { name: 'score', label: 'Calificacion', field: 'score', align: 'center', sortable: true },
    { name: 'date', label: 'Fecha', field: 'date', align: 'left' },
  ],
  filters: false,
  fetch: async () => {
    const items = await reportService.getPassed();
    return { rows: items, pagination: { total: items.length, page: 1, pageSize: items.length } };
  },
  fetchOnMount: true,
});

const failedConfig = defineTable<Record<string, never>, { student: string; exam: string; score: number; date: string }>({
  tableName: 'failedReportTable',
  columns: [
    { name: 'student', label: 'Estudiante', field: 'student', align: 'left', sortable: true },
    { name: 'exam', label: 'Examen', field: 'exam', align: 'left' },
    { name: 'score', label: 'Calificacion', field: 'score', align: 'center', sortable: true },
    { name: 'date', label: 'Fecha', field: 'date', align: 'left' },
  ],
  filters: false,
  fetch: async () => {
    const items = await reportService.getFailed();
    return { rows: items, pagination: { total: items.length, page: 1, pageSize: items.length } };
  },
  fetchOnMount: true,
});

const pendingConfig = defineTable<Record<string, never>, { id: number; studentId: number; firstName: string; lastName: string; concept: string; amount: number; paymentDate: string }>({
  tableName: 'pendingPaymentsReportTable',
  columns: [
    { name: 'student', label: 'Estudiante', field: 'studentId', align: 'left', sortable: true },
    { name: 'concept', label: 'Concepto', field: 'concept', align: 'left' },
    { name: 'amount', label: 'Monto', field: 'amount', align: 'right', sortable: true },
    { name: 'date', label: 'Fecha', field: 'paymentDate', align: 'left' },
  ],
  filters: false,
  fetch: async () => {
    const items = await reportService.getPendingPayments();
    return { rows: items, pagination: { total: items.length, page: 1, pageSize: items.length } };
  },
  fetchOnMount: true,
});

const allStudentsConfig = defineTable<Record<string, never>, { name: string; cedula: string; phone: string; email: string; registrationDate: string }>({
  tableName: 'allStudentsReportTable',
  columns: [
    { name: 'name', label: 'Nombre', field: 'name', align: 'left', sortable: true },
    { name: 'cedula', label: 'Cedula', field: 'cedula', align: 'left' },
    { name: 'phone', label: 'Telefono', field: 'phone', align: 'left' },
    { name: 'email', label: 'Email', field: 'email', align: 'left' },
    { name: 'registrationDate', label: 'Registro', field: 'registrationDate', align: 'left' },
  ],
  filters: false,
  fetch: async () => {
    const items = await reportService.getAllStudents();
    return { rows: items, pagination: { total: items.length, page: 1, pageSize: items.length } };
  },
  fetchOnMount: true,
});
</script>
