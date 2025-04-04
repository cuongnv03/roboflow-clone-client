import { createRouter, createWebHistory } from 'vue-router'
// Import the combined Login/Register view
import LoginView from '../views/LoginView.vue' // This view now handles both
// Default HomeView might exist from scaffolding, keep or modify as needed
import HomeView from '../views/HomeView.vue'
import { useAuthStore } from '../stores/auth' // Import store for navigation guards

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView, // Default route, maybe dashboard later
      meta: { requiresAuth: true }, // Example: Protect home route
    },
    {
      path: '/login', // Route for both login and register
      name: 'login',
      component: LoginView,
      meta: { requiresGuest: true }, // Prevent logged-in users from accessing login/register page
    },
    // Removed separate /register route
    // Add routes for projects, etc. later
    {
      path: '/projects',
      name: 'projects',
      // Example of lazy loading a protected route
      component: () => import('../views/ProjectsView.vue'), // Create this view later
      meta: { requiresAuth: true },
    },
  ],
})

// --- Navigation Guards (Now uncommented and active) ---
router.beforeEach((to, from, next) => {
  // Ensure store is initialized before guard runs
  const authStore = useAuthStore()
  // Initialize from localStorage if needed (might be redundant if App.vue does it)
  // authStore.checkAuth(); // Be careful not to cause infinite loops

  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  const requiresGuest = to.matched.some((record) => record.meta.requiresGuest)

  console.log(
    `Navigating to: ${String(to.name)}, Requires Auth: ${requiresAuth}, Requires Guest: ${requiresGuest}, Is Authenticated: ${authStore.isAuthenticated}`,
  )

  if (requiresAuth && !authStore.isAuthenticated) {
    // Redirect to login if trying to access protected route without auth
    console.log('Redirecting to login (requires auth)')
    next({ name: 'login', query: { redirect: to.fullPath } })
  } else if (requiresGuest && authStore.isAuthenticated) {
    // Redirect to home/dashboard if trying to access login/register while logged in
    console.log('Redirecting to home (requires guest)')
    next({ name: 'home' })
  } else {
    // Otherwise, allow navigation
    console.log('Allowing navigation')
    next()
  }
})

export default router
