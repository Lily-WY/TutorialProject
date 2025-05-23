<template>
  <div class="markdown-content">
    <!-- 内容渲染 -->
    <div v-html="content" />

    <!-- 下一节按钮 -->
    <div class="next-section" v-if="nextSection">
      <router-link :to="`/tutorial/${nextSection.path}`" class="no-underline">
        <el-button>
          Next
          <el-icon><Right /></el-icon>
        </el-button>
        <div class="next-title">{{ nextSection.title }}</div>
      </router-link>
    </div>
  </div>
</template>


<script setup>
import { ref, watch, onMounted } from 'vue'
import axios from 'axios'
import { marked } from 'marked' 
import '@/styles/index.css'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import menu from '@/data/menu.json'
import { Right } from '@element-plus/icons-vue'

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

const route = useRoute()

// 扁平化 menu 中的所有章节 [{ path, title }]
const flatChapters = menu.flatMap(section => section.children.map(child => ({
  path: child.path,
  title: child.title
})))

const currentIndex = computed(() => flatChapters.findIndex(item => item.path === route.params.subsection || route.params.section))

const nextSection = computed(() => {
  if (currentIndex.value >= 0 && currentIndex.value < flatChapters.length - 1) {
    return flatChapters[currentIndex.value + 1]
  } else {
    return null
  }
})
</script>

<style scoped>
.markdown-content {
  line-height: 1.7;
  margin-left: 20px;
  padding-left: 1.2em;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  letter-spacing: 1px;
  color: var(--text-color);
}

.markdown-content :deep(h1) {
  font-size: 2em;
  margin-bottom: 16px;
  margin-top: 0;
  padding-top: 8px;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.3em;
  font-weight: 550;
}

.markdown-content :deep(h2) {
  font-size: 1.5em;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.3em;
  margin-top: 1em;
  margin-bottom: 16px;
  font-weight: 550;

}

.markdown-content :deep(p) {
  font-size: 1.2em;
  line-height: 1.6;
  margin-bottom: 1.2em;
}

.markdown-content :deep(code) {
  background-color: #f6f8fa;
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: monospace;
  font-size: 1.2em;
}

.markdown-content :deep(pre) {
  background-color: #f6f8fa;
  padding: 16px;
  border-radius: 3px;
  overflow: auto;
}

.markdown-content :deep(blockquote) {
  border-left: 4px solid #dfe2e5;
  color: #6a737d;
  padding: 0 1em;
  margin-left: 0;
}

.markdown-content :deep(li) {
  font-size: 1.1em;
}

.markdown-content :deep(strong) {
  font-size: 1.1em;
  font-weight: 600;
}

.next-section {
  margin-top: 60px;
  text-align: right;
  margin-right: 20px;
}

.el-button {
  font-size: 1.2em;
}

.next-title {
  margin-top: 8px;
  font-size: 1em;
  color: var(--text-color);
  padding-bottom: 15px;
}

.el-icon {
  margin-left: 7%;
  margin-top: 1px;
}

.no-underline {
  text-decoration: none;
}
</style>