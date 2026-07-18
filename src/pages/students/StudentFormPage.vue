<template>
  <q-page padding>
    <div class="row items-center q-mb-lg">
      <div class="col">
        <div class="text-h5 text-weight-bold">
          {{ isEdit ? 'Editar estudiante' : 'Nuevo estudiante' }}
        </div>
      </div>
      <div class="col-auto">
        <q-btn flat icon="arrow_back" label="Volver" to="/students" />
      </div>
    </div>

    <q-card flat bordered>
      <q-card-section>
        <FormBuilder :config="config" @submit="onSubmit">
          <template #slot-field-actions>
            <div class="flex justify-end q-gutter-sm">
              <q-btn flat label="Cancelar" to="/students" />
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
import { studentService } from 'src/services/student.service';

const route = useRoute();
const router = useRouter();
const message = useDialogMessage();
const { defineForm, inputRules } = useFormBuilder();

const editId = computed(() => (route.params.id ? String(route.params.id) : ''));
const isEdit = computed(() => !!editId.value);

const config = defineForm<{
  firstName: string;
  lastName: string;
  cedula: string;
  birthDate: string;
  email: string;
  phone: string;
  address: string;
}>({
  formName: 'studentForm',
  fields: [
    {
      type: 'InputText',
      model: 'firstName',
      label: 'Nombre',
      requiredOn: () => true,
      rules: [inputRules.legalTextExtendedRule()],
      props: { placeholder: 'Nombre del estudiante' },
    },
    {
      type: 'InputText',
      model: 'lastName',
      label: 'Apellido',
      requiredOn: () => true,
      rules: [inputRules.legalTextExtendedRule()],
      props: { placeholder: 'Apellido del estudiante' },
    },
    {
      type: 'InputText',
      model: 'cedula',
      label: 'Cedula',
      requiredOn: () => true,
      props: { placeholder: 'Numero de cedula' },
    },
    {
      type: 'InputDate',
      model: 'birthDate',
      label: 'Fecha de nacimiento',
      props: { placeholder: 'Seleccionar fecha' },
    },
    {
      type: 'InputEmail',
      model: 'email',
      label: 'Email',
      rules: [inputRules.email()],
      props: { placeholder: 'correo@ejemplo.com' },
    },
    {
      type: 'InputText',
      model: 'phone',
      label: 'Telefono',
      props: { placeholder: 'Numero de telefono' },
    },
    {
      type: 'InputText',
      model: 'address',
      label: 'Direccion',
      props: { placeholder: 'Direccion completa' },
    },
    { type: 'SlotField', props: { slotName: 'actions' } },
  ],
  defaultValues: isEdit.value
    ? async () => {
        const student = await studentService.getById(editId.value);
        return student
          ? {
              firstName: student.firstName,
              lastName: student.lastName,
              cedula: student.cedula,
              birthDate: student.birthDate,
              email: student.email,
              phone: student.phone,
              address: student.address,
            }
          : {};
      }
    : () => ({}),
});

onMounted(async () => {
  if (isEdit.value) {
    const student = await studentService.getById(editId.value);
    if (!student) {
      await message.error({ text: 'Estudiante no encontrado' });
      void router.push('/students');
    }
  }
});

async function onSubmit(payload: Record<string, unknown>) {
  const data = payload as {
    firstName: string;
    lastName: string;
    cedula: string;
    birthDate: string;
    email: string;
    phone: string;
    address: string;
  };

  if (isEdit.value) {
    await studentService.update(editId.value, data);
    await message.success({ text: 'Estudiante actualizado correctamente' });
  } else {
    await studentService.create(data);
    await message.success({ text: 'Estudiante registrado correctamente' });
  }
  void router.push('/students');
}
</script>
