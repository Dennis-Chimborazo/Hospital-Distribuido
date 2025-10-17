<script setup>
import { ref, onMounted, computed } from 'vue'
import { VueGoodTable } from 'vue-good-table-next'
import 'vue-good-table-next/dist/vue-good-table-next.css'

import MedicoCrearView from './MedicoCrearView.vue'
import MedicoEditarView from './MedicoEditarView.vue'

import MedicoService from '@/services/Medico.service'          // <- ajusta si tu archivo se llama distinto
import { useNotify } from '@/components/useNotify.js'
import { confirm } from '@/components/confirm.js'

import {
  PencilSquareIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  ArrowPathIcon
} from '@heroicons/vue/24/outline'

const notify = useNotify()

// estado tabla + UI
const nombre = ref('')
const medicos = ref([])
const loading = ref(false)

// modales
const openCrear = ref(false)
const openEditar = ref(false)
const itemSeleccionado = ref(null)

function abrirCrear() {
  openCrear.value = true
}

function cerrarEditar() {
  openEditar.value = false
  itemSeleccionado.value = null
}

// --- Carga inicial / refresco ---
async function fetchMedicos() {
  loading.value = true
  try {
    const resp = await MedicoService.listarMedicos()
    if (resp.medicos.length === 0) {
      notify.warning('No se encontraron médicos')
      return
    }
    medicos.value = Array.isArray(resp?.items)
      ? resp.items
      : (Array.isArray(resp?.medicos) ? resp.medicos : [])

  } catch (e) {
    console.error('Error cargando médicos', e)
    medicos.value = []
    notify.error(e.message ?? 'No se pudieron cargar los médicos')
  } finally {
    loading.value = false
  }
}

onMounted(fetchMedicos)

// --- Búsqueda client-side (si la quieres server-side, reusa fetch con q) ---
const filtrados = computed(() => {
  const q = nombre.value.trim().toLowerCase()
  if (!q) return medicos.value
  return medicos.value.filter(m => {
    const full = `${m.nombres ?? ''} ${m.apellidos ?? ''}`.toLowerCase()
    return (
      full.includes(q) ||
      (m.identificacion ?? '').toLowerCase().includes(q) ||
      (m.especialidad?.nombre ?? m.especialidadNombre ?? '').toLowerCase().includes(q) ||
      (m.sede?.nombre ?? m.sedeNombre ?? '').toLowerCase().includes(q) ||
      (m.consultorio?.nombre ?? m.consultorioNombre ?? '').toLowerCase().includes(q)
    )
  })
})

async function crearMedico(payload) {
  try {
    loading.value = true
    const creado = await MedicoService.crearMedico(payload)
    medicos.value.unshift(creado)
    notify.success('Médico creado correctamente.')
    openCrear.value = false
  } catch (e) {
    notify.error(e.message ?? 'No se pudo crear el médico')
    console.log(e.message)
  } finally {
    loading.value = false
  }
}

// --- Editar ---
function editar(row) {
  itemSeleccionado.value = row
  openEditar.value = true
}

async function actualizarMedico(payload) {
  // payload debe traer _id o id
  const id = payload._id ?? payload.id
  if (!id) {
    notify.error('No se encontró el identificador del médico.')
    return
  }
  const ok = await confirm({ type: 'edit', text: '¿Guardar los cambios del médico?' })
  if (!ok) return
  try {
    loading.value = true
    const actualizado = await MedicoService.actualizarMedico(id, payload)
    // reemplazar en arreglo local
    const idx = medicos.value.findIndex(m => (m._id ?? m.id) === id)
    if (idx !== -1) medicos.value[idx] = actualizado
    notify.success('Médico actualizado correctamente.')
    cerrarEditar()
  } catch (e) {
    notify.error(e.message ?? 'No se pudo actualizar el médico')
  } finally {
    loading.value = false
  }
}
// --- Eliminar ---
async function eliminar(row) {
  console.log(row._id)
  const id = row._id ?? row.id
  if (!id) {
    notify.error('No se encontró el identificador del médico.')
    return
  }
  const ok = await confirm({
    type: 'delete',
    text: `Se eliminará al médico "${row.persona.nombres ?? ''} ${row.persona.apellidos ?? ''}".`
  })
  if (!ok) return
  try {
    loading.value = true
    await MedicoService.eliminarMedico(row._id)
    medicos.value = medicos.value.filter(m => (m._id ?? m.id) !== id)
    notify.success('Médico eliminado correctamente.')
  } catch (e) {
    notify.error(e.message ?? 'No se pudo eliminar el médico')
  } finally {
    loading.value = false
  }
}
// --- columnas de la tabla ---
const columns = [
  {
    label: 'Nombre completo',
    field: row => `${row.persona?.nombres ?? ''} ${row.persona?.apellidos ?? ''}`.trim(),
    thClass: 'px-4 py-3',
    tdClass: 'px-4 py-3 text-slate-900'
  },
  {
    label: 'Identificación',
    field: row => row.persona?.identificacion ?? '-',
    thClass: 'px-4 py-3',
    tdClass: 'px-4 py-3'
  },
  {
    label: 'Sede',
    field: row => row.sede?.nombre ?? '-',
    thClass: 'px-4 py-3',
    tdClass: 'px-4 py-3'
  },
  {
    label: 'Especialidades',
    field: row => row.especialidad?.nombre ?? '-',
    thClass: 'px-4 py-3',
    tdClass: 'px-4 py-3'
  },
  {
    label: 'Consultorio',
    field: row => row.consultorio?.nombre ?? '-',
    thClass: 'px-4 py-3',
    tdClass: 'px-4 py-3'
  },
  {
    label: 'Horario',
    field: row => row.horario ?? '-',
    thClass: 'px-4 py-3',
    tdClass: 'px-4 py-3'
  },
  {
    label: 'Opciones',
    field: 'acciones',
    sortable: false,
    thClass: 'px-4 py-3 text-right w-40',
    tdClass: 'px-4 py-3 text-right'
  },
];

