const routes = [
  {
    path: '/',
    component: () => import('pages/HomePage.vue'),
  },
  {
    path: '/find-route',
    component: () => import('pages/FindRoutePage.vue'),
  },
  {
    path: '/route-details',
    component: () => import('pages/RouteDetailsPage.vue'),
  },
  {
    path: '/list-stations',
    component: () => import('pages/ListStationPage.vue'),
  },
  {
    path: '/metro-map',
    component: () => import('pages/MetroMapPage.vue'),
  },
  {
    path: '/tickets',
    component: () => import('pages/HomePage.vue'),
    beforeEnter: (to, from, next) => {
      window.location.href = 'https://api.whatsapp.com/send/?phone=918105556677&text=Hi'
      next(false) // Prevent the actual navigation
    },
  },
  {
    path: '/nearest-stations',
    component: () => import('pages/NearestStationsPage.vue'),
  },
  {
    path: '/favorites',
    component: () => import('pages/Favorites.vue'),
  },
  {
    path: '/about',
    component: () => import('pages/About.vue'),
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
