<script setup>
import { ref, watch, nextTick, computed } from 'vue'
import VueSelect from 'vue3-select-component'
import OficinaService from '@/services/Oficina.service'
import SedeService from '@/services/Sedes.service'

const props = defineProps({
    open: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    title: { type: String, default: 'Registrar secretaria' },
})
const emit = defineEmits(['update:open', 'save', 'cancel'])

// --- Estado del formulario (Persona + Secretaria)
const form = ref({
    // Persona
    nombres: '',
    apellidos: '',
    identificacion: '',
    fecha_nacimiento: '',
    sexo: '',
    telefono: '',
    email: '',
    direccion: '',
    // Secretaria
    oficina: '',
    rol_secretaria: '',
    horario: '', sede: ''
})

// --- Catálogos
const oficinas = ref([])
const oficinaSelec = ref(null)
const sedes = ref([])
const sedeSelec = ref(null)

const opcionesSede = computed(() =>
    sedes.value.map(s => ({ label: s.nombre, value: s._id }))
)
const opcionesOficina = computed(() =>
    oficinas.value.map(o => ({ label: o.nombre, value: o._id }))
)

async function cargarOficinas(sedeId) {
    if (!sedeId) { oficinas.value = []; return }
    try {
        const resp = await OficinaService.listarOficinasPorSede(sedeId)
        oficinas.value = Array.isArray(resp?.oficinas) ? resp.oficinas : []
    } catch (e) {
        console.error('Error consultorios:', e)
        oficinas.value = []
    }
}
async function cargarSedes() {
    try {
        const resp = await SedeService.getSedes()
        sedes.value = Array.isArray(resp?.sedes) ? resp.sedes : []
    } catch (e) {
        console.error('Error consultorios:', e)
        consultorios.value = []
    }
}
watch(sedeSelec, (nuevaSedeId) => {
    oficinaSelec.value = null
    form.value.sede = nuevaSedeId || ''
    cargarOficinas(nuevaSedeId)
}, { immediate: false })



const opcionesRol = [
    { label: 'Recepción', value: 'RECEPCION' },
    { label: 'Admisión', value: 'ADMISION' },
]
// --- Al abrir el modal: reset + focos + catálogos
const primerInput = ref(null)
watch(() => props.open, async (v) => {
    if (!v) return
    // reset form
    form.value = {
        nombres: '',
        apellidos: '',
        identificacion: '',
        fecha_nacimiento: '',
        sexo: '',
        telefono: '',
        email: '',
        direccion: '',
        oficina: '',
        rol_secretaria: '',
        horario: ''
    }

    oficinaSelec.value = null

    await cargarSedes()
    await nextTick()
    primerInput.value?.focus()
})

// --- Sync selects
watch(oficinaSelec, (val) => {
    form.value.oficina = val || ''
}, { immediate: false })

// --- Acciones del modal
function close() {
    emit('update:open', false)
    emit('cancel')
}

function save() {
    const f = form.value
    // Validación mínima (como en tu plantilla de médicos)
    if (!f.nombres.trim() || !f.apellidos.trim() || !f.identificacion.trim() ||
        !f.fecha_nacimiento || !f.sexo || !f.email.trim() || !f.direccion.trim() ||
        !f.oficina || !f.rol_secretaria) {
        console.warn('Completa todos los campos obligatorios')
        return
    }
    emit('save', form.value)
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
                    <div class="w-full max-w-3xl rounded-2xl bg-white shadow-xl border border-slate-200 modal-violeta">
                        <!-- header -->
                        <div class="px-6 py-4 border-b border-slate-100">
                            <h2 class="text-lg font-semibold text-slate-900">{{ title }}</h2>
                            <p class="text-sm text-slate-600">Completa los datos personales y de secretaria.</p>
                        </div>

                        <!-- body -->
                        <div class="px-6 py-6 space-y-6 max-h-[70vh] overflow-auto">
                            <!-- Datos personales -->
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label class="block text-sm font-medium text-slate-700">Nombres</label>
                                    <input ref="primerInput" v-model="form.nombres" type="text" required
                                        class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-cyan-500" />
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-slate-700">Apellidos</label>
                                    <input v-model="form.apellidos" type="text" required
                                        class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-cyan-500" />
                                </div>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label class="block text-sm font-medium text-slate-700">Identificación</label>
                                    <input v-model="form.identificacion" type="text" required
                                        class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-cyan-500" />
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-slate-700">Fecha de nacimiento</label>
                                    <input v-model="form.fecha_nacimiento" type="date" required
                                        class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-cyan-500" />
                                </div>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label class="block text-sm font-medium text-slate-700">Sexo</label>
                                    <select v-model="form.sexo" required
                                        class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-cyan-500">
                                        <option value="">Seleccione</option>
                                        <option value="M">Masculino</option>
                                        <option value="F">Femenino</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-slate-700">Teléfono</label>
                                    <input v-model="form.telefono" type="tel"
                                        class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-cyan-500" />
                                </div>
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-slate-700">Email</label>
                                <input v-model="form.email" type="email" required
                                    class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-cyan-500" />
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-slate-700">Dirección</label>
                                <textarea v-model="form.direccion" required rows="2"
                                    class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-cyan-500"></textarea>
                            </div>

                            <!-- Datos de secretaria -->
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div class="space-y-3">
                                    <label class="block text-sm font-medium">Sede</label>
                                    <VueSelect v-model="sedeSelec" :options="opcionesSede"
                                        placeholder="Seleccione una sede..." />
                                    <label class="block text-sm font-medium">Oficina</label>
                                    <VueSelect v-model="oficinaSelec" :options="opcionesOficina"
                                        placeholder="Seleccione una oficina..." />
                                </div>

                                <div>
                                    <label class="block text-sm font-medium text-slate-700">Rol de secretaria</label>
                                    <VueSelect v-model="form.rol_secretaria"
                                        :options="[{ label: 'Recepción', value: 'RECEPCION' }, { label: 'Admisión', value: 'ADMISION' }]"
                                        placeholder="Seleccione un rol..." />
                                </div>
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-slate-700">Horario</label>
                                <input v-model="form.horario" type="text" placeholder="Ej: Lun-Vie 08:00-16:00"
                                    class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-cyan-500" />
                            </div>
                        </div>

                        <!-- footer -->
                        <div class="px-6 py-4 border-t border-slate-100 flex justify-end gap-2">
                            <button @click="close" class="btn-ghost btn-cancel">
                                Cancelar
                            </button>
                            <button @click="save" :disabled="loading" class="disabled:opacity-50 btn-save">
                                Guardar secretaria
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
