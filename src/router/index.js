import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('../router/Home.vue'), // 假设有一个 Home 组件
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
