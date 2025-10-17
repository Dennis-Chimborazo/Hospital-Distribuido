<script setup>
import { ref, watch, nextTick, computed, onMounted, onBeforeUnmount } from 'vue'
import VueSelect from 'vue3-select-component'

import PersonaService from '@/services/Persona.service'
import OficinaService from '@/services/Oficina.service'

const props = defineProps({
    open: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    title: { type: String, default: 'Editar secretaria' },
    item: { type: Object, default: () => ({}) } // {_id, persona:{...}, oficina:{...}, rol_secretaria, horario}
})

const emit = defineEmits(['update:open', 'save', 'cancel'])

/* ------------ Helpers ------------ */
function idDe(x) {
    if (!x) return ''
    if (typeof x === 'string') return x
    return x._id ?? x.id ?? ''
}

/* ------------ Estado ------------ */
const form = ref({
    _id: '',
    persona: '',          // ObjectId
    oficina: '',          // ObjectId
    rol_secretaria: '',   // RECEPCION | ADMISION
    horario: ''           // opcional
})

const personas = ref([])     // resultados de búsqueda
const oficinas = ref([])

const personaSelec = ref(null)
const oficinaSelec = ref(null)
const rolSelec = ref(null)

const opcionesPersonas = computed(() =>
    personas.value.map(p => ({
        label: `${p.nombres ?? ''} ${p.apellidos ?? ''} — ${p.identificacion ?? ''}`.trim(),
        value: p._id
    }))
)

const opcionesOficina = computed(() =>
    oficinas.value.map(o => ({ label: o.nombre, value: o._id }))
)

const opcionesRol = [
    { label: 'Recepción', value: 'RECEPCION' },
    { label: 'Admisión', value: 'ADMISION' },
]

/* ------------ Catálogos ------------ */
const buscandoPersonas = ref(false)
let personaAbortCtrl = null

async function buscarPersonasRemoto(q = '') {
    buscandoPersonas.value = true
    try {
        if (personaAbortCtrl) personaAbortCtrl.abort()
        personaAbortCtrl = new AbortController()

        const resp = await PersonaService.buscarPersonas({
            q, page: 1, pageSize: 20, signal: personaAbortCtrl.signal
        })
        personas.value = Array.isArray(resp?.items)
            ? resp.items
            : (Array.isArray(resp?.personas) ? resp.personas : (Array.isArray(resp) ? resp : []))
    } catch (_) {
        personas.value = []
    } finally {
        buscandoPersonas.value = false
    }
}

async function cargarOficinas() {
    try {
        const resp = await OficinaService.getOficinas()
        oficinas.value = resp?.oficinas ?? resp?.items ?? (Array.isArray(resp) ? resp : [])
    } catch (e) {
        oficinas.value = []
    }
}

/* ------------ Snapshot para detectar cambios ------------ */
const original = ref(null)

function normalizeForCompare(f) {
    return {
        _id: f._id ?? '',
        persona: f.persona ?? '',
        oficina: f.oficina ?? '',
        rol_secretaria: f.rol_secretaria ?? '',
        horario: (f.horario ?? '').trim()
    }
}

function takeSnapshot() {
    original.value = normalizeForCompare(form.value)
}

function deepEqual(a, b) {
    return JSON.stringify(a) === JSON.stringify(b)
}

const hayCambios = computed(() => {
    if (!original.value) return false
    return !deepEqual(normalizeForCompare(form.value), original.value)
})

/* ------------ Pre-carga al abrir ------------ */
const primerInput = ref(null)

async function hydrateFromItem() {
    const it = props.item ?? {}

    const personaId = idDe(it.persona)
    const oficinaId = idDe(it.oficina)
    const rol = it.rol_secretaria ?? ''
    const horario = it.horario ?? ''

    // Precargar catálogos
    await Promise.all([cargarOficinas(), buscarPersonasRemoto('')])

    // Si vino persona/oficina pobladas, intenta insertarlas en los selects (por si no salen en la 1ra búsqueda)
    // Persona: si ya está en la lista, bien; si no, agréguela temporalmente
    if (personaId && !personas.value.some(p => p._id === personaId) && it.persona) {
        personas.value.unshift(it.persona)
    }
    if (oficinaId && !oficinas.value.some(o => o._id === oficinaId) && it.oficina) {
        oficinas.value.unshift(it.oficina)
    }

    form.value = {
        _id: it._id ?? it.id ?? '',
        persona: personaId,
        oficina: oficinaId,
        rol_secretaria: rol,
        horario
    }

    personaSelec.value = personaId || null
    oficinaSelec.value = oficinaId || null
    rolSelec.value = rol || null

    await nextTick()
    // input “fantasma” solo para colocar foco dentro del modal
    primerInput.value?.focus()

    takeSnapshot()
}

