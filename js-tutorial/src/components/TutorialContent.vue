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
    
    // 等待 DOM 更新后添加复制按钮并滚动到内容顶部
    await nextTick()
    addCodeButtons()
    
    // 直接跳转到页面顶部
    window.scrollTo(0, 0)
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
      <svg class="icon" viewBox="0 0 1024 1024" width="16" height="16" fill="currentColor">
        <path d="M832 64H296c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h496v688c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8V96c0-17.7-14.3-32-32-32zM704 192H192c-17.7 0-32 14.3-32 32v530.7c0 8.5 3.4 16.6 9.4 22.6l173.3 173.3c2.2 2.2 4.7 4 7.4 5.5v1.9h4.4c2.9.8 6 1.3 9.3 1.3H704c17.7 0 32-14.3 32-32V224c0-17.7-14.3-32-32-32zM350 856.2L263.9 770H350v86.2zM672 888H414V746c0-22.1-17.9-40-40-40H232V264h440v624z"></path>
      </svg>
      <span>Copy</span>
    `
    copyButton.onclick = () => copyCode(pre)
    
    // 创建运行按钮
    const runButton = document.createElement('button')
    runButton.className = 'code-button run-button'
    runButton.innerHTML = `
      <svg class="icon" viewBox="0 0 1024 1024" width="16" height="16" fill="currentColor">
        <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm144.1 454.9L437.7 677.8a8 8 0 01-12.6-6.5V353.7a8 8 0 0112.6-6.5L656.1 506a8 8 0 010 12.9z"></path>
      </svg>
      <span>Run</span>
    `
    runButton.onclick = () => runCode(pre)
    
    // 创建 Playground 按钮
    const playgroundButton = document.createElement('button')
    playgroundButton.className = 'code-button playground-button'
    playgroundButton.innerHTML = `
      <svg class="icon" viewBox="0 0 1024 1024" width="16" height="16" fill="currentColor">
        <path d="M257.7 752c2 0 4-.2 6-.5L431.9 722c2-.4 3.9-1.3 5.3-2.8l423.9-423.9c3.9-3.9 3.9-10.2 0-14.1L694.9 114.9c-1.9-1.9-4.4-2.9-7.1-2.9s-5.2 1-7.1 2.9L256.8 538.8c-1.5 1.5-2.4 3.3-2.8 5.3l-29.5 168.2c-1.9 10.8 1.5 21.4 8.8 28.7 6.1 6.1 14.3 9.5 22.9 9.5zm67.4-174.4L687.8 215l73.3 73.3-362.7 362.6-88.9 15.7 15.6-89zM880 836H144c-17.7 0-32 14.3-32 32v36c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-36c0-17.7-14.3-32-32-32z"></path>
      </svg>
      <span>Edit in Playground</span>
    `
    playgroundButton.onclick = () => openInPlayground(pre)
    
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
  
  const copyButton = pre.querySelector('.copy-button')
  const originalContent = copyButton.innerHTML
  
  try {
    await navigator.clipboard.writeText(text)
    
    // 更改按钮为成功状态
    copyButton.innerHTML = `
      <svg class="icon" viewBox="0 0 1024 1024" width="16" height="16" fill="currentColor">
        <path d="M912 190h-69.9c-9.8 0-19.1 4.5-25.1 12.2l-273 347.7-101.6-129.3c-6-7.6-15.2-12.2-25.1-12.2H347c-6.5 0-10.3 7.4-6.5 12.7l175.6 223c4.4 5.6 12.4 5.6 16.8 0l298.2-379.4c3.8-5.3 0-12.7-6.5-12.7z"></path>
      </svg>
      <span>Copied</span>
    `
    
    // 2秒后恢复原状
    setTimeout(() => {
      copyButton.innerHTML = originalContent
    }, 2000)
    
  } catch (err) {
    // 降级处理：使用传统方法
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    
    // 更改按钮为成功状态
    copyButton.innerHTML = `
      <svg class="icon" viewBox="0 0 1024 1024" width="16" height="16" fill="currentColor">
        <path d="M912 190h-69.9c-9.8 0-19.1 4.5-25.1 12.2l-273 347.7-101.6-129.3c-6-7.6-15.2-12.2-25.1-12.2H347c-6.5 0-10.3 7.4-6.5 12.7l175.6 223c4.4 5.6 12.4 5.6 16.8 0l298.2-379.4c3.8-5.3 0-12.7-6.5-12.7z"></path>
      </svg>
      <span>Copied</span>
    `
    
    // 2秒后恢复原状
    setTimeout(() => {
      copyButton.innerHTML = originalContent
    }, 2000)
  }
}

// 运行JavaScript代码或HTML代码
function runCode(pre) {
  const runButton = pre.querySelector('.run-button')
  const originalContent = runButton.innerHTML
  
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
  
  // 判断是否为HTML代码
  const isHTML = codeText.trim().toLowerCase().includes('<!doctype html') || 
                 codeText.trim().toLowerCase().includes('<html') ||
                 codeText.trim().toLowerCase().includes('<body') ||
                 codeText.trim().toLowerCase().includes('<head')
  
  if (isHTML) {
    // 处理HTML代码
    runHTMLCode(codeText, outputDiv)
  } else {
    // 处理纯JavaScript代码
    runJavaScriptCode(codeText, outputDiv)
  }
  
  // 更改按钮为执行成功状态
  runButton.innerHTML = `
    <svg class="icon" viewBox="0 0 1024 1024" width="16" height="16" fill="currentColor">
      <path d="M912 190h-69.9c-9.8 0-19.1 4.5-25.1 12.2l-273 347.7-101.6-129.3c-6-7.6-15.2-12.2-25.1-12.2H347c-6.5 0-10.3 7.4-6.5 12.7l175.6 223c4.4 5.6 12.4 5.6 16.8 0l298.2-379.4c3.8-5.3 0-12.7-6.5-12.7z"></path>
    </svg>
    <span>Executed</span>
  `
  
  // 2秒后恢复原状
  setTimeout(() => {
    runButton.innerHTML = originalContent
  }, 2000)
}

// 运行HTML代码
function runHTMLCode(htmlCode, outputDiv) {
  // 创建输出标题
  const outputTitle = document.createElement('div')
  outputTitle.className = 'output-title'
  outputTitle.textContent = '网页预览:'
  outputDiv.appendChild(outputTitle)
  
  // 创建iframe来运行HTML代码
  const iframe = document.createElement('iframe')
  iframe.style.width = '100%'
  iframe.style.height = '200px' // 减小高度
  iframe.style.border = '1px solid #ddd'
  iframe.style.borderRadius = '4px'
  iframe.style.background = 'white'
  iframe.style.display = 'block' // 确保显示为块级元素
  iframe.style.marginBottom = '0' // 移除底部边距
  
  outputDiv.appendChild(iframe)
  
  // 将HTML代码写入iframe
  const iframeDoc = iframe.contentDocument || iframe.contentWindow.document
  iframeDoc.open()
  iframeDoc.write(htmlCode)
  iframeDoc.close()
}

// 运行纯JavaScript代码
function runJavaScriptCode(codeText, outputDiv) {
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
  
  // 重写alert方法 - 既显示真实弹窗，也记录到输出
  const originalAlert = window.alert
  window.alert = (message) => {
    const messageStr = String(message)
    logs.push({ type: 'alert', content: messageStr })
    // 调用原始的alert方法显示真实弹窗
    originalAlert(messageStr)
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