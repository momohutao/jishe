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
    {
      path: '/react',
      name: 'React',
      component: () => import('../router/React.vue'),
    },
  ],
  // 添加滚动行为：每次切换路由后滚动到页面顶部
  scrollBehavior(to, from, savedPosition) {
    // 如果存在 savedPosition（例如浏览器前进/后退），则恢复到该位置
    if (savedPosition) {
      return savedPosition
    } else {
      // 否则滚动到顶部
      return { top: 0 }
    }
  },
})

export default router
