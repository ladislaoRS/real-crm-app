const routes = [
  // Main application routes with MainLayout
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import('pages/DashboardPage.vue'),
      },
      {
        path: 'contacts',
        name: 'contacts',
        component: () => import('pages/ContactsPage.vue'),
      },
      {
        path: 'contacts/create',
        name: 'contact-create',
        component: () => import('pages/ContactCreatePage.vue'),
      },
      {
        path: 'contacts/:id/edit',
        name: 'contact-edit',
        component: () => import('pages/ContactEditPage.vue'),
        props: true,
      },
    ],
  },

  // Authentication routes with AuthLayout
  {
    path: '/',
    component: () => import('layouts/AuthLayout.vue'),
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import('pages/LoginPage.vue'),
        meta: { guest: true },
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
