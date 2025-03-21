import { createRouter, createWebHistory } from 'vue-router'
import AuthView from '../views/AuthView.vue'
import HomeView from '../views/HomeView.vue'

const routes = [
  { path: '/', name: 'Home', component: HomeView },
  { path: '/login', name: 'Login', component: AuthView },
  { path: '/signup', name: 'Signup', component: AuthView },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
