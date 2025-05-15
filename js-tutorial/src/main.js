// main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import ElementPlus from 'element-plus'
import '@/styles/index.css' 
import 'element-plus/theme-chalk/index.css'         
import 'element-plus/dist/index.css'


const app = createApp(App)
app.use(router)
app.use(ElementPlus) 
app.mount('#app')
