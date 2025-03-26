import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router' // Ensure this matches your folder structure
import './assets/main.css'

const app = createApp(App)
app.use(createPinia())
app.use(router) // Router must be registered here
app.mount('#app')
