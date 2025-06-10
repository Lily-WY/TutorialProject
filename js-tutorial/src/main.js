// main.js
import { createApp } from 'vue'
import App from './App.vue'
import MonacoEditor from '@guolao/vue-monaco-editor'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import router from './router'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const app = createApp(App)

// Register Element Plus icons
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// Register Monaco Editor with configuration
app.use(MonacoEditor, {
  paths: {
    vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.44.0/min/vs'
  }
})

app.use(router)
app.use(ElementPlus)

app.mount('#app')
