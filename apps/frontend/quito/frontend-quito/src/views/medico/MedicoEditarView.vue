<!-- src/components/MedicoEditarView.vue -->
<script setup>
import { ref, watch, nextTick, computed, onMounted, onBeforeUnmount } from 'vue'
import VueSelect from 'vue3-select-component'
import SedeService from '@/services/Sedes.service'
import EspecialidadService from '@/services/Especialidad.service'
import ConsultorioService from '@/services/Consultorio.service'
import PersonaService from '@/services/Persona.service'

const props = defineProps({
  open: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  title: { type: String, default: 'Editar médico' },
  item: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['update:open', 'save', 'cancel'])

/** ---------- Estado ---------- */
const form = ref({
  _id: '',
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

const primerInput = ref(null)

/** ---------- Helpers ---------- */
function idDe(x) {
  if (!x) return ''
  if (typeof x === 'string') return x
  return x._id ?? x.id ?? ''
}

function toYMD(dateLike) {
  if (!dateLike) return ''
  // Asegura formato YYYY-MM-DD sin desfases de zona horaria
  const d = new Date(dateLike)
  return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0]
}

/** ---------- Carga de catálogos ---------- */
async function cargarSedesYEspecialidades() {
  try {
    const [respSede, respEsp] = await Promise.all([
      SedeService.getSedes(),
      EspecialidadService.getEspecialidades({ page: 1, pageSize: 40 })
    ])
    sedes.value = respSede?.sedes ?? []
    especialidades.value = Array.isArray(respEsp?.items)
      ? respEsp.items
      : (respEsp?.especialidades ?? [])
  } catch (e) {
    console.error('Error catálogos:', e)
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

/** ---------- Snapshot (detectar cambios) ---------- */
const original = ref(null)

function normalizeForCompare(f) {
  return {
    _id: f._id ?? '',
    nombres: (f.nombres ?? '').trim(),
    apellidos: (f.apellidos ?? '').trim(),
    identificacion: (f.identificacion ?? '').trim(),
    fecha_nacimiento: f.fecha_nacimiento ?? '',
    sexo: f.sexo ?? '',
    telefono: (f.telefono ?? '').trim(),
    email: (f.email ?? '').trim().toLowerCase(),
    direccion: (f.direccion ?? '').trim(),
    consultorio: f.consultorio ?? '',
    horario: (f.horario ?? '').trim(),
    sede: f.sede ?? '',
    especialidad: f.especialidad ?? '',
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

// Opcional: mostrar campos que cambiaron
const cambios = computed(() => {
  if (!original.value) return {}
  const cur = normalizeForCompare(form.value)
  const prev = original.value
  const diff = {}
  for (const k of Object.keys(cur)) {
    if (cur[k] !== prev[k]) diff[k] = { antes: prev[k], ahora: cur[k] }
  }
  return diff
})

/** ---------- Pre-carga al abrir ---------- */
async function hydrateFromItem() {
  const it = props.item ?? {}

  // Persona
  let pers = null
  try {
    if (it?.persona?._id) {
      pers = await PersonaService.buscarPersona(it.persona._id)
    }
  } catch (e) {
    console.error('Error obteniendo persona:', e)
  }

  const sedeId = idDe(it.sede)
  const consultorioId = idDe(it.consultorio)
  const especialidadId = idDe(it.especialidad)

  const personaData = pers?.persona ?? {}

  form.value = {
    _id: it._id ?? it.id ?? '',
    nombres: personaData.nombres ?? '',
    apellidos: personaData.apellidos ?? '',
    identificacion: personaData.identificacion ?? '',
    fecha_nacimiento: toYMD(personaData.fecha_nacimiento),
    sexo: personaData.sexo ?? '',
    telefono: personaData.telefono ?? '',
    email: personaData.email ?? '',
    direccion: personaData.direccion ?? '',
    consultorio: consultorioId,
    horario: it.horario ?? '',
    sede: sedeId,
    especialidad: especialidadId
  }

  // set selects
  sedeSelec.value = sedeId || null
  especialidadSelec.value = especialidadId || null

  await cargarSedesYEspecialidades()
  await cargarConsultorios(sedeId)
  consultorioSelec.value = consultorioId || null

  await nextTick()
  primerInput.value?.focus()

  // Guardar snapshot para detectar cambios
  takeSnapshot()
}

/** ---------- Watchers ---------- */
watch(() => props.open, async (v) => {
  if (!v) return
  await hydrateFromItem()
})

watch(() => props.item, async () => {
  if (!props.open) return
  await hydrateFromItem()
})

/** ---------- Selects dependientes ---------- */
watch(sedeSelec, (nuevaSedeId) => {
  consultorioSelec.value = null
  form.value.sede = nuevaSedeId || ''
  cargarConsultorios(nuevaSedeId)
})
watch(consultorioSelec, (nuevoConsultorioId) => {
  form.value.consultorio = nuevoConsultorioId || ''
})
watch(especialidadSelec, (nuevaEspecialidadId) => {
  form.value.especialidad = nuevaEspecialidadId || ''
})

/** ---------- Guardas de navegación (opcional) ---------- */
function beforeUnloadGuard(e) {
  if (hayCambios.value) {
    e.preventDefault()
    e.returnValue = ''
  }
}
onMounted(() => window.addEventListener('beforeunload', beforeUnloadGuard))
onBeforeUnmount(() => window.removeEventListener('beforeunload', beforeUnloadGuard))

/** ---------- Acciones ---------- */
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
  if (!f.nombres.trim() || !f.apellidos.trim() || !f.identificacion.trim() ||
    !f.fecha_nacimiento || !f.sexo || !f.email.trim() || !f.direccion.trim() ||
    !f.sede || !f.consultorio || !f.especialidad) {
    console.warn('Completa todos los campos obligatorios')
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
          <!-- 🔹 Card con los estilos del modal de crear -->
          <div class="modal-card w-full max-w-3xl">
            <!-- header estilizado -->
            <div class="modal-head">
              <h2 class="text-lg">{{ title }}</h2>
              <p class="text-sm">Actualiza los datos del médico.</p>
            </div>

            <!-- body estilizado -->
            <div class="modal-body space-y-6">
              <!-- Datos personales -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block">Nombres</label>
                  <input ref="primerInput" v-model="form.nombres" type="text" required />
                </div>
                <div>
                  <label class="block">Apellidos</label>
                  <input v-model="form.apellidos" type="text" required />
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block">Identificación</label>
                  <input v-model="form.identificacion" type="text" required />
                </div>
                <div>
                  <label class="block">Fecha de nacimiento</label>
                  <input v-model="form.fecha_nacimiento" type="date" required />
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block">Sexo</label>
                  <select v-model="form.sexo" required>
                    <option value="">Seleccione</option>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                  </select>
                </div>
                <div>
                  <label class="block">Teléfono</label>
                  <input v-model="form.telefono" type="tel" />
                </div>
              </div>

              <div>
                <label class="block">Email</label>
                <input v-model="form.email" type="email" required />
              </div>

              <div>
                <label class="block">Dirección</label>
                <textarea v-model="form.direccion" required rows="2"></textarea>
              </div>

              <!-- Datos del médico -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-3">
                  <label class="block">Sede</label>
                  <VueSelect v-model="sedeSelec" :options="opcionesSede" placeholder="Seleccione una sede..." />

                  <label class="block">Consultorio</label>
                  <VueSelect
                    v-model="consultorioSelec"
                    :options="opcionesConsultorio"
                    placeholder="Seleccione un consultorio..."
                    :disabled="!sedeSelec"
                  />

                  <label class="block">Especialidad</label>
                  <VueSelect
                    v-model="especialidadSelec"
                    :options="opcionesEspecialidad"
                    placeholder="Seleccione una especialidad..."
                    :disabled="!sedeSelec"
                  />
                </div>

                <div>
                  <label class="block">Horario</label>
                  <input v-model="form.horario" type="text" placeholder="Ej: Lun-Vie 08:00-16:00" />
                </div>
              </div>
            </div>

            <!-- footer estilizado -->
            <div class="modal-foot">
              <button @click="close" class="btn-ghost btn-cancel">Cancelar</button>
              <button
                @click="save"
                :disabled="loading || !hayCambios"
                class="btn-ghost"
                style="border-color: var(--ok-500); color: var(--ok-600);"
              >
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
