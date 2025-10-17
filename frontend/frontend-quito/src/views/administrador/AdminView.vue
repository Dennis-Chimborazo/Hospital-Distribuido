<script setup>
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()

const nav = [
  { label: 'Medicos', name: 'medico', icon: '👨‍⚕️' },
  { label: 'Especialidades', name: 'especialidad', icon: '⚕️	' },
  { label: 'Secretarias', name: 'secretaria', icon: '👩‍💼	' },
  { label: 'Estadísticas', name: 'especialidad', icon: '📈	' },

]

const isActive = (name) => computed(() => route.name === name)
</script>

<template>
  <div class="admin-shell">
    <!-- NAVBAR LATERAL -->
    <aside class="admin-aside">
      <div class="aside-head">
        <h1 class="brand">Hospital Vida Sana</h1>
        <p class="brand-sub">Panel de administración</p>
      </div>

      <nav class="aside-nav">
        <ul class="space-y-1">
          <li v-for="item in nav" :key="item.name">
            <RouterLink :to="{ name: item.name }" class="aside-link"
              :class="isActive(item.name).value ? 'is-active' : ''">
              <span class="aside-ico">{{ item.icon }}</span>
              <span class="aside-text">{{ item.label }}</span>
            </RouterLink>
          </li>
        </ul>

        <div class="aside-sep"></div>

        <button class="aside-logout">
          ⎋ <span>Cerrar sesión</span>
        </button>
      </nav>
    </aside>
    

    <!-- CONTENIDO -->
    <main class="admin-main">
      <section class="panel">
        
        <div class="panel-body">
          <RouterView />
        </div>
      </section>
    </main>
  </div>

</template>
