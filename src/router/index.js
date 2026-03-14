import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/ai-slide', // 重定向到 /ai-slide
    },
    {
      path: '/ai-slide',
      name: 'AISlide',
      component: () => import('../router/AISlide.vue'),
    },
    {
      path: '/ai-doc',
      name: 'AIDoc',
      component: () => import('../router/AIDoc.vue'),
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('../router/Login.vue'),
    },
  ],
})

export default router
