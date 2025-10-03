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
    if (resp.medicos.length===0) {
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
    field: row =>  row.especialidad?.nombre ?? '-',
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
  <section class="p-4 md:p-6">
    <!-- Buscador + acciones -->
    <div class="mb-4 flex flex-col sm:flex-row gap-3 sm:items-center">
      <input type="text" v-model="nombre" placeholder="Buscar médico…"
        class="w-full sm:max-w-md rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
        aria-label="Buscar médico" />

      <div class="flex flex-wrap gap-2">
        <!-- Buscar (client-side; si quieres server-side, llama fetch con q) -->
        <button
          class="inline-flex items-center gap-2 rounded-xl border border-cyan-600 px-4 py-2 text-sm font-medium text-cyan-700 hover:bg-cyan-600 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2"
          aria-label="Buscar" title="Buscar">
          <MagnifyingGlassIcon class="h-5 w-5" />
          Buscar
        </button>

        <!-- Agregar (abre modal) -->
        <button @click="abrirCrear"
          class="inline-flex items-center gap-2 rounded-xl border border-emerald-600 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-600 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2"
          aria-label="Agregar" title="Agregar">
          <PlusIcon class="h-5 w-5" />
          Nuevo médico
        </button>

        <!-- Actualizar (refresca desde backend) -->
        <button @click="fetchMedicos" :disabled="loading"
          class="inline-flex items-center gap-2 rounded-xl border border-indigo-600 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-600 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 disabled:opacity-50"
          aria-label="Actualizar" title="Actualizar">
          <ArrowPathIcon class="h-5 w-5" />
          {{ loading ? 'Actualizando…' : 'Actualizar' }}
        </button>
      </div>
    </div>

    <!-- Tabla -->
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
  </section>

  <!-- Modales -->
  <MedicoCrearView v-model:open="openCrear" :loading="loading" title="Registrar nuevo médico" @save="crearMedico" />

  <MedicoEditarView v-model:open="openEditar" :item="itemSeleccionado" :loading="loading" title="Editar médico"
    @save="actualizarMedico" @cancel="cerrarEditar" />
</template>
