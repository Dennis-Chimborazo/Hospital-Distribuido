<script setup>
import { ref, onMounted, computed } from 'vue'
import EspecialidadService from '@/services/Especialidad.service'
import EspecialidadCrearView from './EspecialidadCrearView.vue'
import EspecialidadEditarView from './EspecialidadEditarView.vue'
import { VueGoodTable } from 'vue-good-table-next'
import 'vue-good-table-next/dist/vue-good-table-next.css'
import { PencilSquareIcon, TrashIcon, MagnifyingGlassIcon, PlusIcon, ArrowPathIcon } from '@heroicons/vue/24/outline'
import { useNotify } from '@/components/useNotify.js'
import { confirm } from '@/components/confirm.js'

const notify = useNotify()

const nombre = ref('')
const openModalAgregar = ref(false)
const especialidades = ref([])
const openEditar = ref(false)
const itemSeleccionado = ref(null)

// --------- helpers ----------
function agregar () {
  openModalAgregar.value = true
}

// Si en tu template llamas a "buscar", define algo aunque no haga nada
function buscar () {
  // El filtro ya es reactivo. Dejar vacío evita errores.
}

// Si quieres mantener el botón "Actualizar" pero sin pedir al backend:
function actualizar () {
  // No hacemos fetch; podría, por ejemplo, limpiar el filtro:
  // nombre.value = ''
}

// --------- CREATE (optimista) ----------
const crearEspecialidad = async (formData) => {
  // Creamos un item local temporal por si el backend no devuelve el objeto creado
  const tempId = `_temp_${Date.now()}`
  const nuevoLocal = {
    _id: tempId,
    nombre: formData.nombre,
    descripcion: formData.descripcion,
    // agrega otros campos que uses en la tabla
  }

  // 1) Optimista: pinta ya en pantalla
  especialidades.value = [nuevoLocal, ...especialidades.value] // 👈

  try {
    const res = await EspecialidadService.crearEspecialidad(formData)

    // 2) Si el backend devuelve el creado real, reemplázalo
    // Ajusta estas claves a tu respuesta: { ok, especialidad }
    if (res?.ok && res?.especialidad) {
      especialidades.value = especialidades.value.map(e =>
        e._id === tempId ? res.especialidad : e
      )
    }

    openModalAgregar.value = false
    notify.success('Especialidad creada correctamente.')
  } catch (error) {
    // 3) Rollback si falla
    especialidades.value = especialidades.value.filter(e => e._id !== tempId) // 👈
    notify.error(error.message || 'No se pudo crear la especialidad.')
  }
}

// --------- READ inicial (una sola vez) ----------
onMounted(async () => {
  try {
    const resp = await EspecialidadService.getEspecialidades()
    especialidades.value = Array.isArray(resp?.especialidades) ? resp.especialidades : []
  } catch (e) {
    console.error('Error cargando especialidades', e)
    especialidades.value = []
  }
})

// --------- FILTER local ----------
const filtradas = computed(() => {
  const q = nombre.value.trim().toLowerCase()
  if (!q) return especialidades.value
  return especialidades.value.filter(e =>
    (e.nombre ?? '').toLowerCase().includes(q) ||
    (e.descripcion ?? '').toLowerCase().includes(q)
  )
})

// --------- UPDATE (optimista) ----------
async function editar (item) {
  itemSeleccionado.value = { ...item } // editar sobre una copia
  openEditar.value = true
}

async function actualizarEspecialidad (payload) {
  // payload: { id | _id, nombre, descripcion }
  const id = payload.id ?? payload._id // acepta ambos
  if (!(await confirm({ type: 'edit', text: '¿Guardar los cambios realizados?' }))) return

  // 1) Guardar snapshot previo
  const idx = especialidades.value.findIndex(e => e._id === id)
  if (idx === -1) return
  const previo = { ...especialidades.value[idx] }

  // 2) Optimista: actualiza en memoria
  especialidades.value[idx] = { ...previo, nombre: payload.nombre, descripcion: payload.descripcion } // 👈

  try {
    console.log(payload)
    const res = await EspecialidadService.actualizarEspecialidad(id, {
      nombre: payload.nombre,
      descripcion: payload.descripcion,
    })

    // 3) Si tu backend retorna el objeto final, lo unificas para asegurar consistencia
    if (res?.ok && res?.especialidad) {
      especialidades.value[idx] = res.especialidad
    }

    notify.success('Especialidad actualizada correctamente.')
    openEditar.value = false
    itemSeleccionado.value = null
  } catch (error) {
    // 4) Rollback si falla
    especialidades.value[idx] = previo // 👈
    notify.error(error.message || 'No se pudo actualizar la especialidad.')
  }
}

