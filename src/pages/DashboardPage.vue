<template>
  <q-page padding>
    <div class="q-mb-lg">
      <div class="text-h5 text-weight-bold">Dashboard</div>
      <div class="text-caption text-grey-7">Resumen general del sistema</div>
    </div>

    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-sm-6 col-md-3">
        <StatsCard
          label="Estudiantes"
          :value="stats.totalStudents"
          icon="people"
          color="primary"
        />
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <StatsCard
          label="Examenes programados"
          :value="stats.totalExams"
          icon="assignment"
          color="secondary"
        />
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <StatsCard
          label="Aprobados"
          :value="stats.passedGrades"
          icon="emoji_events"
          color="positive"
        />
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <StatsCard
          label="Pagos pendientes"
          :value="stats.pendingPayments"
          icon="pending_actions"
          color="warning"
        />
      </div>
    </div>

    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-7">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-subtitle1 text-weight-bold">Examenes proximos</div>
          </q-card-section>
          <q-separator />
          <TableBuilder :config="examsConfig">
            <template #column-type="{ row }">
              <q-chip :color="getTypeColor(row.type)" text-color="white" dense size="sm">
                {{ getTypeLabel(row.type) }}
              </q-chip>
            </template>
            <template #column-status="{ row }">
              <q-badge :color="getStatusColor(row.status)">
                {{ row.status }}
              </q-badge>
            </template>
          </TableBuilder>
        </q-card>
      </div>

      <div class="col-12 col-md-5">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-subtitle1 text-weight-bold">Ultimas calificaciones</div>
          </q-card-section>
          <q-separator />
          <q-list>
            <q-item v-for="grade in recentGrades" :key="grade.id">
              <q-item-section avatar>
                <q-avatar :color="grade.passed ? 'positive' : 'negative'" text-color="white" size="sm">
                  {{ grade.score }}
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ getStudentName(grade.studentId) }}</q-item-label>
                <q-item-label caption>{{ getExamName(grade.examId) }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-badge :color="grade.passed ? 'positive' : 'negative'">
                  {{ grade.passed ? 'Aprobado' : 'Reprobado' }}
                </q-badge>
              </q-item-section>
            </q-item>
            <q-item v-if="recentGrades.length === 0">
              <q-item-section class="text-grey-5 text-center">
                No hay calificaciones registradas
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>

        <q-card flat bordered class="q-mt-md">
          <q-card-section>
            <div class="text-subtitle1 text-weight-bold">Resumen financiero</div>
          </q-card-section>
          <q-separator />
          <q-card-section>
            <div class="row q-col-gutter-sm">
              <div class="col-6">
                <div class="text-caption text-grey-7">Total recaudado</div>
                <div class="text-h6 text-positive">${{ paymentStore.totalPaid }}</div>
              </div>
              <div class="col-6">
                <div class="text-caption text-grey-7">Pendiente por cobrar</div>
                <div class="text-h6 text-warning">${{ paymentStore.totalPending }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import StatsCard from 'src/components/StatsCard.vue';
import { TableBuilder, useTableBuilder } from '@benjaminor-dev/quasar-app-extension-table-builder';
import { useStudentStore } from 'src/stores/student-store';
import { useExamStore } from 'src/stores/exam-store';
import { useGradeStore } from 'src/stores/grade-store';
import { usePaymentStore } from 'src/stores/payment-store';
import { dashboardService } from 'src/services/dashboard.service';
import { studentService } from 'src/services/student.service';
import { examService } from 'src/services/exam.service';
import { gradeService } from 'src/services/grade.service';
import { paymentService } from 'src/services/payment.service';
import type { Exam } from 'src/types';

const studentStore = useStudentStore();
const examStore = useExamStore();
const gradeStore = useGradeStore();
const paymentStore = usePaymentStore();
const { defineTable } = useTableBuilder();

const stats = ref({ totalStudents: 0, totalExams: 0, passedGrades: 0, pendingPayments: 0 });
const recentGrades = ref<{ id: string; studentId: string; examId: string; score: number; passed: boolean; gradedDate: string }[]>([]);

void studentService.getAll('', 1, 100).then((r) => { studentStore.students = r.items; });
void examService.getAll({}, 1, 100).then((r) => { examStore.exams = r.items; });
void gradeService.getAll({}, 1, 100).then((r) => { gradeStore.grades = r.items; });
void paymentService.getAll({}, 1, 100).then((r) => { paymentStore.payments = r.items; });

onMounted(async () => {
  const data = await dashboardService.getData();
  stats.value = data.stats;
  recentGrades.value = data.recentGrades;
});

const examsConfig = defineTable<Record<string, never>, Exam>({
  tableName: 'dashboardExamsTable',
  columns: [
    { name: 'name', label: 'Nombre', field: 'name', align: 'left' },
    { name: 'type', label: 'Tipo', field: 'type', align: 'center' },
    { name: 'date', label: 'Fecha', field: 'date', align: 'left' },
    { name: 'status', label: 'Estado', field: 'status', align: 'center' },
  ],
  filters: false,
  fetch: async () => {
    const data = await dashboardService.getData();
    const items = data.scheduledExams;
    return { rows: items, pagination: { total: items.length, page: 1, pageSize: items.length } };
  },
  fetchOnMount: true,
});

function getStudentName(id: string): string {
  const s = studentStore.getById(id);
  return s ? `${s.firstName} ${s.lastName}` : 'Desconocido';
}

function getExamName(id: string): string {
  const e = examStore.getById(id);
  return e ? e.name : 'Desconocido';
}

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
</script>
