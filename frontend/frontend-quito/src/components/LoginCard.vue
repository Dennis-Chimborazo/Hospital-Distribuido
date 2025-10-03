<script setup>
const props = defineProps({
  id: { type: String, required: true },
  nombre: { type: String, required: true },
  ciudad: { type: String, required: true },
  imagenUrl: { type: String, default: '' },
  selected: { type: Boolean, default: false } // opcional: resaltar selección
})

const emit = defineEmits(['select'])

function select() {
  emit('select', { id: props.id, nombre: props.nombre, ciudad: props.ciudad })
}
</script>

<template>
  <article
    role="button"
    tabindex="0"
    @click="select"
    @keyup.enter="select"
    class="group overflow-hidden max-w-sm rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-cyan-400"
    :class="selected ? 'ring-2 ring-cyan-500' : ''"
    aria-label="Seleccionar sucursal"
  >
    <div class="h-40 w-full bg-slate-100">
      <img
        v-if="imagenUrl"
        :src="imagenUrl"
        :alt="`Imagen de ${nombre}`"
        class="h-40 w-full object-cover"
        loading="lazy"
      />
      <div v-else class="h-40 w-full grid place-content-center text-slate-400 text-sm">
        Sin imagen
      </div>
    </div>

    <div class="p-5">
      <div class="flex items-start justify-between gap-3">
        <h3 class="text-lg font-semibold text-slate-900 leading-tight">
          {{ nombre }}
        </h3>
        <span class="shrink-0 rounded-full bg-cyan-100 px-3 py-1 text-xs font-medium text-cyan-700">
          {{ ciudad }}
        </span>
      </div>

      <p class="mt-3 text-sm text-slate-500">
        Click o Enter para seleccionar.
      </p>

      <div class="mt-4">
        <span class="inline-flex rounded-xl border border-cyan-600 px-3 py-1 text-xs font-medium text-cyan-700
                      group-hover:bg-cyan-600 group-hover:text-white transition">
          Seleccionar
        </span>
      </div>
    </div>
  </article>
</template>
