<script setup>
import { useRouter, RouterLink } from 'vue-router'
const router = useRouter()

function goAcceso() {
  router.push({ name: 'AccessUser' })
}
const branches = [
  {
    id: "matriz",
    nombre: "Hospital Vida Sana - Matriz",
    ciudad: "Quito",
    direccion: "Av. Amazonas N34-140 y República",
    horario: "Lun–Sáb 07:00–20:00",
    telefono: "+593 2 600 0000",
    maps: "https://www.google.com/maps/search/?api=1&query=Av.+Amazonas+N34-140+Quito+Ecuador",
    whatsapp: "https://wa.me/593960000000?text=Hola%20deseo%20información"
  },
  {
    id: "norte",
    nombre: "Clínica Norte",
    ciudad: "Guayaquil",
    direccion: "Malecón 2000 y Colón",
    horario: "Lun–Dom 24/7 Urgencias",
    telefono: "+593 4 300 0000",
    maps: "https://www.google.com/maps/search/?api=1&query=Malec%C3%B3n+2000+Guayaquil+Ecuador",
    whatsapp: "https://wa.me/593970000000?text=Hola%20deseo%20información"
  },
  {
    id: "valle",
    nombre: "Centro Médico Valle",
    ciudad: "Cuenca",
    direccion: "Av. Solano 3-45 y Remigio Crespo",
    horario: "Lun–Vie 08:00–18:00",
    telefono: "+593 7 200 0000",
    maps: "https://www.google.com/maps/search/?api=1&query=Av.+Solano+3-45+Cuenca+Ecuador",
    whatsapp: "https://wa.me/593980000000?text=Hola%20deseo%20información"
  }
]
</script>

