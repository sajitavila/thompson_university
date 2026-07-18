<template>
  <q-page padding>
    <div class="row items-center q-mb-lg">
      <div class="col">
        <div class="text-h5 text-weight-bold">
          {{ isEdit ? 'Editar pago' : 'Registrar pago' }}
        </div>
      </div>
      <div class="col-auto">
        <q-btn flat icon="arrow_back" label="Volver" to="/payments" />
      </div>
    </div>

    <q-card flat bordered>
      <q-card-section>
        <FormBuilder :config="config" @submit="onSubmit">
          <template #slot-field-actions>
            <div class="flex justify-end q-gutter-sm">
              <q-btn flat label="Cancelar" to="/payments" />
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
import { useStudentStore } from 'src/stores/student-store';
import { studentService } from 'src/services/student.service';
import { paymentService } from 'src/services/payment.service';

const route = useRoute();
const router = useRouter();
const message = useDialogMessage();
const studentStore = useStudentStore();
const { defineForm } = useFormBuilder();

void studentService.getAll('', 1, 100).then((r) => { studentStore.students = r.items; });

const editId = computed(() => (route.params.id ? String(route.params.id) : ''));
const isEdit = computed(() => !!editId.value);

const conceptOptions = [
  { label: 'Inscripcion', value: 'inscripcion' },
  { label: 'Examen', value: 'examen' },
  { label: 'Certificado', value: 'certificado' },
  { label: 'Reposicion', value: 'reposicion' },
];

const methodOptions = [
  { label: 'Efectivo', value: 'efectivo' },
  { label: 'Tarjeta', value: 'tarjeta' },
  { label: 'Transferencia', value: 'transferencia' },
];

const statusOptions = [
  { label: 'Pagado', value: 'pagado' },
  { label: 'Pendiente', value: 'pendiente' },
];

const studentOptions = computed(() =>
  studentStore.students.map((s) => ({
    label: `${s.firstName} ${s.lastName} - ${s.cedula}`,
    value: s.id,
  }))
);

const config = defineForm<{
  studentId: string;
  concept: string;
  amount: number;
  method: string;
  paymentDate: string;
  status: string;
}>({
  formName: 'paymentForm',
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
      model: 'concept',
      label: 'Concepto de pago',
      requiredOn: () => true,
      props: {
        options: conceptOptions,
        placeholder: 'Seleccionar concepto',
      },
    },
    {
      type: 'InputNumber',
      model: 'amount',
      label: 'Monto',
      requiredOn: () => true,
    },
    {
      type: 'InputSelect',
      model: 'method',
      label: 'Metodo de pago',
      requiredOn: () => true,
      props: {
        options: methodOptions,
        placeholder: 'Seleccionar metodo',
      },
    },
    {
      type: 'InputDate',
      model: 'paymentDate',
      label: 'Fecha de pago',
      requiredOn: () => true,
      props: { placeholder: 'Seleccionar fecha' },
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
        const payment = await paymentService.getById(editId.value);
        return payment
          ? {
              studentId: payment.studentId,
              concept: payment.concept,
              amount: payment.amount,
              method: payment.method,
              paymentDate: payment.paymentDate,
              status: payment.status,
            }
          : {};
      }
    : { concept: 'examen', method: 'efectivo', status: 'pendiente', paymentDate: new Date().toISOString().split('T')[0] ?? '' },
});

onMounted(async () => {
  if (isEdit.value) {
    const payment = await paymentService.getById(editId.value);
    if (!payment) {
      await message.error({ text: 'Pago no encontrado' });
      void router.push('/payments');
    }
  }
});

async function onSubmit(payload: Record<string, unknown>) {
  const data = payload as {
    studentId: string;
    concept: 'inscripcion' | 'examen' | 'certificado' | 'reposicion';
    amount: number;
    method: 'efectivo' | 'tarjeta' | 'transferencia';
    paymentDate: string;
    status: 'pendiente' | 'pagado';
  };

  if (isEdit.value) {
    await paymentService.update(editId.value, data);
    await message.success({ text: 'Pago actualizado correctamente' });
  } else {
    await paymentService.create(data);
    await message.success({ text: 'Pago registrado correctamente' });
  }
  void router.push('/payments');
}
</script>
