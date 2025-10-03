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
  <!-- Pantalla completa -->
  <div class="h-screen w-screen overflow-hidden bg-gradient-to-b from-sky-50 via-white to-cyan-50 text-slate-800">

    <!-- Grid de 2 columnas: aside fijo + contenido -->
    <div class="h-full grid grid-cols-1 md:grid-cols-[18rem_1fr]">

      <!-- NAVBAR LATERAL -->
      <aside class="h-full bg-white border-r border-slate-200/70 shadow-sm">
        <div class="px-5 py-5 border-b border-slate-100">
          <h1 class="text-lg font-semibold text-slate-900">Hospital Vida Sana</h1>
          <p class="text-xs text-slate-500">Panel de administración</p>
        </div>

        <nav class="h-[calc(100%-84px)] overflow-auto p-3">
          <ul class="space-y-1">
            <li v-for="item in nav" :key="item.name">
              <RouterLink
                :to="{ name: item.name }"
                class="flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition"
                :class="isActive(item.name).value
                  ? 'bg-cyan-100 text-cyan-900'
                  : 'text-slate-700 hover:bg-cyan-50 hover:text-cyan-700'"
              >
                <span class="text-base">{{ item.icon }}</span>
                <span>{{ item.label }}</span>
              </RouterLink>
            </li>
          </ul>

          <div class="mt-4 border-t border-slate-100 pt-3">
            <RouterLink
              :to="{ name: 'medico' }"
              class="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              ⚙️ <span>Ajustes</span>
            </RouterLink>
            <button
              class="mt-2 w-full text-left flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-rose-600 hover:bg-rose-50"
            >
              ⎋ <span>Cerrar sesión</span>
            </button>
          </div>
        </nav>
      </aside>

      <!-- CONTENIDO / SECTION PARA ABRIR VISTAS -->
      <main class="h-full overflow-auto p-4 md:p-6">
        <!-- Section contenedora donde se abren las nuevas secciones -->
        <section class="h-full min-h-full rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div class="px-4 sm:px-6 py-4 border-b border-slate-100">
            <h2 class="text-lg font-semibold text-slate-900">
              {{ route.meta?.title || 'Administración' }}
            </h2>
            <p class="text-sm text-slate-600">
              {{ route.meta?.subtitle || 'Gestione los recursos de la institución.' }}
            </p>
          </div>

          <!-- Área de trabajo con scroll si la vista crece -->
          <div class="h-[calc(100%-72px)] overflow-auto p-4 sm:p-6">
            <RouterView />
          </div>
        </section>
      </main>
    </div>
  </div>
</template>
