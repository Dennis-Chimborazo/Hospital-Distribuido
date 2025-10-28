<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="relative min-h-screen flex flex-col bg-[#0b1220] text-slate-200">
    <!-- Contenido principal -->
    <main class="flex-1 pb-20 overflow-y-auto">
      <RouterView />
    </main>

    <!-- Footer fijo al fondo -->
    <footer class="fixed bottom-0 left-0 right-0 z-50 bg-[#0b1220]/95 border-t border-slate-800 backdrop-blur-sm">
      <div
        class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 text-sm text-slate-300 flex flex-col sm:flex-row justify-between items-center gap-4">
        <span>© {{ new Date().getFullYear() }} Hospital Vida Sana. Todos los derechos reservados.</span>
        <nav class="flex items-center gap-4">
          <a href="#" class="hover:text-cyan-400 transition-colors">Términos</a>
          <a href="#" class="hover:text-cyan-400 transition-colors">Privacidad</a>
          <a href="#" class="hover:text-cyan-400 transition-colors">Soporte</a>
        </nav>
      </div>
    </footer>
  </div>
</template>
