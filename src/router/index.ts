import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router' // Import RouteRecordRaw

import DefaultLayout from '../layouts/DefaultLayout.vue'
import AuthLayout from '../layouts/AuthLayout.vue'
import ProjectLayout from '../layouts/ProjectLayout.vue'

import HomeView from '../views/HomeView.vue'
import ProjectsView from '../views/ProjectsView.vue'
import UploadDataView from '../views/UploadDataView.vue'
import AnnotateView from '../views/AnnotateView.vue'
import DatasetView from '../views/DatasetView.vue'


import { useAuthStore } from '../stores/auth'

// Define routes using RouteRecordRaw for better typing
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/upload',
  },
  {
    path: '/upload',
    name: 'upload',
    component: UploadDataView,
  },
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
      {
        path: '/projects/:projectId',
        name: 'project-base',
        component: ProjectLayout,
        meta: { requiresAuth: true },
        props: true,
        children: [
          {
            path: '',
            redirect: 'upload',
          },
          {
            path: 'upload',
            name: 'project-upload',
            component: UploadDataView,
          },
          {
            path: 'annotate',
            name: 'project-annotate',
            component: AnnotateView,
          },
          {
            path: 'dataset',
            name: 'project-dataset',
            component: DatasetView,
          },
        ],
      },
    ],
  },
  {
    path: '/login',
    name: 'login',
    component: AuthLayout,
    meta: { requiresGuest: true },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  const requiresGuest = to.matched.some((record) => record.meta.requiresGuest)
  console.log(
    `Navigating to: ${to.name?.toString()}, Requires Auth: ${requiresAuth}, Requires Guest: ${requiresGuest}, Is Authenticated: ${authStore.isAuthenticated}`,
  )
  if (requiresAuth && !authStore.isAuthenticated) {
    console.log('Redirecting to login (requires auth)')
    next({ name: 'login', query: { redirect: to.fullPath } })
  } else if (requiresGuest && authStore.isAuthenticated) {
    console.log('Redirecting to home (requires guest)')
    next({ name: 'home' })
  } else {
    console.log('Allowing navigation')
    next()
  }
})

export default router
