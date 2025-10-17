<script setup>
import { ref, watch, nextTick } from 'vue'
import { useNotify } from '@/components/useNotify.js'
const notify = useNotify()


const props = defineProps({
  open: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  title: { type: String, default: 'Editar especialidad' },
  item: { type: Object, default: null }     // <<< nuevo
})

const emit = defineEmits(['update:open', 'save', 'cancel'])

const nombre = ref('')
const descripcion = ref('')
const nombreInput = ref(null)

function cargarDesdeItem () {
  // Copia “shallow” para no mutar el objeto del padre mientras editas
  nombre.value = props.item?.nombre ?? ''
  descripcion.value = props.item?.descripcion ?? ''
}

watch(() => props.open, async (v) => {
  if (v) {
    cargarDesdeItem()
    await nextTick()
    nombreInput.value?.focus()
  } else {
    // opcional: limpiar al cerrar
    nombre.value = ''
    descripcion.value = ''
  }
})

// Si el padre cambia el item mientras está abierto, sincroniza
watch(() => props.item, (nuevo) => {
  if (props.open && nuevo) cargarDesdeItem()
})

function close () {
  emit('update:open', false)
  emit('cancel')
}

function save () {
  if (!nombre.value.trim() || !descripcion.value.trim()) {
    notify.warning('Completa todos los campos')
    return
  }
  // toma id de _id o id (según tu backend)
  const id = props.item?._id ?? props.item?.id
  emit('save', { id, nombre: nombre.value.trim(), descripcion: descripcion.value.trim() })
}

function onBackdrop (e) {
  if (e.target === e.currentTarget) close()
}
function onKeydown (e) {
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
          <div class="esp-modal w-full max-w-lg rounded-2xl shadow-xl border border-slate-200">
            
            <!-- header -->
            <div class="esp-head px-6 py-4 border-b border-slate-100">
              <h2 class="text-lg font-semibold text-slate-900">{{ title }}</h2>
              <p class="text-sm text-slate-600">Modifica los datos de la especialidad.</p>
            </div>

            <!-- body -->
            <div class="esp-body px-6 py-4 space-y-4">
              <div>
                <label class="block text-sm font-medium text-slate-700">Nombre</label>
                <input
                  ref="nombreInput"
                  v-model="nombre"
                  type="text"
                  class="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  placeholder="Ej. Pediatría"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700">Descripción</label>
                <textarea
                  v-model="descripcion"
                  rows="3"
                  class="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  placeholder="Breve descripción…"
                ></textarea>
              </div>
            </div>

            <!-- footer -->
            <div class="esp-foot px-6 py-4 border-t border-slate-100 flex justify-end gap-2">
              <button @click="close" class="btn-ghost btn-cancel">
                Cancelar
              </button>
              <button @click="save" :disabled="loading" class="esp-btn esp-btn--primary disabled:opacity-50">
                Editar
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .15s ease }
.fade-enter-from, .fade-leave-to { opacity: 0 }
</style>
