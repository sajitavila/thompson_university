<script setup lang="ts">
import FormBuilder, { useFormBuilder } from '@benjaminor-dev/quasar-app-extension-form-builder';
import type { FormBuilderSubmitPayload } from '@benjaminor-dev/quasar-app-extension-form-builder/types';
import { QBtn } from 'quasar';

/**
 * Importacion de la extension de FormBuilder.
 */
const { defineForm, inputRules, selectFormStore } = useFormBuilder();

/**
 * Modelo del formulario (debe coincidir con `model` de cada campo).
 */
type RegisterForm = {
  fullName: string | null;
  email: string | null;
};

/**
 * Configuracion del formulario.
 */
const formBuilderConfig = defineForm<RegisterForm>({
  formName: 'RegisterForm',

  // Valores iniciales al registrar el formulario en Pinia.
  defaultValues: {
    fullName: 'Benjamín Olvera',
  },

  fields: () => [
    {
      type: 'InputText',
      model: 'fullName',
      label: 'Nombre completo',
      requiredOn: () => true,
      rules: [inputRules.onlyLettersAndSpaces()],
    },
    {
      type: 'InputEmail',
      model: 'email',
      label: 'Correo',
      requiredOn: () => true,
    },
    // Botones de accion (reset / submit / ejemplo store).
    {
      type: 'SlotField',
      props: { slotName: 'action-buttons' },
    },
  ],
});

/**
 * Seleccion del formulario (mismo formName en cualquier componente).
 */
const registerFormStore = selectFormStore<RegisterForm>('RegisterForm');

/**
 * Ejemplo: restaurar valores por defecto desde el store.
 */
function resetFromStore() {
  registerFormStore.reset();
}

/**
 * Handler de envio del formulario.
 */
const onSubmit = (payload: FormBuilderSubmitPayload<RegisterForm>) => {
  console.log('Form submit:', payload);
  console.log('Valores en store:', registerFormStore.getValues());
};
</script>

<template>
  <FormBuilder :config="formBuilderConfig" @submit="onSubmit">
    <!-- SlotField — patron canónico (importar SlotFieldBind desde /types):
         #slot-field-{slotName}="attrs: SlotFieldBind"
         v-model="attrs.model.value" en el control hijo (model y error son refs) -->
    <template #slot-field-action-buttons>
      <div class="flex justify-end q-mt-md">
        <div class="row q-gutter-sm">
          <QBtn
            flat
            color="grey-8"
            icon="restart_alt"
            label="Limpiar (store)"
            @click="resetFromStore"
          />
          <QBtn type="reset" flat color="grey-8" icon="refresh" label="Limpiar" />
          <QBtn type="submit" unelevated color="primary" icon="send" label="Enviar" />
        </div>
      </div>
    </template>
  </FormBuilder>
</template>
