<template>
  <q-dialog v-model="show" persistent>
    <q-card style="min-width: 350px">
      <q-card-section class="row items-center">
        <q-icon :name="icon" size="32px" :color="iconColor" class="q-mr-sm" />
        <span class="text-h6">{{ title }}</span>
      </q-card-section>

      <q-card-section class="q-pt-none">
        {{ message }}
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancelar" color="grey" @click="cancel" />
        <q-btn :label="confirmLabel" :color="confirmColor" @click="confirm" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    title?: string;
    message?: string;
    confirmLabel?: string;
    confirmColor?: string;
    icon?: string;
    iconColor?: string;
  }>(),
  {
    title: 'Confirmar',
    message: 'Esta seguro de realizar esta accion?',
    confirmLabel: 'Aceptar',
    confirmColor: 'primary',
    icon: 'help_outline',
    iconColor: 'warning',
  }
);

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  confirm: [];
}>();

const show = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit('update:modelValue', val),
});

function confirm() {
  emit('confirm');
  emit('update:modelValue', false);
}

function cancel() {
  emit('update:modelValue', false);
}
</script>
