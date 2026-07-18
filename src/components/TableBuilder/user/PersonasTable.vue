<script setup lang="ts">
import {
  TableBuilder,
  useTableBuilder,
} from "@benjaminor-dev/quasar-app-extension-table-builder";

/**
 * Importacion de la extension de TableBuilder.
 */
const { defineTable, selectTableStore } = useTableBuilder();

/**
 * Definicion de los filtros del drawer (`model` debe coincidir con los campos del form).
 */
type PersonasFilters = {
  name: string | null;
};

/**
 * Definicion de una fila de la tabla.
 */
type PersonaRow = {
  id: number;
  name: string;
  surname: string;
  email: string;
};

/**
 * Datos de ejemplo (reemplaza por tu API o store).
 */
const ROWS: PersonaRow[] = [
  { id: 1, name: "Jhon", surname: "Doe", email: "jhon.doe@example.com" },
  { id: 2, name: "Jane", surname: "Doe", email: "jane.doe@example.com" },
];

/**
 * Funcion para cargar los datos de la tabla.
 */
function loadRows(filters: PersonasFilters): Promise<PersonaRow[]> {
  const search = filters.name?.trim().toLowerCase() ?? "";

  if (!search) {
    return Promise.resolve(ROWS);
  }

  return Promise.resolve(
    ROWS.filter((row) => row.name.toLowerCase().includes(search)),
  );
}

/**
 * Configuracion de la tabla.
 */
const tableConfig = defineTable<PersonasFilters, PersonaRow>({
  tableName: "PersonasTable",
  title: "Personas",
  hint: "Ejemplo de tabla de Personas",
  helpTooltip: "Usa el filtro para buscar por nombre",
  prependIcon: "groups",

  // Panel de filtros (drawer por defecto).
  filters: {
    form: {
      fields: ({ /* preset */ }) => [
        {
          type: "InputText",
          model: "name",
          label: "Nombre",
          props: { prependIcon: "person_search" },
        },
      ],
    },
  },

  // Client-side: `fetch` devuelve todas las filas y QTable pagina en memoria.
  pagination: { mode: "client" },

  fetchOnMount: true, // demo: override del boot (recomendado: false)

  // Funcion para cargar los datos de la tabla.
  fetch: ({ filters }) => loadRows(filters),

  // Definicion de las columnas de la tabla.
  columns: [
    { name: "icon", label: "Icono", align: "center" },
    { name: "name", label: "Nombre", field: "name" },
    { name: "surname", label: "Apellido", field: "surname" },
    { name: "email", label: "Correo", field: "email" },
    { name: "actions", label: "Acciones", align: "center" },
  ],
});

/**
 * Seleccion de la tabla.
 */
const personasTableStore = selectTableStore<PersonaRow>("PersonasTable");

/**
 * Funcion para eliminar una fila de la tabla.
 *
 * @param id - El id de la fila a eliminar.
 */
function deleteRow(id: number) {
  personasTableStore.patchItems((rows) => rows.filter((row) => row.id !== id));
}
</script>

<template>
  <TableBuilder :config="tableConfig">
    <template #column-icon>
      <q-icon name="person" color="primary" />
    </template>

    <template #column-actions="{ row }">
      <q-btn round flat dense icon="edit" color="primary">
        <q-tooltip>Editar a {{ row.name }} {{ row.surname }}</q-tooltip>
      </q-btn>
      <q-btn
        round
        flat
        dense
        icon="delete"
        color="negative"
        @click="deleteRow(row.id)"
      >
        <q-tooltip>Eliminar a {{ row.name }}</q-tooltip>
      </q-btn>
    </template>
  </TableBuilder>
</template>
