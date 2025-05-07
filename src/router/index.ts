import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Layouts
import ProjectLayout from '@/layouts/ProjectLayout.vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'

// Pages
import LoginPage from '@/pages/LoginPage.vue'
import ProjectsPage from '@/pages/ProjectsPage.vue'
import UploadDataPage from '@/pages/UploadDataPage.vue'
import AnnotatePage from '@/pages/AnnotatePage.vue'
import DatasetsPage from '@/pages/DatasetsPage.vue'
import NotFoundPage from '@/pages/NotFoundPage.vue'
import HomePage from '@/pages/HomePage.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: HomePage,
    meta: { requiresAuth: false },
  },
  {
    path: '/login',
    name: 'login',
    component: LoginPage,
    meta: { requiresGuest: true },
  },
  {
    path: '/projects',
    name: 'projects',
    component: ProjectsPage,
    meta: { requiresAuth: true },
  },
  {
    path: '/projects/:projectId',
    component: ProjectLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: 'upload',
        name: 'project-upload',
        component: UploadDataPage,
        meta: { requiresAuth: true },
      },
      {
        path: 'annotate',
        name: 'project-annotate',
        component: AnnotatePage,
        meta: { requiresAuth: true },
      },
      {
        path: 'datasets',
        name: 'project-dataset',
        component: DatasetsPage,
        meta: { requiresAuth: true },
      },
      {
        path: '',
        redirect: (to) => {
          return { name: 'project-upload', params: { projectId: to.params.projectId } }
        },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFoundPage,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Navigation guards
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  const requiresGuest = to.matched.some((record) => record.meta.requiresGuest)

  // Check if the route requires authentication
  if (requiresAuth && !authStore.isAuthenticated) {
    next({
      path: '/login',
      query: { redirect: to.fullPath },
    })
  }
  // Check if the route requires a guest (non-authenticated user)
  else if (requiresGuest && authStore.isAuthenticated) {
    next({ path: '/projects' })
  }
  // Proceed with navigation
  else {
    next()
  }
})

export default router
