<template>
  <div class="markdown-content">
    <!-- 内容渲染 -->
    <div v-html="content" ref="contentContainer" />

    <!-- 导航按钮区域 -->
    <div class="navigation-section">
      <!-- 上一节按钮 -->
      <div class="prev-section" v-if="prevSection">
        <router-link :to="`/tutorial/${prevSection.path}`" class="no-underline">
          <el-button>
            <el-icon><ArrowLeft /></el-icon>
            Previous
          </el-button>
          <div class="prev-title">{{ prevSection.title }}</div>
        </router-link>
      </div>

      <!-- 占位符，当没有上一节时保持布局 -->
      <div v-else></div>

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
  </div>
</template>


<script setup>
import { ref, watch, onMounted, nextTick } from 'vue'
import axios from 'axios'
import { marked } from 'marked' 
import '@/styles/index.css'
import '@/styles/content.css'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import menu from '@/data/menu.json'
import { Right, ArrowLeft, CopyDocument, VideoPlay } from '@element-plus/icons-vue'
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
    addCodeButtons()
  } catch {
    content.value = '<p>加载内容失败</p>'
  }
}

// 添加复制和运行按钮到代码块
function addCodeButtons() {
  if (!contentContainer.value) return
  
  const codeBlocks = contentContainer.value.querySelectorAll('pre')
  
  codeBlocks.forEach((pre) => {
    // 检查是否已经添加了按钮
    if (pre.querySelector('.copy-button')) return
    
    // 创建按钮容器
    const buttonContainer = document.createElement('div')
    buttonContainer.className = 'code-buttons'
    
    // 创建复制按钮
    const copyButton = document.createElement('button')
    copyButton.className = 'code-button copy-button'
    copyButton.innerHTML = `
      <svg class="icon" viewBox="0 0 1024 1024" width="16" height="16">
        <path d="M832 64H296c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h496v688c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8V96c0-17.7-14.3-32-32-32zM704 192H192c-17.7 0-32 14.3-32 32v530.7c0 8.5 3.4 16.6 9.4 22.6l173.3 173.3c2.2 2.2 4.7 4 7.4 5.5v1.9h4.4c2 0.5 4.1 0.8 6.1 0.8H704c17.7 0 32-14.3 32-32V224c0-17.7-14.3-32-32-32zM350 856.2L263.9 770H350v86.2zM672 924H414V746c0-22.1-17.9-40-40-40H192V256h480v668z"></path>
      </svg>
    `
    copyButton.title = '复制代码'
    copyButton.onclick = () => copyCode(pre)
    
    // 创建 Playground 按钮
    const playgroundButton = document.createElement('button')
    playgroundButton.className = 'code-button playground-button'
    playgroundButton.innerHTML = `
      <svg class="icon" viewBox="0 0 1024 1024" width="16" height="16">
        <path d="M880 112H144c-17.7 0-32 14.3-32 32v736c0 17.7 14.3 32 32 32h736c17.7 0 32-14.3 32-32V144c0-17.7-14.3-32-32-32zM528 176c0-4.4 3.6-8 8-8h168c4.4 0 8 3.6 8 8v48c0 4.4-3.6 8-8 8H536c-4.4 0-8-3.6-8-8v-48zm-192 0c0-4.4 3.6-8 8-8h112c4.4 0 8 3.6 8 8v48c0 4.4-3.6 8-8 8H344c-4.4 0-8-3.6-8-8v-48zM816 848H208V272h608v576z"></path>
        <path d="M536 368c0-4.4 3.6-8 8-8h200c4.4 0 8 3.6 8 8v56c0 4.4-3.6 8-8 8H544c-4.4 0-8-3.6-8-8v-56zm0 152c0-4.4 3.6-8 8-8h200c4.4 0 8 3.6 8 8v56c0 4.4-3.6 8-8 8H544c-4.4 0-8-3.6-8-8v-56zM280 368c0-4.4 3.6-8 8-8h176c4.4 0 8 3.6 8 8v56c0 4.4-3.6 8-8 8H288c-4.4 0-8-3.6-8-8v-56zm0 152c0-4.4 3.6-8 8-8h176c4.4 0 8 3.6 8 8v56c0 4.4-3.6 8-8 8H288c-4.4 0-8-3.6-8-8v-56z"></path>
      </svg>
    `
    playgroundButton.title = '在 Playground 中编辑'
    playgroundButton.onclick = () => openInPlayground(pre)
    
    // 创建运行按钮
    const runButton = document.createElement('button')
    runButton.className = 'code-button run-button'
    runButton.innerHTML = `
      <svg class="icon" viewBox="0 0 1024 1024" width="16" height="16">
        <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm144.1 454.9L437.7 677.8a8 8 0 01-12.6-6.5V353.7a8 8 0 0112.6-6.5L656.1 506a8 8 0 010 12.9z"></path>
      </svg>
    `
    runButton.title = '运行代码'
    runButton.onclick = () => runCode(pre)
    
    buttonContainer.appendChild(copyButton)
    buttonContainer.appendChild(runButton)
    buttonContainer.appendChild(playgroundButton)
    
    // 设置代码块容器为相对定位
    pre.style.position = 'relative'
    pre.appendChild(buttonContainer)
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

// 运行JavaScript代码
function runCode(pre) {
  const code = pre.querySelector('code')
  const codeText = code ? code.textContent : pre.textContent
  
  // 检查是否已存在输出区域
  let outputDiv = pre.nextElementSibling
  if (!outputDiv || !outputDiv.classList.contains('code-output')) {
    outputDiv = document.createElement('div')
    outputDiv.className = 'code-output'
    pre.parentNode.insertBefore(outputDiv, pre.nextSibling)
  }
  
  // 清空之前的输出
  outputDiv.innerHTML = ''
  
  // 创建输出标题
  const outputTitle = document.createElement('div')
  outputTitle.className = 'output-title'
  outputTitle.textContent = '运行结果:'
  outputDiv.appendChild(outputTitle)
  
  // 创建输出内容区域
  const outputContent = document.createElement('div')
  outputContent.className = 'output-content'
  outputDiv.appendChild(outputContent)
  
  // 重写console方法来捕获输出
  const originalLog = console.log
  const originalError = console.error
  const originalWarn = console.warn
  
  const logs = []
  
  console.log = (...args) => {
    logs.push({ type: 'log', content: args.map(arg => formatOutput(arg)).join(' ') })
    originalLog.apply(console, args)
  }
  
  console.error = (...args) => {
    logs.push({ type: 'error', content: args.map(arg => formatOutput(arg)).join(' ') })
    originalError.apply(console, args)
  }
  
  console.warn = (...args) => {
    logs.push({ type: 'warn', content: args.map(arg => formatOutput(arg)).join(' ') })
    originalWarn.apply(console, args)
  }
  
  // 重写alert方法
  const originalAlert = window.alert
  window.alert = (message) => {
    logs.push({ type: 'alert', content: String(message) })
  }
  
  try {
    // 执行代码
    const result = new Function(codeText)()
    
    // 如果有返回值，显示返回值
    if (result !== undefined) {
      logs.push({ type: 'return', content: formatOutput(result) })
    }
    
    // 如果没有任何输出，显示成功消息
    if (logs.length === 0) {
      logs.push({ type: 'success', content: '代码执行成功，无输出' })
    }
    
  } catch (error) {
    logs.push({ type: 'error', content: error.message })
  } finally {
    // 恢复原始方法
    console.log = originalLog
    console.error = originalError
    console.warn = originalWarn
    window.alert = originalAlert
  }
  
  // 显示输出
  logs.forEach(log => {
    const logElement = document.createElement('div')
    logElement.className = `output-line output-${log.type}`
    
    if (log.type === 'alert') {
      logElement.innerHTML = `<span class="output-prefix">[Alert]</span> ${log.content}`
    } else if (log.type === 'return') {
      logElement.innerHTML = `<span class="output-prefix">[Return]</span> ${log.content}`
    } else if (log.type === 'success') {
      logElement.innerHTML = `<span class="output-prefix">[Success]</span> ${log.content}`
    } else {
      logElement.textContent = log.content
    }
    
    outputContent.appendChild(logElement)
  })
  
  ElMessage.success('代码运行完成')
}

// 格式化输出内容
function formatOutput(value) {
  if (value === null) return 'null'
  if (value === undefined) return 'undefined'
  if (typeof value === 'string') return `"${value}"`
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value, null, 2)
    } catch {
      return String(value)
    }
  }
  return String(value)
}

onMounted(fetchContent)
watch(() => props.path, fetchContent)

const route = useRoute()
const router = useRouter()

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

// 获取上一节信息
const prevSection = computed(() => {
  const current = currentIndex.value
  if (current > 0) {
    return flatChapters[current - 1]
  }
  return null
})

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

// 在 Playground 中打开代码
function openInPlayground(pre) {
  const code = pre.querySelector('code')
  const codeText = code ? code.textContent : pre.textContent
  
  // 将代码存储到 localStorage
  localStorage.setItem('playground-code', codeText)
  
  // 跳转到你自己的 playground 页面
  router.push('/playground')
  
  ElMessage.success('代码已传递到 Playground')
}
</script>

<style scoped>
</style>