<script setup>
import { ref, watch, nextTick } from 'vue'
import { useNotify } from '@/components/useNotify.js'
const notify = useNotify()
const props = defineProps({
  open: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  title:  { type: String, default: 'Nueva especialidad' },
})

const emit = defineEmits(['update:open', 'save', 'cancel'])

const nombre = ref('')
const descripcion = ref('')
const nombreInput = ref(null)

watch(() => props.open, async (v) => {
  if (v) {
    nombre.value = ''
    descripcion.value = ''
    await nextTick()
    nombreInput.value?.focus()
  }
})

function close () {
  emit('update:open', false)
  emit('cancel')
}
function save () {
  if (!nombre.value.trim()||!descripcion.value.trim()) {
  notify.warning('completa todos los campos')
}else {
  emit('save', { nombre: nombre.value.trim(), descripcion: descripcion.value.trim() })
}
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
          <div class="w-full max-w-lg rounded-2xl bg-white shadow-xl border border-slate-200">
            <!-- header -->
            <div class="px-6 py-4 border-b border-slate-100">
              <h2 class="text-lg font-semibold text-slate-900">{{ title }}</h2>
              <p class="text-sm text-slate-600">Ingresa nombre y descripción.</p>
            </div>

            <!-- body -->
            <div class="px-6 py-4 space-y-4">
              <div>
                <label class="block text-sm font-medium text-slate-700">Nombre</label>
                <input
                  ref="nombreInput"
                  v-model="nombre"
                  type="text"
                  class="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  placeholder="Ej. Pediatría"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700">Descripción</label>
                <textarea
                  v-model="descripcion"
                  rows="3"
                  class="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  placeholder="Breve descripción…"
                ></textarea>
              </div>
            </div>

            <!-- footer -->
            <div class="px-6 py-4 border-t border-slate-100 flex justify-end gap-2">
              <button
                @click="close"
                class="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                @click="save"
                :disabled="loading"
                class="rounded-xl border border-emerald-600 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-600 hover:text-white disabled:opacity-50"
              >
                Agregar
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