/* ------------ Watchers ------------ */
watch(() => props.open, async (v) => {
    if (!v) return
    await hydrateFromItem()
})

watch(() => props.item, async () => {
    if (!props.open) return
    await hydrateFromItem()
})

// Sync selects -> form
watch(personaSelec, (val) => { form.value.persona = val || '' })
watch(oficinaSelec, (val) => { form.value.oficina = val || '' })
watch(rolSelec, (val) => { form.value.rol_secretaria = val || '' })

/* ------------ Guard de navegación (opcional) ------------ */
function beforeUnloadGuard(e) {
    if (hayCambios.value) {
        e.preventDefault()
        e.returnValue = ''
    }
}
onMounted(() => window.addEventListener('beforeunload', beforeUnloadGuard))
onBeforeUnmount(() => window.removeEventListener('beforeunload', beforeUnloadGuard))

/* ------------ Acciones ------------ */
function close() {
    emit('update:open', false)
    emit('cancel')
}

function save() {
    if (!hayCambios.value) {
        console.warn('No hay cambios para guardar')
        return
    }
    const f = form.value
    if (!f._id) { console.warn('Falta _id'); return }
    if (!f.persona || !f.oficina || !f.rol_secretaria) {
        console.warn('Completa Persona, Oficina y Rol.')
        return
    }
    emit('save', { ...f, id: f._id })
}

function onBackdrop(e) {
    if (e.target === e.currentTarget) close()
}
function onKeydown(e) {
    if (e.key === 'Escape') close()
}
</script>

<template>
    <Teleport to="body">
        <transition name="fade">
            <div v-if="open" class="fixed inset-0 z-50" @keydown="onKeydown">
                <!-- fondo -->
                <div class="absolute inset-0 bg-slate-900/50" @click="onBackdrop"></div>

                <!-- contenedor -->
                <div class="absolute inset-0 flex items-center justify-center p-4">
                    <div class="w-full max-w-2xl rounded-2xl bg-white shadow-xl border border-slate-200">
                        <!-- header -->
                        <div class="px-6 py-4 border-b border-slate-100">
                            <h2 class="text-lg font-semibold text-slate-900">{{ title }}</h2>
                            <p class="text-sm text-slate-600">Actualiza los datos de la secretaria.</p>
                        </div>

                        <!-- body -->
                        <div class="px-6 py-6 space-y-6 max-h-[70vh] overflow-auto">
                            <!-- Campo invisible para foco inicial -->
                            <input ref="primerInput" class="hidden" />

                            <!-- Persona (búsqueda remota) -->
                            <div>
                                <label class="block text-sm font-medium text-slate-700">Persona</label>
                                <VueSelect v-model="personaSelec" :options="opcionesPersonas"
                                    :loading="buscandoPersonas" :filterable="false" :clearable="true"
                                    placeholder="Buscar y seleccionar persona…" @search="(q) => buscarPersonasRemoto(q)"
                                    noOptionsText="Sin resultados" />
                                <p class="mt-1 text-xs text-slate-500">Escribe nombre o identificación para buscar.</p>
                            </div>

                            <!-- Oficina -->
                            <div>
                                <label class="block text-sm font-medium text-slate-700">Oficina</label>
                                <VueSelect v-model="oficinaSelec" :options="opcionesOficina"
                                    placeholder="Seleccione una oficina…" />
                            </div>

                            <!-- Rol + Horario -->
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label class="block text-sm font-medium text-slate-700">Rol de secretaria</label>
                                    <VueSelect v-model="rolSelec" :options="opcionesRol"
                                        placeholder="Seleccione un rol…" />
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-slate-700">Horario (opcional)</label>
                                    <input v-model="form.horario" type="text" placeholder="Ej: L–V 08:00–17:00"
                                        class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-cyan-500" />
                                </div>
                            </div>
                        </div>

                        <!-- footer -->
                        <div class="px-6 py-4 border-t border-slate-100 flex justify-end gap-2">
                            <button @click="close"
                                class="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
                                Cancelar
                            </button>
                            <button @click="save" :disabled="loading || !hayCambios"
                                class="rounded-xl border border-emerald-600 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-600 hover:text-white disabled:opacity-50">
                                Guardar cambios
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </transition>
    </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity .15s ease
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0
}
</style>
