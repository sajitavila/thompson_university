import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/DashboardPage.vue') },

      // Estudiantes
      {
        path: 'students',
        children: [
          { path: '', component: () => import('pages/students/StudentListPage.vue') },
          { path: 'new', component: () => import('pages/students/StudentFormPage.vue') },
          { path: ':id/edit', component: () => import('pages/students/StudentFormPage.vue') },
        ],
      },

      // Examenes
      {
        path: 'exams',
        children: [
          { path: '', component: () => import('pages/exams/ExamListPage.vue') },
          { path: 'new', component: () => import('pages/exams/ExamFormPage.vue') },
          { path: ':id/edit', component: () => import('pages/exams/ExamFormPage.vue') },
        ],
      },

      // Inscripciones
      { path: 'enrollments', component: () => import('pages/enrollments/EnrollmentPage.vue') },

      // Calificaciones
      { path: 'grades', component: () => import('pages/grades/GradePage.vue') },

      // Pagos
      {
        path: 'payments',
        children: [
          { path: '', component: () => import('pages/payments/PaymentListPage.vue') },
          { path: 'new', component: () => import('pages/payments/PaymentFormPage.vue') },
          { path: ':id/edit', component: () => import('pages/payments/PaymentFormPage.vue') },
        ],
      },

      // Reportes
      { path: 'reports', component: () => import('pages/reports/ReportsPage.vue') },
    ],
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
