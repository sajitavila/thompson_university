<template>
  <q-page padding>
    <div class="row items-center q-mb-lg">
      <div class="col">
        <div class="text-h5 text-weight-bold">Estudiantes</div>
        <div class="text-caption text-grey-7">Gestion de estudiantes registrados</div>
      </div>
      <div class="col-auto">
        <q-btn color="primary" icon="person_add" label="Nuevo" to="/students/new" />
      </div>
    </div>

    <q-card flat bordered>
      <TableBuilder :config="tableConfig">
        <template #column-actions="{ row }">
          <q-btn flat round icon="edit" size="sm" :to="`/students/${row.id}/edit`" />
          <q-btn
            flat
            round
            icon="delete"
            size="sm"
            color="negative"
            @click="confirmDelete(row)"
          />
        </template>
      </TableBuilder>
    </q-card>

    <ConfirmDialog
      v-model="showDeleteDialog"
      title="Eliminar estudiante"
      :message="`Desea eliminar a ${deletingStudent?.firstName} ${deletingStudent?.lastName}?`"
      confirm-label="Eliminar"
      confirm-color="negative"
      icon="delete"
      icon-color="negative"
      @confirm="deleteStudent"
    />
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useDialogMessage } from '@benjaminor-dev/quasar-app-extension-dialog-message';
import { TableBuilder, useTableBuilder } from '@benjaminor-dev/quasar-app-extension-table-builder';
import { studentService } from 'src/services/student.service';
import ConfirmDialog from 'src/components/ConfirmDialog.vue';
import type { Student } from 'src/types';

const message = useDialogMessage();
const { defineTable } = useTableBuilder();

const showDeleteDialog = ref(false);
const deletingStudent = ref<Student | null>(null);

const tableConfig = defineTable<{ search: string }, Student>({
  tableName: 'studentsTable',
  title: 'Estudiantes',
  pagination: { mode: 'server', pageSize: 15 },
  columns: [
    { name: 'firstName', label: 'Nombre', field: 'firstName', align: 'left', sortable: true },
    { name: 'lastName', label: 'Apellido', field: 'lastName', align: 'left', sortable: true },
    { name: 'cedula', label: 'Cedula', field: 'cedula', align: 'left' },
    { name: 'phone', label: 'Telefono', field: 'phone', align: 'left' },
    { name: 'email', label: 'Email', field: 'email', align: 'left' },
    { name: 'actions', label: 'Acciones', align: 'center' },
  ],
  filters: {
    form: {
      fields: [
        { type: 'InputSearch', model: 'search', label: 'Buscar por nombre o cedula' },
      ],
    },
  },
  fetch: async ({ filters, page, pageSize }) => {
    const result = await studentService.getAll(filters.search, page, pageSize);
    return { rows: result.items, pagination: { total: result.total, page, pageSize } };
  },
  fetchOnMount: true,
});

function confirmDelete(student: Student) {
  deletingStudent.value = student;
  showDeleteDialog.value = true;
}

async function deleteStudent() {
  if (deletingStudent.value) {
    await studentService.remove(deletingStudent.value.id);
    await message.success({ text: 'Estudiante eliminado correctamente' });
    deletingStudent.value = null;
  }
}
</script>
