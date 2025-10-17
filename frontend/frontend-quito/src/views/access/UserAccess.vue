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
    imagenUrl: 'https://media.licdn.com/dms/image/v2/C561BAQGbGQBA_BcRMA/company-background_10000/company-background_10000/0/1604957424670/hospital_de_los_valles_cover?e=2147483647&v=beta&t=PzpzP8WaXRKW4_Tq_VR0APfSzd6OqVq6VWwIMFnK3T4'
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
  <div class="container">
  <section class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
    
    <!-- BOTÓN VOLVER -->
    <RouterLink 
      to="/" 
        class="btn-primary absolute top-4 left-4"
    >
      Volver
    </RouterLink>

    <header class="mb-8">
      <h2 class="text-2xl sm:text-3xl font-bold text-slate-900">Selecciona una sucursal</h2>
      <p class="mt-1 text-slate-600">Esta elección definirá el contexto para el siguiente paso.</p>
    </header>

    <div class="branches-grid">
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
  </div>
</template>
