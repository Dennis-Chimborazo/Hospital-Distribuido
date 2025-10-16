<script setup>
const props = defineProps({
  id: { type: String, required: true },
  nombre: { type: String, required: true },
  ciudad: { type: String, required: true },
  imagenUrl: { type: String, default: '' },
  selected: { type: Boolean, default: false }
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
    class="branch-card cursor-pointer transition focus:outline-none focus:ring-2 focus:ring-cyan-400"
    :class="selected ? 'ring-2 ring-cyan-500' : ''"
    aria-label="Seleccionar sucursal"
  >
    <!-- Imagen -->
    <div class="h-40 w-full rounded-lg overflow-hidden mb-4 bg-slate-100">
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

    <!-- Info -->
    <div class="flex items-start justify-between gap-3 mb-3">
      <h3 class="text-lg font-semibold text-slate-900 leading-tight">
        {{ nombre }}
      </h3>
      <span class="chip chip--cyan">
        {{ ciudad }}
      </span>
    </div>

    <p class="text-sm text-slate-600">
      Haz click o presiona Enter para seleccionar esta sucursal.
    </p>

    <!-- Acción -->
    <div class="branch-actions">
      <span
        class="btn-primary"
      >
        Seleccionar
      </span>
    </div>
  </article>
</template>
