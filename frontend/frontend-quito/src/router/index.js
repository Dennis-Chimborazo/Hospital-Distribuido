import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '@/views/HomeView.vue'
import UserAccess from '@/views/access/UserAccess.vue'
import LoginView from '@/views/access/LoginView.vue'

// Layout padre
import AdminView from '@/views/administrador/AdminView.vue'

// Hijas dentro del layout AdminView (renderizan en <RouterView/> de la derecha)

import MedicoListaView from '@/views/medico/MedicoListaView.vue'
import EspecialidadListarView from '@/views/especialidad/EspecialidadListarView.vue'
import SecretariaListarView from '@/views/secretaria/SecretariaListarView.vue'

// Otras vistas
import CuencaView from '@/views/sucursales/CuencaVIew.vue' // (verifica el nombre de archivo)

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Públicas / fuera del layout
    { path: '/', name: 'home', component: HomeView },
    { path: '/access-user', name: 'AccessUser', component: UserAccess },
    { path: '/login', name: 'Login', component: LoginView },
    { path: '/cuenca-view', name: 'CuencaView', component: CuencaView },

    // Layout de administración (navbar izq + section derecha)
    {
      path: '/admin',
      name: 'AdminView',
      component: AdminView,
      children: [
        // Ruta por defecto del panel
        { path: '', redirect: { name: 'medico' } },

        {
          path: 'medico',
          name: 'medico',
          component: MedicoListaView,
          meta: { title: 'Medico', subtitle: 'Listado de Medicos' }
        },
        {
          path: 'especialidades',
          name: 'especialidad',
          component: EspecialidadListarView,
          meta: { title: 'Especialidades', subtitle: 'Listado de especialidades' }
        },
        {
          path: 'secretaria',
          name: 'secretaria',
          component: SecretariaListarView,
        },
      ]
    },

    // 🔁 Redirecciones para compatibilidad (opcional, pero recomendado)
    { path: '/admin-view', redirect: '/admin' },
    // { path: '/doctor-lista-view', redirect: { name: 'DoctorListaView' } },

    // (Opcional) 404
    // { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFoundView }
  ],
  scrollBehavior() {
    return { top: 0 }
  }
})

export default router
