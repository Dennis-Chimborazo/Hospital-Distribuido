<script setup>
import {RouterView } from 'vue-router'
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-b from-sky-50 via-white to-cyan-50 text-slate-800">
    <main class="flex-1">
      <RouterView />
    </main>
    <footer class="border-t border-slate-200/70">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 text-sm text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-4">
        <span>© {{ new Date().getFullYear() }} Hospital Vida Sana. Todos los derechos reservados.</span>
        
        <nav class="flex items-center gap-4">
          <a href="#" class="hover:underline">Términos</a>
          <a href="#" class="hover:underline">Privacidad</a>
          <a href="#" class="hover:underline">Soporte</a>
        </nav>
      </div>
    </footer>
  </div>
</template>
