import { createApp } from 'vue';
import App from './App.vue';
import { install as VueMonacoEditorPlugin } from '@guolao/vue-monaco-editor'; // 正确导入插件
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import 'element-plus/theme-chalk/dark/css-vars.css';
import '@/styles/index.css';
import router from './router';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';

const app = createApp(App);

// Register Element Plus icons
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

// Register Monaco Editor with configuration
app.use(VueMonacoEditorPlugin, {
  paths: {
    vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs' // 更新到最新版本
  }
});

app.use(router);
app.use(ElementPlus);
app.mount('#app');