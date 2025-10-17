import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/tailwind.css'
import '@/assets/styles/landing.css'
import 'vue-toastification/dist/index.css'
import 'vue-good-table-next/dist/vue-good-table-next.css'
import VueGoodTablePlugin from 'vue-good-table-next'
import Toast, { POSITION } from 'vue-toastification'
createApp(App)
  .use(router)
  .use(VueGoodTablePlugin)
  .use(Toast, {
    position: POSITION.TOP_RIGHT,
    timeout: 3000,
    maxToasts: 2,
  })
  .mount('#app')
