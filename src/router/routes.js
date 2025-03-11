const routes = [
  {
    path: '/',
    component: () => import('pages/HomePage.vue')
  },
  {
    path: '/find-route',
    component: () => import('pages/FindRoutePage.vue')
  },
  {
    path: '/tickets',
    component: () => import('pages/TicketsPage.vue')
  },
  {
    path: '/fare-calculator',
    component: () => import('pages/FareCalculatorPage.vue')
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
