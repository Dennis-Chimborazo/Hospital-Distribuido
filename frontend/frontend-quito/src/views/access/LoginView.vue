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
const logoImg = new URL('@/assets/images/hospital.png', import.meta.url).href

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
  <div class="container">
    <section class="mx-auto max-w-md px-4 py-16">
      <RouterLink to="/access-user" class="btn-primary absolute top-4 left-4">
        Volver
      </RouterLink>

      <h2 class="text-2xl font-semibold text-slate-900 mb-6 flex justify-center">Inicio de sesión</h2>

      <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-4" role="alert">
        <p>{{ error }}</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

        <!-- ENCABEZADO VISUAL -->
        <div class="flex flex-col items-center -mt-2 mb-2 text-center">
          <div class="relative">
            <div class="h-28 w-full rounded-lg overflow-hidden -mt-2 mb-3">
              <img :src="logoImg" alt="Logo" class="w-full h-full object-cover" />
            </div>
            <!-- badge de candado -->
            <span
              class="absolute -bottom-1 -right-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-rose-500 text-white shadow">
              <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M12 11c-1.657 0-3 1.343-3 3v3h6v-3c0-1.657-1.343-3-3-3zM8 11V8a4 4 0 118 0v3" />
              </svg>
            </span>
          </div>
          <h3 class="mt-3 text-lg font-semibold text-slate-900">Bienvenido</h3>
          <p class="text-sm text-slate-500 -mt-1">Ingresa tus credenciales para continuar</p>
        </div>
        <!-- /ENCABEZADO VISUAL -->

        <!-- Usuario -->
        <div>
          <label class="block text-sm font-medium text-slate-700">Usuario</label>
          <input type="text" v-model="user" :disabled="loading"
            class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            required />
        </div>

        <!-- Contraseña -->
        <div>
          <label class="block text-sm font-medium text-slate-700">Contraseña</label>
          <input type="password" v-model="password" :disabled="loading"
            class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            required />
        </div>

        <!-- Botón centrado -->
        <div class="flex justify-center">
          <button type="submit" :disabled="loading" class="btn-primary">
            {{ loading ? 'Ingresando...' : 'Ingresar' }}
          </button>
        </div>
      </form>

    </section>
  </div>
</template>