<template>
  <!-- NAVBAR -->
    <header class="sticky top-0 z-30 backdrop-blur bg-white/70 border-b border-slate-200/60">
      <nav class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="flex h-16 items-center justify-between">
          <!-- Brand (link a Home) -->
          <RouterLink to="/" class="flex items-center gap-3">
            <span class="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-600 text-white shadow-sm">
              <svg viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16M4 12h16" />
              </svg>
            </span>
            <div class="leading-tight">
              <p class="font-semibold text-slate-900">Hospital Vida Sana</p>
              <p class="text-xs text-slate-500">Cuidamos lo que más importa</p>
            </div>
          </RouterLink>

          <!-- Enlaces internos de la página (anclas del Home) -->
          <ul class="hidden md:flex items-center gap-6 text-sm">
            <li><RouterLink to="/" class="hover:text-cyan-700 transition">Inicio</RouterLink></li>
            <li><a href="/#servicios" class="hover:text-cyan-700 transition">Servicios</a></li>
            <li><a href="/#sucursales" class="hover:text-cyan-700 transition">Sucursales</a></li>
            <li><a href="/#contacto" class="hover:text-cyan-700 transition">Contacto</a></li>
          </ul>

          <!-- Acceso empleados -->
          <button
            @click="goAcceso"
            class="ml-4 inline-flex items-center gap-2 rounded-xl border border-cyan-600 px-4 py-2 text-sm font-medium text-cyan-700 hover:bg-cyan-600 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2"
            aria-label="Acceso para empleados"
          >
            <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-9A2.25 2.25 0 0 0 2.25 5.25v9A2.25 2.25 0 0 0 4.5 16.5H9M21 21l-5.25-5.25M10.5 6h-6m6 3.75h-6m6 3.75h-6" />
            </svg>
            Acceso
          </button>
        </div>
      </nav>
    </header>
  <!-- HERO -->
  <section id="inicio" class="relative overflow-hidden">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <div class="grid items-center gap-10 md:grid-cols-2">
        <div>
          <h1 class="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
            Salud cercana, tecnología avanzada.
          </h1>
          <p class="mt-4 text-slate-600 text-base sm:text-lg">
            Atención integral en nuestras tres sedes. Agenda tu cita en minutos y recibe
            el cuidado que mereces con equipos de última generación.
          </p>
          <div class="mt-6 flex flex-wrap gap-3">
            <a href="#contacto"
               class="inline-flex items-center justify-center rounded-xl bg-cyan-600 px-5 py-3 text-white text-sm font-medium shadow-sm hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2">
              Agendar cita
            </a>
            <a href="#servicios"
               class="inline-flex items-center justify-center rounded-xl border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 hover:bg-white/60 backdrop-blur focus:outline-none focus:ring-2 focus:ring-cyan-200">
              Ver servicios
            </a>
          </div>
        </div>

        <!-- Card destacada -->
        <div class="relative">
          <div class="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur p-6 shadow-sm">
            <div class="flex items-center gap-3">
              <span class="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white">
                <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path stroke-linecap="round" stroke-linejoin="round"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </span>
              <div>
                <p class="font-semibold text-slate-900">Urgencias 24/7</p>
                <p class="text-sm text-slate-600">Atención inmediata en Guayaquil</p>
              </div>
            </div>
            <div class="mt-6 grid gap-4 sm:grid-cols-2">
              <div class="rounded-xl border border-slate-200 p-4">
                <p class="text-sm text-slate-500">Tiempo promedio de espera</p>
                <p class="mt-1 text-2xl font-semibold text-slate-900">12–18 min</p>
              </div>
              <div class="rounded-xl border border-slate-200 p-4">
                <p class="text-sm text-slate-500">% satisfacción</p>
                <p class="mt-1 text-2xl font-semibold text-slate-900">97%</p>
              </div>
            </div>
            <p class="mt-4 text-xs text-slate-500">* Datos de referencia interna.</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- SUCURSALES -->
  <section id="sucursales" class="py-16 sm:py-20">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="flex items-end justify-between gap-6">
        <div>
          <h2 class="text-2xl sm:text-3xl font-bold text-slate-900">Nuestras sucursales</h2>
          <p class="mt-2 text-slate-600">Encuentra la sede más cercana y contáctanos.</p>
        </div>
      </div>

      <div class="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="b in branches"
          :key="b.id"
          class="group rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
          <div class="p-6">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-slate-900">{{ b.nombre }}</h3>
              <span class="rounded-full bg-cyan-100 px-3 py-1 text-xs font-medium text-cyan-700">
                {{ b.ciudad }}
              </span>
            </div>

            <dl class="mt-5 space-y-3 text-sm">
              <div class="flex items-start gap-3">
                <svg class="h-5 w-5 mt-0.5 text-cyan-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path stroke-linecap="round" stroke-linejoin="round"
                        d="M12 21s-6-4.35-6-9a6 6 0 1112 0c0 4.65-6 9-6 9z"/>
                </svg>
                <div>
                  <dt class="font-medium text-slate-700">Dirección</dt>
                  <dd class="text-slate-600">{{ b.direccion }}</dd>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <svg class="h-5 w-5 mt-0.5 text-cyan-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path stroke-linecap="round" stroke-linejoin="round"
                        d="M12 8v4l3 3M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <div>
                  <dt class="font-medium text-slate-700">Horario</dt>
                  <dd class="text-slate-600">{{ b.horario }}</dd>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <svg class="h-5 w-5 mt-0.5 text-cyan-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path stroke-linecap="round" stroke-linejoin="round"
                        d="M2 5l9 5 9-5M2 19l9-5 9 5M2 12l9 5 9-5"/>
                </svg>
                <div>
                  <dt class="font-medium text-slate-700">Teléfono</dt>
                  <dd class="text-slate-600">{{ b.telefono }}</dd>
                </div>
              </div>
            </dl>

            <div class="mt-6 flex flex-wrap gap-3">
              <a :href="b.maps" target="_blank" rel="noopener"
                 class="inline-flex items-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-white/60">
                Ver mapa
              </a>
              <a :href="b.whatsapp" target="_blank" rel="noopener"
                 class="inline-flex items-center rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
                Contactar
              </a>
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>

  <!-- SERVICIOS -->
  <section id="servicios" class="py-12">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 class="text-xl font-semibold text-slate-900">Servicios destacados</h3>
        <ul class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-sm text-slate-700">
          <li class="rounded-xl border border-slate-200 p-4">Medicina general</li>
          <li class="rounded-xl border border-slate-200 p-4">Pediatría</li>
          <li class="rounded-xl border border-slate-200 p-4">Ginecología</li>
          <li class="rounded-xl border border-slate-200 p-4">Laboratorio clínico</li>
          <li class="rounded-xl border border-slate-200 p-4">Imagenología</li>
          <li class="rounded-xl border border-slate-200 p-4">Emergencias 24/7</li>
        </ul>
      </div>
    </div>
  </section>

  <!-- CONTACTO -->
  <section id="contacto" class="py-12">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="rounded-2xl bg-cyan-600 text-white p-8">
        <h3 class="text-xl font-semibold">¿Necesitas ayuda?</h3>
        <p class="mt-2 text-cyan-50">Escríbenos y con gusto te atendemos.</p>
        <a href="mailto:contacto@vidasana.ec"
           class="mt-4 inline-flex rounded-xl bg-white px-5 py-3 text-sm font-medium text-cyan-800 hover:bg-slate-50">
          contacto@vidasana.ec
        </a>
      </div>
    </div>
  </section>
</template>
