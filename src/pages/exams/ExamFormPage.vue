<template>
  <q-page padding>
    <div class="row items-center q-mb-lg">
      <div class="col">
        <div class="text-h5 text-weight-bold">
          {{ isEdit ? 'Editar examen' : 'Nuevo examen' }}
        </div>
      </div>
      <div class="col-auto">
        <q-btn flat icon="arrow_back" label="Volver" to="/exams" />
      </div>
    </div>

    <q-card flat bordered>
      <q-card-section>
        <FormBuilder :config="config" @submit="onSubmit">
          <template #slot-field-actions>
            <div class="flex justify-end q-gutter-sm">
              <q-btn flat label="Cancelar" to="/exams" />
              <q-btn type="submit" color="primary" :label="isEdit ? 'Actualizar' : 'Guardar'" />
            </div>
          </template>
        </FormBuilder>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useDialogMessage } from '@benjaminor-dev/quasar-app-extension-dialog-message';
import FormBuilder, { useFormBuilder } from '@benjaminor-dev/quasar-app-extension-form-builder';
import { examService } from 'src/services/exam.service';

const route = useRoute();
const router = useRouter();
const message = useDialogMessage();
const { defineForm, inputRules } = useFormBuilder();

const editId = computed(() => (route.params.id ? String(route.params.id) : ''));
const isEdit = computed(() => !!editId.value);

const typeOptions = [
  { label: 'Cedula', value: 'cedula' },
  { label: 'Titulo', value: 'titulo' },
  { label: 'Certificado', value: 'certificado' },
];

const statusOptions = [
  { label: 'Programado', value: 'programado' },
  { label: 'En curso', value: 'en_curso' },
  { label: 'Finalizado', value: 'finalizado' },
  { label: 'Cancelado', value: 'cancelado' },
];

const config = defineForm<{
  name: string;
  type: string;
  date: string;
  time: string;
  location: string;
  maxCapacity: number;
  status: string;
}>({
  formName: 'examForm',
  fields: [
    {
      type: 'InputText',
      model: 'name',
      label: 'Nombre del examen',
      requiredOn: () => true,
      rules: [inputRules.legalTextExtendedRule()],
      props: { placeholder: 'Ej: Examen de Cedula Profesional' },
    },
    {
      type: 'InputSelect',
      model: 'type',
      label: 'Tipo de examen',
      requiredOn: () => true,
      props: {
        options: typeOptions,
        placeholder: 'Seleccionar tipo',
      },
    },
    {
      type: 'InputDate',
      model: 'date',
      label: 'Fecha del examen',
      requiredOn: () => true,
      props: { placeholder: 'Seleccionar fecha' },
    },
    {
      type: 'InputTime',
      model: 'time',
      label: 'Hora del examen',
      requiredOn: () => true,
      props: { placeholder: 'Seleccionar hora' },
    },
    {
      type: 'InputText',
      model: 'location',
      label: 'Lugar',
      requiredOn: () => true,
      props: { placeholder: 'Direccion o salon del examen' },
    },
    {
      type: 'InputNumber',
      model: 'maxCapacity',
      label: 'Cupo maximo',
      requiredOn: () => true,
      props: { maxNumber: 999 },
    },
    {
      type: 'InputSelect',
      model: 'status',
      label: 'Estado',
      props: {
        options: statusOptions,
        placeholder: 'Seleccionar estado',
      },
    },
    { type: 'SlotField', props: { slotName: 'actions' } },
  ],
  defaultValues: isEdit.value
    ? async () => {
        const exam = await examService.getById(editId.value);
        return exam
          ? {
              name: exam.name,
              type: exam.type,
              date: exam.date,
              time: exam.time,
              location: exam.location,
              maxCapacity: exam.maxCapacity,
              status: exam.status,
            }
          : {};
      }
    : { type: 'cedula', status: 'programado', maxCapacity: 30 },
});

onMounted(async () => {
  if (isEdit.value) {
    const exam = await examService.getById(editId.value);
    if (!exam) {
      await message.error({ text: 'Examen no encontrado' });
      void router.push('/exams');
    }
  }
});

async function onSubmit(payload: Record<string, unknown>) {
  const data = payload as {
    name: string;
    type: 'cedula' | 'titulo' | 'certificado';
    date: string;
    time: string;
    location: string;
    maxCapacity: number;
    status: 'programado' | 'en_curso' | 'finalizado' | 'cancelado';
  };

  if (isEdit.value) {
    await examService.update(editId.value, data);
    await message.success({ text: 'Examen actualizado correctamente' });
  } else {
    await examService.create(data);
    await message.success({ text: 'Examen creado correctamente' });
  }
  void router.push('/exams');
}
</script>
