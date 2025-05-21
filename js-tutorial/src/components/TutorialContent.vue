<script setup>
import { ref, watch, onMounted } from 'vue'
import axios from 'axios'
import { marked } from 'marked' // 引入 marked 库

const props = defineProps({
  path: {
    type: String,
    required: true
  }
})

const content = ref('加载中...')

// 配置 marked（可选）
marked.setOptions({
  breaks: true, // 转换换行符为 <br>
  gfm: true,    // 启用 GitHub Flavored Markdown
})

async function fetchContent() {
  try {
    const res = await axios.get(`http://localhost:3000/api/tutorial/${props.path}`)
    // 将 Markdown 转换为 HTML
    content.value = marked.parse(res.data.content)
  } catch {
    content.value = '<p>加载内容失败</p>'
  }
}

onMounted(fetchContent)
watch(() => props.path, fetchContent)
</script>

<template>
  <div class="markdown-content" v-html="content"></div>
</template>

<style scoped>
.markdown-content {
  line-height: 1.6;
  margin-left: 20px;
  padding-left: 1.2em;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.markdown-content >>> h1 {
  font-size: 2em;
  margin-bottom: 16px;
  margin-top: 0;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.3em;
}

.markdown-content >>> h2 {
  font-size: 1.5em;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.3em;
  margin-top: 1em;
  margin-bottom: 16px;
}

.markdown-content p {
  font-size: 2em; /* 16px */
  margin-bottom: 1.2em;
}

.markdown-content >>> code {
  background-color: #f6f8fa;
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: monospace;
  font-size: 1.2em;
}

.markdown-content >>> pre {
  background-color: #f6f8fa;
  padding: 16px;
  border-radius: 3px;
  overflow: auto;
}

.markdown-content >>> blockquote {
  border-left: 4px solid #dfe2e5;
  color: #6a737d;
  padding: 0 1em;
  margin-left: 0;
}

.markdown-content a {
  color: #0366d6;
  text-decoration: none;
}

.markdown-content a:hover {
  text-decoration: underline;
}

.markdown-content img {
  max-width: 100%;
  height: auto;
  margin: 1em 0;
}

.markdown-content table {
  border-collapse: collapse;
  width: 100%;
  margin-bottom: 1.2em;
}

.markdown-content th, 
.markdown-content td {
  border: 1px solid #ddd;
  padding: 8px 12px;
}

.markdown-content th {
  background-color: #f5f5f5;
}

.markdown-content ul, 
.markdown-content ol {
  margin-bottom: 1.2em;
  padding-left: 2em;
}

.markdown-content li {
  margin-bottom: 0.5em;
}
</style>