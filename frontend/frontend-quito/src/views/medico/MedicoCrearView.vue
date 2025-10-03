<!-- src/components/MedicoCrearModal.vue -->
<script setup>
import { ref, watch, nextTick, computed } from 'vue'
import VueSelect from 'vue3-select-component'
import SedeService from '@/services/Sedes.service'
import EspecialidadService from '@/services/Especialidad.service'
import ConsultorioService from '@/services/Consultorio.service'

const props = defineProps({
  open: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  title: { type: String, default: 'Registrar médico' },
})
const emit = defineEmits(['update:open', 'save', 'cancel'])

// --- Estado del formulario
const form = ref({
  nombres: '',
  apellidos: '',
  identificacion: '',
  fecha_nacimiento: '',
  sexo: '',
  telefono: '',
  email: '',
  direccion: '',
  consultorio: '',
  horario: '',
  sede: '',
  especialidad: ''
})

// --- Selects y catálogos
const sedes = ref([])
const consultorios = ref([])
const especialidades = ref([])

const sedeSelec = ref(null)
const consultorioSelec = ref(null)
const especialidadSelec = ref(null)

const opcionesSede = computed(() =>
  sedes.value.map(s => ({ label: s.nombre, value: s._id }))
)
const opcionesConsultorio = computed(() =>
  consultorios.value.map(c => ({ label: `${c.codigo}-${c.nombre}`, value: c._id }))
)
const opcionesEspecialidad = computed(() =>
  especialidades.value.map(e => ({ label: e.nombre, value: e._id }))
)

async function cargarSedesYEspecialidades() {
  try {
    const [respSede, respEsp] = await Promise.all([
      SedeService.getSedes(),
      EspecialidadService.getEspecialidades({ page: 1, pageSize: 40 }) // o tu get simple
    ])
    sedes.value = respSede?.sedes ?? []
    especialidades.value = respEsp?.items ?? respEsp?.especialidades ?? []
  } catch (e) {
    console.error('Error cargando catálogos:', e)
    sedes.value = []
    especialidades.value = []
  }
}

async function cargarConsultorios(sedeId) {
  if (!sedeId) { consultorios.value = []; return }
  try {
    const resp = await ConsultorioService.getByIdConsultorios(sedeId)
    consultorios.value = Array.isArray(resp?.consultorios) ? resp.consultorios : []
  } catch (e) {
    console.error('Error consultorios:', e)
    consultorios.value = []
  }
}

// --- Al abrir el modal: reset + focos + cargar catálogos
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
    consultorio: '',
    horario: '',
    sede: '',
    especialidad: ''
  }
  sedeSelec.value = null
  consultorioSelec.value = null
  especialidadSelec.value = null

  await cargarSedesYEspecialidades()
  await nextTick()
  primerInput.value?.focus()
})

// --- Watches de selects dependientes
watch(sedeSelec, (nuevaSedeId) => {
  consultorioSelec.value = null
  form.value.sede = nuevaSedeId || ''
  cargarConsultorios(nuevaSedeId)
}, { immediate: false })

watch(consultorioSelec, (nuevoConsultorioId) => {
  form.value.consultorio = nuevoConsultorioId || ''
}, { immediate: false })

watch(especialidadSelec, (nuevaEspecialidadId) => {
  form.value.especialidad = nuevaEspecialidadId || ''
}, { immediate: false })

// --- Acciones del modal
function close() {
  emit('update:open', false)
  emit('cancel')
}
function save() {
  // Validación mínima
  const f = form.value
  if (!f.nombres.trim() || !f.apellidos.trim() || !f.identificacion.trim() ||
    !f.fecha_nacimiento || !f.sexo || !f.email.trim() || !f.direccion.trim() ||
    !f.sede || !f.consultorio || !f.especialidad) {
    // Aquí puedes integrar tu notify/toast
    console.warn('Completa todos los campos obligatorios')
    console.log(form.value)
    return
  }
  emit('save',  form.value )
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
          <div class="w-full max-w-3xl rounded-2xl bg-white shadow-xl border border-slate-200">
            <!-- header -->
            <div class="px-6 py-4 border-b border-slate-100">
              <h2 class="text-lg font-semibold text-slate-900">{{ title }}</h2>
              <p class="text-sm text-slate-600">Completa los datos del nuevo médico.</p>
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

              <!-- Datos del médico -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-3">
                  <label class="block text-sm font-medium">Sede</label>
                  <VueSelect v-model="sedeSelec" :options="opcionesSede" placeholder="Seleccione una sede..." />

                  <label class="block text-sm font-medium">Consultorio</label>
                  <VueSelect v-model="consultorioSelec" :options="opcionesConsultorio"
                    placeholder="Seleccione un consultorio..." :disabled="!sedeSelec" />

                
                </div>

                <div >
                    <label class="block text-sm font-medium">Especialidad</label>
                  <VueSelect v-model="especialidadSelec" :options="opcionesEspecialidad"
                    placeholder="Seleccione una especialidad..." :disabled="!sedeSelec" />
                  <label class="block text-sm font-medium text-slate-700">Horario</label>
                  <input v-model="form.horario" type="text" placeholder="Ej: Lun-Vie 08:00-16:00"
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
              <button @click="save" :disabled="loading"
                class="rounded-xl border border-emerald-600 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-600 hover:text-white disabled:opacity-50">
                Guardar médico
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
