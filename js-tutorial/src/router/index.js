import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/tutorial/entry/what-is-js' 
  },
  {
    path: '/tutorial/:section/:subsection?',
    name: 'TutorialSection',
    component: () => import('@/layouts/TutorialLayout.vue'),
    props: route => ({
      section: route.params.section,
      subsection: route.params.subsection || null
    })
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
