<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-primary">
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title>
          <q-icon name="school" class="q-mr-sm" />
          Thompson University
        </q-toolbar-title>

        <q-btn flat round icon="notifications">
          <q-badge color="red" floating>{{ pendingPaymentsCount }}</q-badge>
          <q-menu>
            <q-list style="min-width: 250px">
              <q-item-label header>Pagos pendientes</q-item-label>
              <q-item v-if="pendingPaymentsCount === 0">
                <q-item-section>No hay pagos pendientes</q-item-section>
              </q-item>
              <q-item v-for="p in pendingPayments.slice(0, 5)" :key="p.id">
                <q-item-section>
                  <q-item-label>{{ getStudentName(p.studentId) }}</q-item-label>
                  <q-item-label caption>{{ formatConcept(p.concept) }} - ${{ p.amount }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered class="bg-grey-1">
      <q-list>
        <q-item-label header class="text-weight-bold text-primary text-subtitle1 q-pb-sm">
          Menu
        </q-item-label>

        <q-separator />

        <q-item
          v-for="link in linksList"
          :key="link.title"
          :to="link.link"
          clickable
          v-ripple
          active-class="bg-primary text-white"
        >
          <q-item-section avatar>
            <q-icon :name="link.icon" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ link.title }}</q-item-label>
            <q-item-label caption>{{ link.caption }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useStudentStore } from 'src/stores/student-store';
import { usePaymentStore } from 'src/stores/payment-store';

const studentStore = useStudentStore();
const paymentStore = usePaymentStore();

const leftDrawerOpen = ref(false);

const linksList = [
  { title: 'Dashboard', caption: 'Resumen general', icon: 'dashboard', link: '/' },
  { title: 'Estudiantes', caption: 'Gestionar estudiantes', icon: 'people', link: '/students' },
  { title: 'Examenes', caption: 'Programar examenes', icon: 'assignment', link: '/exams' },
  { title: 'Inscripciones', caption: 'Inscribir a examenes', icon: 'how_to_reg', link: '/enrollments' },
  { title: 'Calificaciones', caption: 'Registrar notas', icon: 'grading', link: '/grades' },
  { title: 'Pagos', caption: 'Control de pagos', icon: 'payments', link: '/payments' },
  { title: 'Reportes', caption: 'Consultas y reportes', icon: 'analytics', link: '/reports' },
];

const pendingPayments = computed(() => paymentStore.pending);
const pendingPaymentsCount = computed(() => paymentStore.pending.length);

function getStudentName(studentId: string): string {
  const student = studentStore.getById(studentId);
  return student ? `${student.firstName} ${student.lastName}` : 'Desconocido';
}

function formatConcept(concept: string): string {
  const labels: Record<string, string> = {
    inscripcion: 'Inscripcion',
    examen: 'Examen',
    certificado: 'Certificado',
    reposicion: 'Reposicion',
  };
  return labels[concept] || concept;
}

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}
</script>
