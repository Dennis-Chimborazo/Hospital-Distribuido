<script setup>
import '@/assets/styles/landing.css'
import { useRouter, RouterLink } from 'vue-router'
const router = useRouter()

function goAcceso() {
  router.push({ name: 'AccessUser' })
}

const heroImg = new URL('@/assets/images/heroImg.jpg', import.meta.url).href

const branches = [
  {
    id: "matriz", nombre: "Hospital Vida Sana - Matriz", ciudad: "Quito",
    direccion: "Av. Amazonas N34-140 y República", horario: "Lun–Sáb 07:00–20:00",
    telefono: "+593 2 600 0000",
    maps: "https://www.google.com/maps/search/?api=1&query=Av.+Amazonas+N34-140+Quito+Ecuador",
    whatsapp: "https://wa.me/593960000000?text=Hola%20deseo%20información"
  },
  {
    id: "norte", nombre: "Clínica Norte", ciudad: "Guayaquil",
    direccion: "Malecón 2000 y Colón", horario: "Lun–Dom 24/7 Urgencias",
    telefono: "+593 4 300 0000",
    maps: "https://www.google.com/maps/search/?api=1&query=Malec%C3%B3n+2000+Guayaquil+Ecuador",
    whatsapp: "https://wa.me/593970000000?text=Hola%20deseo%20información"
  },
  {
    id: "valle", nombre: "Centro Médico Valle", ciudad: "Cuenca",
    direccion: "Av. Solano 3-45 y Remigio Crespo", horario: "Lun–Vie 08:00–18:00",
    telefono: "+593 7 200 0000",
    maps: "https://www.google.com/maps/search/?api=1&query=Av.+Solano+3-45+Cuenca+Ecuador",
    whatsapp: "https://wa.me/593980000000?text=Hola%20deseo%20información"
  }
]
</script>

<template>
  <div class="container">
  <!-- NAVBAR oscuro -->
  <header class="navbar-dark">
    <nav class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="flex h-16 items-center justify-between">
        <RouterLink to="/" class="flex items-center gap-2">
          <span class="brand-dot">
            <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16M4 12h16" />
            </svg>
          </span>
          <span class="font-semibold">Hospital Vida Sana</span>
        </RouterLink>

        <ul class="nav-list">
          <li>
            <RouterLink to="/" class="nav-link">Inicio</RouterLink>
          </li>
          <li><a href="#sucursales" class="nav-link">Sucursales</a></li>
          <li><a href="#servicios" class="nav-link">Servicios</a></li>
          <li><a href="#contacto" class="nav-link">Contacto</a></li>
        </ul>

        <div class="hidden md:flex items-center gap-4">

          <button @click="goAcceso" class="p-2 rounded-md hover:bg-slate-700/60" aria-label="Acceso">
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 12h13M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  </header>

  <!-- HERO -->
  <section id="inicio" class="hero">
    <div class="container">
      <div class="grid items-center gap-10 md:grid-cols-2">
        <div class="relative">
          <h1 class="title">Hospital <br />Vida Sana</h1>
          <p class="lead">
            Lorem ipsum dolor sit amet consectetur adipisicing elit sed diam nonummy nibh euismod
            tincidunt ut laoreet dolore magna aliquam erat volutpat.
          </p>
          <div class="mt-6 flex flex-wrap gap-3">
            <a href="#contacto" class="btn-primary">Conoce más</a>
            <a href="#servicios" class="btn-secondary">Ver servicios</a>
          </div>

          <!-- decoraciones -->
          <span class="deco-plus" style="left:-18px; top:96px;"></span>
          <span class="deco-dots" style="left:0; bottom:-28px;"></span>
        </div>

        <!-- imagen con borde y badge -->
        <div class="hero-media">
          <div class="frame">
            <img :src="heroImg" alt="Paciente y médica" />
          </div>
          <span class="deco-dots" style="right:8px; top:16px;"></span>
        </div>
      </div>
    </div>

    <!-- franja azul con redes + “hospital” -->
    <div class="blue-band">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      </div>
    </div>
  </section>

  <!-- SUCURSALES -->
  <section id="sucursales" class="section">
    <div class="container-xl">
      <div class="section-head">
        <h2 class="section-title">Nuestras sucursales</h2>
        <p class="section-sub">Encuentra la sede más cercana y contáctanos.</p>
      </div>

      <!-- grid de tarjetas -->
      <div class="branches-grid">
        <article v-for="b in branches" :key="b.id" class="branch-card">
          <div class="flex items-center justify-between">
            <h3>{{ b.nombre }}</h3>
            <span class="chip chip--cyan">{{ b.ciudad }}</span>
          </div>

          <dl class="mt-5 text-sm">
            <div class="branch-row">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M12 21s-6-4.35-6-9a6 6 0 1112 0c0 4.65-6 9-6 9z" />
              </svg>
              <div>
                <dt class="font-medium text-slate-700">Dirección</dt>
                <dd class="text-slate-600">{{ b.direccion }}</dd>
              </div>
            </div>

            <div class="branch-row">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M12 8v4l3 3M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <dt class="font-medium text-slate-700">Horario</dt>
                <dd class="text-slate-600">{{ b.horario }}</dd>
              </div>
            </div>

            <div class="branch-row">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2 5l9 5 9-5M2 19l9-5 9 5M2 12l9 5 9-5" />
              </svg>
              <div>
                <dt class="font-medium text-slate-700">Teléfono</dt>
                <dd class="text-slate-600">{{ b.telefono }}</dd>
              </div>
            </div>
          </dl>

          <div class="branch-actions actions--icon">
            <a :href="b.maps" target="_blank" rel="noopener" class="btn btn-ghost">
              <span class="i i-map" aria-hidden="true"></span> Ver mapa
            </a>
            <a :href="b.whatsapp" target="_blank" rel="noopener" class="btn-primary">
              <span class="i i-whatsapp" aria-hidden="true"></span> Contactar
            </a>
          </div>

        </article>
      </div>
    </div>
    
    
  </section>

  <!-- SERVICIOS -->
  <section id="servicios" class="section">
    <div class="container-xl">
      <div class="section-head">
        <h2 class="section-title">Servicios destacados</h2>
        <p class="section-sub">Encuentra los servicios que se ofrecen</p>
      </div>
     <div class="branch-card">
        <ul class="services-grid mt-4 text-sm">
          <li class="btn-primary">Medicina general</li>
          <li class="btn-primary">Pediatría</li>
          <li class="btn-primary">Ginecología</li>
          <li class="btn-primary">Laboratorio clínico</li>
          <li class="btn-primary">Imagenología</li>
          <li class="btn-primary">Emergencias 24/7</li>
        </ul>

      </div>
    </div>
  </section>

  <!-- CONTACTO -->
  <section id="contacto" class="section">
    <div class="container-xl">
      <div class="section-head">
        <h2 class="section-title">Contáctanos</h2>
      </div>
      <div class="branch-card">
        <h3 class="text-xl font-semibold">¿Necesitas ayuda?</h3>
        <p class="mt-2" style="color: #000">Escríbenos y con gusto te atendemos.</p>
        <a href="mailto:contacto@vidasana.ec" class="btn-light mt-4">contacto@vidasana.ec</a>
      </div>
    </div>
  </section>
</div>
</template>