// --------- DELETE (optimista) ----------
async function eliminar (item) {
  if (!(await confirm({ type: 'delete', text: `Se eliminará la especialidad "${item.nombre}".` }))) return

  // 1) Optimista: quita de la lista
  const previo = [...especialidades.value]
  especialidades.value = especialidades.value.filter(e => e._id !== item._id) // 👈

  try {
    await EspecialidadService.eliminarEspecialidad(item._id)
    notify.success('Especialidad eliminada correctamente.')
  } catch (error) {
    // 2) Rollback si falla
    especialidades.value = previo // 👈
    notify.error(error.message || 'No se pudo eliminar la especialidad.')
  }
}

// --------- tabla ---------
const columns = [
  { label: 'Nombre', field: 'nombre', thClass: 'px-4 py-3', tdClass: 'px-4 py-3 text-slate-900' },
  { label: 'Descripción', field: 'descripcion', thClass: 'px-4 py-3', tdClass: 'px-4 py-3 text-slate-700' },
  { label: 'Opciones', field: 'acciones', sortable: false, thClass: 'px-4 py-3 text-right w-40', tdClass: 'px-4 py-3 text-right' },
]

const paginationOptions = {
  enabled: true,
  perPage: 10,
  perPageDropdown: [10, 20, 50],
  mode: 'pages',
}
</script>


<template>
  <section class="p-4 md:p-6">
    <!-- Buscador -->
    <div class="mb-4 flex flex-col sm:flex-row gap-3 sm:items-center">
      <input type="text" v-model="nombre" @keyup.enter="buscar" placeholder="Buscar especialidad…"
        class="w-full sm:max-w-md rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
        aria-label="Buscar especialidad" />

      <div class="flex flex-wrap gap-2">
        <!-- Buscar -->
        <button @click="buscar"
          class="inline-flex items-center gap-2 rounded-xl border border-cyan-600 px-4 py-2 text-sm font-medium text-cyan-700 hover:bg-cyan-600 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2"
          aria-label="Buscar" title="Buscar">
          <MagnifyingGlassIcon class="h-5 w-5" />
          Buscar
        </button>

        <!-- Agregar (abre modal) -->
        <button @click="agregar"
          class="inline-flex items-center gap-2 rounded-xl border border-emerald-600 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-600 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2"
          aria-label="Agregar" title="Agregar">
          <PlusIcon class="h-5 w-5" />
          Agregar
        </button>

        <!-- Actualizar (recarga lista) -->
        <button @click="actualizar"
          class="inline-flex items-center gap-2 rounded-xl border border-indigo-600 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-600 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
          aria-label="Actualizar" title="Actualizar">
          <ArrowPathIcon class="h-5 w-5" />
          Actualizar
        </button>
      </div>
    </div>


    <!-- Tabla -->
    <VueGoodTable :columns="columns" :rows="filtradas" :search-options="{ enabled: false }"
      :pagination-options="paginationOptions" styleClass="vgt-table condensed"
      class="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <!-- Celda personalizada para 'Opciones' -->
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
          {{ props.formattedRow[props.column.field] }}
        </template>
      </template>

      <!-- Vacío -->
      <template #emptystate>
        <div class="py-8 text-center text-slate-500">No se encontraron especialidades.</div>
      </template>
    </VueGoodTable>
  </section>
  <EspecialidadCrearView v-model:open="openModalAgregar" @save="crearEspecialidad" />

  <EspecialidadEditarView v-model:open="openEditar" :item="itemSeleccionado" :loading="false"
    title="Editar especialidad" @save="actualizarEspecialidad" @cancel="itemSeleccionado = null" />
</template>
