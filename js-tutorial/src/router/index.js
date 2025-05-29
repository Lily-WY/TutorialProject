import { createRouter, createWebHistory } from 'vue-router'
import Playground from '@/components/Playground.vue'

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
  },
  {
    path: '/upload',
    component: () => import('@/views/UploadPage.vue')
  },
  {
    path: '/playground',
    name: 'Playground',
    component: Playground
  }

]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
