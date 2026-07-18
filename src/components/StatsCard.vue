<template>
  <q-card class="stats-card" flat bordered>
    <q-card-section class="row items-center no-wrap">
      <div class="col">
        <div class="text-caption text-grey-7">{{ label }}</div>
        <div class="text-h4 text-weight-bold" :class="`text-${color}`">{{ value }}</div>
        <div v-if="subtitle" class="text-caption text-grey-5 q-mt-xs">{{ subtitle }}</div>
      </div>
      <div class="col-auto">
        <q-icon :name="icon" size="48px" :color="color" />
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
defineProps<{
  label: string;
  value: string | number;
  icon: string;
  color?: string;
  subtitle?: string;
}>();
</script>

<style scoped lang="scss">
.stats-card {
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }
}
</style>
