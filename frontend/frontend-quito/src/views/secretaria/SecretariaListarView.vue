<script setup>
import { ref, onMounted, computed } from 'vue'
import { VueGoodTable } from 'vue-good-table-next'
import 'vue-good-table-next/dist/vue-good-table-next.css'

import SecretariaCrearView from './SecretariaCrearView.vue'
import SecretariaeditarView from './SecretariaeditarView.vue'

import SecretariaService from '@/services/Secretaria.service'
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
const secretarias = ref([])
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
async function fetchSecretarias() {
    loading.value = true
    try {
        const resp = await SecretariaService.listarSecretarias()
        // Acepta resp.items o resp.secretarias o arreglo directo
        const data = Array.isArray(resp?.items)
            ? resp.items
            : (Array.isArray(resp?.secretarias) ? resp.secretarias : (Array.isArray(resp) ? resp : []))

        if (!data.length) {
            notify.warning('No se encontraron secretarias')
        }
        secretarias.value = data
    } catch (e) {
        console.error('Error cargando secretarias', e)
        secretarias.value = []
        notify.error(e?.message ?? 'No se pudieron cargar las secretarias')
    } finally {
        loading.value = false
    }
}

onMounted(fetchSecretarias)

// --- Búsqueda client-side ---
const filtradas = computed(() => {
    const q = nombre.value.trim().toLowerCase()
    if (!q) return secretarias.value
    return secretarias.value.filter(s => {
        const full = `${s.persona?.nombres ?? ''} ${s.persona?.apellidos ?? ''}`.toLowerCase()
        return (
            full.includes(q) ||
            (s.persona?.identificacion ?? '').toLowerCase().includes(q) ||
            (s.oficina?.nombre ?? '').toLowerCase().includes(q) ||
            (s.rol_secretaria ?? '').toLowerCase().includes(q) ||
            (s.horario ?? '').toLowerCase().includes(q)
        )
    })
})

// --- Crear (optimista) ---
async function crearSecretaria(payload) {
    try {
        loading.value = true
        const creada = await SecretariaService.crearSecretaria(payload)
        // Inserta arriba para sensación de inmediatez
        secretarias.value.unshift(creada)
        notify.success('Secretaria creada correctamente.')
        openCrear.value = false
    } catch (e) {
        notify.error(e?.message ?? 'No se pudo crear la secretaria')
    } finally {
        loading.value = false
    }
}

// --- Editar ---
function editar(row) {
    itemSeleccionado.value = row
    openEditar.value = true
}

async function actualizarSecretaria(payload) {
    const id = payload._id ?? payload.id
    if (!id) {
        notify.error('No se encontró el identificador de la secretaria.')
        return
    }
    const ok = await confirm({ type: 'edit', text: '¿Guardar los cambios de la secretaria?' })
    if (!ok) return
    try {
        loading.value = true
        const actualizada = await SecretariaService.actualizarSecretaria(id, payload)
        const idx = secretarias.value.findIndex(s => (s._id ?? s.id) === id)
        if (idx !== -1) secretarias.value[idx] = actualizada
        notify.success('Secretaria actualizada correctamente.')
        cerrarEditar()
    } catch (e) {
        notify.error(e?.message ?? 'No se pudo actualizar la secretaria')
    } finally {
        loading.value = false
    }
}

// --- Eliminar ---
async function eliminar(row) {
    const id = row._id ?? row.id
    if (!id) {
        notify.error('No se encontró el identificador de la secretaria.')
        return
    }
    const ok = await confirm({
        type: 'delete',
        text: `Se eliminará a la secretaria "${row.persona?.nombres ?? ''} ${row.persona?.apellidos ?? ''}".`
    })
    if (!ok) return
    try {
        loading.value = true
        await SecretariaService.eliminarSecretaria(id)
        secretarias.value = secretarias.value.filter(s => (s._id ?? s.id) !== id)
        notify.success('Secretaria eliminada correctamente.')
    } catch (e) {
        notify.error(e?.message ?? 'No se pudo eliminar la secretaria')
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
        label: 'Oficina',
        field: row => row.oficina?.nombre ?? '-',
        thClass: 'px-4 py-3',
        tdClass: 'px-4 py-3'
    },
    {
        label: 'Rol',
        field: row => row.rol_secretaria ?? '-',
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
    }
]

// paginación local
const paginationOptions = {
    enabled: true,
    perPage: 10,
    perPageDropdown: [10, 20, 50],
    mode: 'pages'
}
</script>

<template>
    <section class="p-4 md:p-6">
        <!-- Buscador + acciones -->
        <div class="mb-4 flex flex-col sm:flex-row gap-3 sm:items-center">
            <input type="text" v-model="nombre" placeholder="Buscar secretaria…"
                class="w-full sm:max-w-md rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
                aria-label="Buscar secretaria" />

            <div class="flex flex-wrap gap-2">
                <button
                    class="inline-flex items-center gap-2 rounded-xl border border-cyan-600 px-4 py-2 text-sm font-medium text-cyan-700 hover:bg-cyan-600 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2"
                    aria-label="Buscar" title="Buscar">
                    <MagnifyingGlassIcon class="h-5 w-5" />
                    Buscar
                </button>

                <button @click="abrirCrear"
                    class="inline-flex items-center gap-2 rounded-xl border border-emerald-600 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-600 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2"
                    aria-label="Agregar" title="Agregar">
                    <PlusIcon class="h-5 w-5" />
                    Nueva secretaria
                </button>

                <button @click="fetchSecretarias" :disabled="loading"
                    class="inline-flex items-center gap-2 rounded-xl border border-indigo-600 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-600 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 disabled:opacity-50"
                    aria-label="Actualizar" title="Actualizar">
                    <ArrowPathIcon class="h-5 w-5" />
                    {{ loading ? 'Actualizando…' : 'Actualizar' }}
                </button>
            </div>
        </div>

        <!-- Tabla -->
        <VueGoodTable :columns="columns" :rows="filtradas" :search-options="{ enabled: false }"
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
                <div class="py-8 text-center text-slate-500">No se encontraron secretarias.</div>
            </template>
        </VueGoodTable>
    </section>

    <!-- Modales -->
    <SecretariaCrearView v-model:open="openCrear" :loading="loading" title="Registrar nueva secretaria"
        @save="crearSecretaria" />

    <SecretariaeditarView v-model:open="openEditar" :item="itemSeleccionado" :loading="loading"
        title="Editar secretaria" @save="actualizarSecretaria" @cancel="cerrarEditar" />
</template>
