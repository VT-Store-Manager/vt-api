import './style.css'
import 'primevue/resources/themes/lara-light-indigo/theme.css'
import 'primevue/resources/primevue.min.css'
import 'primeicons/primeicons.css'
import 'primeflex/primeflex.css'

import PrimeVue from 'primevue/config'
import { createApp } from 'vue'

import { createPinia } from 'pinia'

import App from './App.vue'
import { router } from './router/index'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia).use(router).use(PrimeVue).mount('#app')
