import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/tutorial/Introduction'
  },
  {
    path: '/tutorial/:section',
    name: 'TutorialSection',
    component: () => import('@/layouts/TutorialLayout.vue'),
    props: true  // 👈 自动将 route.params.section 作为 prop 传入组件
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
