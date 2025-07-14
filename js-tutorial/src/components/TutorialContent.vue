<template>
  <div class="markdown-content">
    <!-- 内容渲染 -->
    <div v-html="content" ref="contentContainer" />

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
import { ref, watch, onMounted, nextTick } from 'vue'
import axios from 'axios'
import { marked } from 'marked' 
import '@/styles/index.css'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import menu from '@/data/menu.json'
import { Right, DocumentCopy } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// Configure marked without CodeBlock handling
marked.setOptions({
  breaks: true,
  gfm: true
})

const props = defineProps({
  path: {
    type: String,
    required: true
  }
})

const content = ref('加载中...')
const contentContainer = ref(null)

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
    
    // 等待 DOM 更新后添加复制按钮
    await nextTick()
    addCopyButtons()
  } catch {
    content.value = '<p>加载内容失败</p>'
  }
}

// 添加复制按钮到代码块
function addCopyButtons() {
  if (!contentContainer.value) return
  
  const codeBlocks = contentContainer.value.querySelectorAll('pre')
  
  codeBlocks.forEach((pre) => {
    // 检查是否已经添加了复制按钮
    if (pre.querySelector('.copy-button')) return
    
    // 创建复制按钮容器
    const copyContainer = document.createElement('div')
    copyContainer.className = 'copy-container'
    
    // 创建复制按钮
    const copyButton = document.createElement('button')
    copyButton.className = 'copy-button'
    copyButton.innerHTML = `
      <svg viewBox="0 0 1024 1024" width="16" height="16">
        <path d="M832 64H296c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h496v688c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8V96c0-17.7-14.3-32-32-32zM704 192H192c-17.7 0-32 14.3-32 32v530.7c0 8.5 3.4 16.6 9.4 22.6l173.3 173.3c2.2 2.2 4.7 4 7.4 5.5v1.9h4.4c2 0.5 4.1 0.8 6.1 0.8H704c17.7 0 32-14.3 32-32V224c0-17.7-14.3-32-32-32zM350 856.2L263.9 770H350v86.2zM672 924H414V746c0-22.1-17.9-40-40-40H192V256h480v668z"></path>
      </svg>
    `
    copyButton.title = '复制代码'
    
    // 添加点击事件
    copyButton.onclick = () => copyCode(pre)
    
    copyContainer.appendChild(copyButton)
    
    // 设置代码块容器为相对定位
    pre.style.position = 'relative'
    pre.appendChild(copyContainer)
  })
}

// 复制代码到剪贴板
async function copyCode(pre) {
  const code = pre.querySelector('code')
  const text = code ? code.textContent : pre.textContent
  
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('代码已复制到剪贴板')
  } catch (err) {
    // 降级处理：使用传统方法
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    ElMessage.success('代码已复制到剪贴板')
  }
}

onMounted(fetchContent)
watch(() => props.path, fetchContent)

const route = useRoute()

// 扁平化 menu 中的所有章节并包含完整路径信息
const flatChapters = menu.flatMap((section, sectionIndex) => 
  section.children.map((child, childIndex) => ({
    path: `${section.id}/${child.path}`,
    title: child.title,
    sectionIndex,
    childIndex
  }))
)

// 获取当前路径
const currentPath = computed(() => {
  const { section, subsection } = route.params
  return subsection ? `${section}/${subsection}` : section
})

// 获取当前索引
const currentIndex = computed(() => 
  flatChapters.findIndex(item => item.path === currentPath.value)
)

// 获取下一节信息
const nextSection = computed(() => {
  const current = currentIndex.value
  if (current >= 0 && current < flatChapters.length - 1) {
    return flatChapters[current + 1]
  }
  return null
})

// 用于调试的 watcher
watch([currentPath, currentIndex, nextSection], ([path, index, next]) => {
  console.log('Debug info:', {
    currentPath: path,
    currentIndex: index,
    nextSection: next
  })
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
  position: relative;
}

.markdown-content :deep(.copy-container) {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
}

.markdown-content :deep(.copy-button) {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #d1d9e0;
  border-radius: 4px;
  padding: 6px 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  color: #586069;
}

.markdown-content :deep(.copy-button:hover) {
  background: #fff;
  border-color: #c4c9d0;
  color: #24292e;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.markdown-content :deep(.copy-button svg) {
  fill: currentColor;
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
  margin-top: 2rem;
  padding: 1rem;
  border-top: 1px solid #eee;
  text-align: right;
  margin-right: 20px;
}

.el-button {
  font-size: 1.2em;
}

.next-title {
  margin-top: 0.5rem;
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