// paginación local de la tabla (client-side)
const paginationOptions = {
  enabled: true,
  perPage: 10,
  perPageDropdown: [10, 20, 50],
  mode: 'pages',
}
</script>

<template>
  <section class="modulo-panel modulo-medicos modulo-full">

    <!-- ================= CABECERA ================= -->
    <!-- clase: .modulo-header -->
    <div class="modulo-header">
      <h2>Médicos</h2>
      <p>Listado de médicos registrados en el sistema.</p>
    </div>

    <!-- ================= BARRA DE FILTROS / ACCIONES ================= -->
    <!-- clase: .modulo-toolbar -->
    <div class="modulo-toolbar">
      <!-- ====== Input de búsqueda ====== -->
      <label class="relative w-full sm:max-w-md" aria-label="Buscar médico">
        <!-- input dentro de .modulo-toolbar usa su propio estilo -->
        <input type="search" v-model="nombre" placeholder="Buscar por nombre, cédula, especialidad…" />
      </label>

      <!-- ====== Botones ====== -->
      <div class="flex flex-wrap gap-2">
        <!-- clase: .modulo-btn.ghost -->
        <button class="modulo-btn ghost">
          <MagnifyingGlassIcon class="h-5 w-5" />
          Buscar
        </button>

        <!-- clase: .modulo-btn.primary -->
        <button @click="abrirCrear" class="modulo-btn primary">
          <PlusIcon class="h-5 w-5" />
          Nuevo médico
        </button>

        <!-- clase: .modulo-btn.ghost (puede ser info) -->
        <button @click="fetchMedicos" :disabled="loading" class="modulo-btn ghost">
          <ArrowPathIcon class="h-5 w-5 animate-spin" v-if="loading" />
          <ArrowPathIcon class="h-5 w-5" v-else />
          {{ loading ? 'Actualizando…' : 'Actualizar' }}
        </button>
      </div>
    </div>

    <!-- ================= TABLA ================= -->
     <div class="table">
    <VueGoodTable :columns="columns" :rows="filtrados" :search-options="{ enabled: false }"
      :pagination-options="paginationOptions" styleClass="vgt-table condensed"
      class="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <!-- Columna acciones -->
      <template #table-row="props">
        <template v-if="props.column.field === 'acciones'">
          <div class="flex justify-end gap-2">
            <button @click="editar(props.row)"
              class="inline-flex items-center justify-center rounded-lg border border-slate-300 px-3 py-1.5 hover:bg-slate-100 transition"
              aria-label="Editar" title="Editar">
              <PencilSquareIcon class="h-5 w-5" />
              <span class="sr-only">Editar</span>
            </button>
            <button @click="eliminar(props.row)"
              class="inline-flex items-center justify-center rounded-lg border border-rose-300 px-3 py-1.5 text-rose-600 hover:bg-rose-50 transition"
              aria-label="Eliminar" title="Eliminar">
              <TrashIcon class="h-5 w-5" />
              <span class="sr-only">Eliminar</span>
            </button>
          </div>
        </template>
        <template v-else>
          {{ typeof props.column.field === 'function'
            ? props.column.field(props.row)
            : props.formattedRow[props.column.field]
          }}
        </template>
      </template>

      <template #emptystate>
        <div class="py-8 text-center text-slate-500">No se encontraron médicos.</div>
      </template>
    </VueGoodTable>
    </div>
  </section>

  <!-- ================= MODALES ================= -->
  <MedicoCrearView v-model:open="openCrear" :loading="loading" title="Registrar nuevo médico" @save="crearMedico" />

  <MedicoEditarView v-model:open="openEditar" :item="itemSeleccionado" :loading="loading" title="Editar médico"
    @save="actualizarMedico" @cancel="cerrarEditar" />
</template>
