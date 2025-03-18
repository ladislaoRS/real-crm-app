import { route } from 'quasar/wrappers'
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from 'vue-router'
import routes from './routes'
import { useAuthStore } from 'src/stores/auth.store'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default route(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  })

  // Navigation guard
  Router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore()
    const isAuthenticated = authStore.isAuthenticated

    // Check if the route requires authentication
    if (to.matched.some((record) => record.meta.requiresAuth)) {
      // If not authenticated, redirect to login
      if (!isAuthenticated) {
        next({ name: 'login' })
      } else {
        // Otherwise proceed
        next()
      }
    }
    // If the route is for guests only (like login) and user is authenticated
    else if (to.matched.some((record) => record.meta.guest) && isAuthenticated) {
      // Redirect to dashboard
      next({ name: 'dashboard' })
    }
    // For all other routes, proceed normally
    else {
      next()
    }
  })

  return Router
})
