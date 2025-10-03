<script setup> 
import LoginCard from '@/components/LoginCard.vue'
import { ref } from 'vue'
import { useRouter, RouterLink, RouterView } from 'vue-router'

const router = useRouter()
const seleccion = ref(null)

const sucursales = [
  {
    id: 'Quito',
    nombre: 'Quito',
    ciudad: 'Matriz',
    imagenUrl: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?q=80&w=1200&auto=format&fit=crop'
  },
  {
    id: 'Guayaquil',
    nombre: 'Guayaquil',
    ciudad: 'Sucursal',
    imagenUrl: 'https://images.unsplash.com/photo-1529101091764-c3526daf38fe?q=80&w=1200&auto=format&fit=crop'
  },
  {
    id: 'Cuenca',
    nombre: 'Cuenca',
    ciudad: 'Sucursal',
    imagenUrl: 'https://images.unsplash.com/photo-1584432810601-6c7f27d2362b?q=80&w=1200&auto=format&fit=crop'
  }
]

function onSelect(sucursal) {
  switch (sucursal.id) {
    case 'Quito':
      router.push({ name: 'Login' })
      break;
    case 'Guayaquil':
      seleccion.value = sucursal.id
      break;
    case 'Cuenca':
      window.open('http://localhost:3000/', '_blank') 
      break;
  }
}
</script>

<template>
  <section class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
    
    <!-- BOTÓN VOLVER -->
    <RouterLink 
      to="/" 
      class="mb-6 inline-flex items-center gap-2 rounded-xl border border-cyan-600 px-4 py-2 text-sm font-medium text-cyan-700 hover:bg-cyan-600 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2"
    >
      Volver
    </RouterLink>

    <header class="mb-8">
      <h2 class="text-2xl sm:text-3xl font-bold text-slate-900">Selecciona una sucursal</h2>
      <p class="mt-1 text-slate-600">Esta elección definirá el contexto para el siguiente paso.</p>
    </header>

    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <LoginCard
        v-for="s in sucursales"
        :key="s.id"
        :id="s.id"
        :nombre="s.nombre"
        :ciudad="s.ciudad"
        :imagenUrl="s.imagenUrl"
        :selected="seleccion === s.id"
        @select="onSelect"
      />
    </div>
  </section>
</template>
