import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Layouts
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import ProjectLayout from '@/layouts/ProjectLayout.vue'

// Views
import HomeView from '@/views/HomeView.vue'
import ProjectsView from '@/views/ProjectsView.vue'
import UploadDataView from '@/views/UploadDataView.vue'
import AnnotateView from '@/views/AnnotateView.vue'
import DatasetView from '@/views/DatasetView.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    component: DefaultLayout,
    children: [
      {
        path: '',
        name: 'home',
        component: HomeView,
        meta: { requiresAuth: true },
      },
      {
        path: '/projects',
        name: 'projects',
        component: ProjectsView,
        meta: { requiresAuth: true },
      },
    ],
  },
  {
    path: '/projects/:projectId',
    component: ProjectLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: (to) => {
          return { name: 'project-upload', params: { projectId: to.params.projectId } }
        },
      },
      {
        path: 'upload',
        name: 'project-upload',
        component: UploadDataView,
        meta: { requiresAuth: true },
      },
      {
        path: 'annotate',
        name: 'project-annotate',
        component: AnnotateView,
        meta: { requiresAuth: true },
      },
      {
        path: 'dataset',
        name: 'project-dataset',
        component: DatasetView,
        meta: { requiresAuth: true },
      },
    ],
  },
  {
    path: '/login',
    name: 'login',
    component: AuthLayout,
    meta: { requiresGuest: true },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// Navigation Guards
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  const requiresGuest = to.matched.some((record) => record.meta.requiresGuest)

  if (requiresAuth && !authStore.isAuthenticated) {
    next({
      name: 'login',
      query: { redirect: to.fullPath },
    })
  } else if (requiresGuest && authStore.isAuthenticated) {
    next({ name: 'home' })
  } else {
    next()
  }
})

export default router
