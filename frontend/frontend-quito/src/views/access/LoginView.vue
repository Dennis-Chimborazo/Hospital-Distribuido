<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router'; // 👈 Importa el router para la navegación
import ApiService from '@/services/ApiService'; // 👈 Asegúrate que la ruta a tu API service sea correcta

// --- 1. ESTADO DE LA APLICACIÓN ---
const router = useRouter();
const user = ref(''); // Estado para el campo de usuario
const password = ref(''); // Estado para el campo de contraseña
const loading = ref(false); // Estado para deshabilitar el botón durante la carga
const error = ref(null); // Estado para mostrar mensajes de error

// --- 2. MANEJO DEL ENVÍO ---
async function handleLogin() {
    error.value = null; // Limpiar errores anteriores

    if (!user.value || !password.value) {
        error.value = 'Por favor, complete el usuario y la contraseña.';
        return;
    }

    loading.value = true; // Activar el estado de carga

    try {
        // Llama al servicio de API con las credenciales
        const response = await ApiService.login({
            user: user.value,
            password: password.value,
        });

      router.push({ name: 'AdminView' })


    } catch (err) {
        // El error viene del ApiService
        error.value = err.message || 'Error desconocido al intentar iniciar sesión.';
        console.error("Error de Login:", err);
    } finally {
        loading.value = false; // Desactivar el estado de carga
    }
}
</script>

<template>
  <section class="mx-auto max-w-md px-4 py-16">
      <RouterLink 
      to="/access-user" 
      class="mb-6 inline-flex items-center gap-2 rounded-xl border border-cyan-600 px-4 py-2 text-sm font-medium text-cyan-700 hover:bg-cyan-600 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2"
    >
      Volver
    </RouterLink>
    <h2 class="text-2xl font-semibold text-slate-900 mb-6">Acceso de empleados</h2>
    
    <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-4" role="alert">
      <p>{{ error }}</p>
    </div>

    <form @submit.prevent="handleLogin" class="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <label class="block text-sm font-medium text-slate-700">Usuario</label>
        <input 
          type="text" 
          v-model="user"
          :disabled="loading"
          class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400" 
          required
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-slate-700">Contraseña</label>
        <input 
          type="password" 
          v-model="password"
          :disabled="loading"
          class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400" 
          required
        />
      </div>
      <button 
        type="submit" 
        :disabled="loading"
        class="w-full rounded-lg bg-cyan-600 px-4 py-2 text-white font-medium hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ loading ? 'Ingresando...' : 'Ingresar' }}
      </button>
    </form>
  </section>
</template>

<style scoped>
/* Estilos adicionales si fueran necesarios */
</style>