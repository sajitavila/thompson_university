<template>
  <q-page padding>
    <div class="q-mb-lg">
      <div class="text-h5 text-weight-bold">Inscripciones</div>
      <div class="text-caption text-grey-7">Inscribir estudiantes a examenes</div>
    </div>

    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-5">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-subtitle1 text-weight-bold q-mb-md">Nueva inscripcion</div>
            <FormBuilder :config="enrollConfig" @submit="onEnrollSubmit">
              <template #slot-field-actions>
                <q-btn type="submit" color="primary" label="Inscribir" class="full-width" />
              </template>
            </FormBuilder>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-7">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-subtitle1 text-weight-bold">Inscripciones activas</div>
          </q-card-section>
          <q-separator />
          <TableBuilder :config="tableConfig">
            <template #column-status="{ row }">
              <q-badge :color="getEnrollmentStatusColor(row.status)">
                {{ getEnrollmentStatusLabel(row.status) }}
              </q-badge>
            </template>
            <template #column-actions="{ row }">
              <q-btn
                flat
                round
                icon="check_circle"
                size="sm"
                color="positive"
                @click="markCompleted(row)"
                v-if="row.status === 'inscrito'"
              />
              <q-btn
                flat
                round
                icon="cancel"
                size="sm"
                color="negative"
                @click="markCancelled(row)"
                v-if="row.status === 'inscrito'"
              />
            </template>
          </TableBuilder>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useDialogMessage } from '@benjaminor-dev/quasar-app-extension-dialog-message';
import FormBuilder, { useFormBuilder } from '@benjaminor-dev/quasar-app-extension-form-builder';
import { TableBuilder, useTableBuilder } from '@benjaminor-dev/quasar-app-extension-table-builder';
import { useStudentStore } from 'src/stores/student-store';
import { useExamStore } from 'src/stores/exam-store';
import { studentService } from 'src/services/student.service';
import { examService } from 'src/services/exam.service';
import { enrollmentService } from 'src/services/enrollment.service';

const message = useDialogMessage();
const studentStore = useStudentStore();
const examStore = useExamStore();
const { defineForm } = useFormBuilder();
const { defineTable } = useTableBuilder();

void studentService.getAll('', 1, 100).then((r) => { studentStore.students = r.items; });
void examService.getAll({}, 1, 100).then((r) => { examStore.exams = r.items; });

const studentOptions = computed(() =>
  studentStore.students.map((s) => ({
    label: `${s.firstName} ${s.lastName} - ${s.cedula}`,
    value: s.id,
  }))
);

const examOptions = computed(() =>
  examStore.scheduled.map((e) => ({
    label: `${e.name} (${e.date})`,
    value: e.id,
  }))
);

const enrollConfig = defineForm<{ studentId: string; examId: string }>({
  formName: 'enrollmentForm',
  fields: [
    {
      type: 'InputSelect',
      model: 'studentId',
      label: 'Estudiante',
      requiredOn: () => true,
      props: {
        options: studentOptions.value,
        placeholder: 'Seleccionar estudiante',
      },
    },
    {
      type: 'InputSelect',
      model: 'examId',
      label: 'Examen',
      requiredOn: () => true,
      props: {
        options: examOptions.value,
        placeholder: 'Seleccionar examen',
      },
    },
    { type: 'SlotField', props: { slotName: 'actions' } },
  ],
});

const tableConfig = defineTable<{ search: string }, { id: string; studentId: string; examId: string; enrollmentDate: string; status: string }>({
  tableName: 'enrollmentsTable',
  title: 'Inscripciones',
  pagination: { mode: 'server', pageSize: 15 },
  columns: [
    { name: 'student', label: 'Estudiante', field: 'studentId', align: 'left', sortable: true },
    { name: 'exam', label: 'Examen', field: 'examId', align: 'left', sortable: true },
    { name: 'date', label: 'Fecha inscripcion', field: 'enrollmentDate', align: 'left' },
    { name: 'status', label: 'Estado', field: 'status', align: 'center' },
    { name: 'actions', label: 'Acciones', align: 'center' },
  ],
  filters: {
    form: {
      fields: [
        { type: 'InputSearch', model: 'search', label: 'Buscar' },
      ],
    },
  },
  fetch: async ({ filters, page, pageSize }) => {
    const result = await enrollmentService.getAll({ search: filters.search }, page, pageSize);
    return { rows: result.items, pagination: { total: result.total, page, pageSize } };
  },
  fetchOnMount: true,
});

async function onEnrollSubmit(payload: Record<string, unknown>) {
  const data = payload as { studentId: string; examId: string };

  await enrollmentService.create({ studentId: data.studentId, examId: data.examId });
  await message.success({ text: 'Inscripcion registrada correctamente' });
}

async function markCompleted(row: { id: string }) {
  await enrollmentService.update(row.id, { status: 'completado' });
  await message.success({ text: 'Inscripcion marcada como completada' });
}

async function markCancelled(row: { id: string }) {
  await enrollmentService.update(row.id, { status: 'cancelado' });
  await message.info({ text: 'Inscripcion cancelada' });
}

function getEnrollmentStatusColor(status: string): string {
  const colors: Record<string, string> = {
    inscrito: 'info',
    completado: 'positive',
    cancelado: 'negative',
  };
  return colors[status] || 'grey';
}

function getEnrollmentStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    inscrito: 'Inscrito',
    completado: 'Completado',
    cancelado: 'Cancelado',
  };
  return labels[status] || status;
}
</script>
