<template>
  <q-page padding>
    <div class="q-mb-lg">
      <div class="text-h5 text-weight-bold">Calificaciones</div>
      <div class="text-caption text-grey-7">Registrar calificaciones de examenes</div>
    </div>

    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-5">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-subtitle1 text-weight-bold q-mb-md">Registrar calificacion</div>
            <FormBuilder :config="gradeConfig" @submit="onGradeSubmit">
              <template #slot-field-preview>
                <div v-if="previewScore !== null" class="q-pa-md text-center">
                  <q-badge :color="previewScore >= 60 ? 'positive' : 'negative'" class="text-h6 q-pa-md">
                    {{ previewScore >= 60 ? 'APROBADO' : 'REPROBADO' }}
                  </q-badge>
                </div>
              </template>
              <template #slot-field-actions>
                <q-btn type="submit" color="primary" label="Guardar calificacion" class="full-width" />
              </template>
            </FormBuilder>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-7">
        <q-card flat bordered>
          <q-card-section>
            <div class="row items-center">
              <div class="col">
                <div class="text-subtitle1 text-weight-bold">Calificaciones registradas</div>
              </div>
              <div class="col-auto">
                <q-chip color="positive" text-color="white">
                  Aprobados: {{ gradeStore.passed.length }}
                </q-chip>
                <q-chip color="negative" text-color="white">
                  Reprobados: {{ gradeStore.failed.length }}
                </q-chip>
              </div>
            </div>
          </q-card-section>
          <q-separator />
          <TableBuilder :config="gradesTableConfig">
            <template #column-score="{ row }">
              <q-badge :color="row.passed ? 'positive' : 'negative'">
                {{ row.score }}
              </q-badge>
            </template>
            <template #column-passed="{ row }">
              <q-icon
                :name="row.passed ? 'check_circle' : 'cancel'"
                :color="row.passed ? 'positive' : 'negative'"
                size="sm"
              />
            </template>
            <template #column-actions="{ row }">
              <q-btn
                flat
                round
                icon="delete"
                size="sm"
                color="negative"
                @click="deleteGrade(row)"
              />
            </template>
          </TableBuilder>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useDialogMessage } from '@benjaminor-dev/quasar-app-extension-dialog-message';
import FormBuilder, { useFormBuilder } from '@benjaminor-dev/quasar-app-extension-form-builder';
import { TableBuilder, useTableBuilder } from '@benjaminor-dev/quasar-app-extension-table-builder';
import { useStudentStore } from 'src/stores/student-store';
import { useExamStore } from 'src/stores/exam-store';
import { useEnrollmentStore } from 'src/stores/enrollment-store';
import { useGradeStore } from 'src/stores/grade-store';
import { studentService } from 'src/services/student.service';
import { examService } from 'src/services/exam.service';
import { enrollmentService } from 'src/services/enrollment.service';
import { gradeService } from 'src/services/grade.service';

const message = useDialogMessage();
const studentStore = useStudentStore();
const examStore = useExamStore();
const enrollmentStore = useEnrollmentStore();
const gradeStore = useGradeStore();
const { defineForm } = useFormBuilder();
const { defineTable } = useTableBuilder();

const previewScore = ref<number | null>(null);

void studentService.getAll('', 1, 100).then((r) => { studentStore.students = r.items; });
void examService.getAll({}, 1, 100).then((r) => { examStore.exams = r.items; });
void enrollmentService.getAll({}, 1, 100).then((r) => { enrollmentStore.enrollments = r.items; });

const enrollmentOptions = computed(() => {
  const gradedEnrollmentIds = gradeStore.grades.map((g) => g.enrollmentId);
  return enrollmentStore.active
    .filter((e) => !gradedEnrollmentIds.includes(e.id))
    .map((e) => {
      const student = studentStore.getById(e.studentId);
      const exam = examStore.getById(e.examId);
      return {
        label: `${student?.firstName} ${student?.lastName} - ${exam?.name}`,
        value: e.id,
      };
    });
});

const gradeConfig = defineForm<{ enrollmentId: string; score: number; gradedDate: string }>({
  formName: 'gradeForm',
  fields: [
    {
      type: 'InputSelect',
      model: 'enrollmentId',
      label: 'Inscripcion',
      requiredOn: () => true,
      props: {
        options: enrollmentOptions.value,
        placeholder: 'Seleccionar inscripcion',
      },
    },
    {
      type: 'InputNumber',
      model: 'score',
      label: 'Calificacion (0-100)',
      requiredOn: () => true,
      onChange: (val) => {
        previewScore.value = val as number | null;
      },
      props: { maxNumber: 100 },
    },
    {
      type: 'InputDate',
      model: 'gradedDate',
      label: 'Fecha de calificacion',
      requiredOn: () => true,
      props: { placeholder: 'Seleccionar fecha' },
    },
    { type: 'SlotField', props: { slotName: 'preview' } },
    { type: 'SlotField', props: { slotName: 'actions' } },
  ],
  defaultValues: { gradedDate: new Date().toISOString().split('T')[0] ?? '' },
});

const gradesTableConfig = defineTable<{ search: string }, { id: string; studentId: string; examId: string; score: number; passed: boolean; gradedDate: string; enrollmentId: string }>({
  tableName: 'gradesTable',
  title: 'Calificaciones',
  pagination: { mode: 'server', pageSize: 15 },
  columns: [
    { name: 'student', label: 'Estudiante', field: 'studentId', align: 'left', sortable: true },
    { name: 'exam', label: 'Examen', field: 'examId', align: 'left' },
    { name: 'score', label: 'Calificacion', field: 'score', align: 'center', sortable: true },
    { name: 'passed', label: 'Aprobado', field: 'passed', align: 'center' },
    { name: 'date', label: 'Fecha', field: 'gradedDate', align: 'left' },
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
    const result = await gradeService.getAll({ search: filters.search }, page, pageSize);
    return { rows: result.items, pagination: { total: result.total, page, pageSize } };
  },
  fetchOnMount: true,
});

async function onGradeSubmit(payload: Record<string, unknown>) {
  const data = payload as { enrollmentId: string; score: number; gradedDate: string };

  if (!data.enrollmentId || data.score === null || data.score === undefined) return;

  await gradeService.create({
    enrollmentId: data.enrollmentId,
    score: data.score,
    gradedDate: data.gradedDate,
  });

  previewScore.value = null;
  await message.success({ text: 'Calificacion registrada correctamente' });
}

async function deleteGrade(row: { id: string }) {
  await gradeService.remove(row.id);
  await message.info({ text: 'Calificacion eliminada' });
}
</script>
