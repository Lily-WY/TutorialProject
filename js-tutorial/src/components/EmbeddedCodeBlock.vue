<template>
  <div class="embedded-code-block">
    <div class="code-header">
      <span class="language-tag">{{ language }}</span>
      <div class="actions">
        <el-button size="small" @click="copyCode" :loading="isCopying">
          <el-icon><DocumentCopy /></el-icon> 复制
        </el-button>
        <el-button size="small" @click="runCode" :loading="isRunning">
          <el-icon><VideoPlay /></el-icon> 运行
        </el-button>
        <el-button size="small" @click="editInMonaco">
          <el-icon><Edit /></el-icon> 编辑器中打开
        </el-button>
      </div>
    </div>
    
    <div class="code-display">
      <pre><code :class="`language-${language}`">{{ code }}</code></pre>
    </div>
    
    <div v-if="showOutput" class="output-section">
      <div class="output-header">
        <span>输出结果</span>
        <el-button 
          size="small" 
          type="text" 
          @click="showOutput = false"
          class="close-btn"
        >
          <el-icon><Close /></el-icon>
        </el-button>
      </div>
      <div class="output-content" :class="{ 'error': hasError }">
        <div v-for="(line, index) in outputLines" :key="index" v-html="line"></div>
        <div v-if="outputLines.length === 0" class="no-output">无输出</div>
      </div>
    </div>

    <!-- Monaco Editor 弹窗 -->
    <el-dialog 
      v-model="showEditor" 
      title="代码编辑器" 
      width="90%" 
      :before-close="handleEditorClose"
      class="editor-dialog"
    >
      <div class="editor-container">
        <div class="editor-toolbar">
          <el-button @click="runEditorCode" type="primary" :loading="isEditorRunning">
            <el-icon><VideoPlay /></el-icon> 运行
          </el-button>
          <el-button @click="resetEditorCode">
            <el-icon><Refresh /></el-icon> 重置
          </el-button>
          <el-button @click="copyEditorCode">
            <el-icon><DocumentCopy /></el-icon> 复制
          </el-button>
        </div>
        
        <div ref="editorContainer" class="monaco-editor-wrapper"></div>
        
        <div v-if="showEditorOutput" class="editor-output">
          <div class="output-header">
            <span>输出结果</span>
            <el-button 
              size="small" 
              type="text" 
              @click="showEditorOutput = false"
            >
              <el-icon><Close /></el-icon>
            </el-button>
          </div>
          <div class="output-content" :class="{ 'error': hasEditorError }">
            <div v-for="(line, index) in editorOutputLines" :key="index" v-html="line"></div>
            <div v-if="editorOutputLines.length === 0" class="no-output">无输出</div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import * as monaco from 'monaco-editor'
import { DocumentCopy, VideoPlay, Edit, Close, Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  code: {
    type: String,
    required: true
  },
  language: {
    type: String,
    default: 'javascript'
  }
})

// 代码块状态
const isCopying = ref(false)
const isRunning = ref(false)
const hasError = ref(false)
const outputLines = ref([])
const showOutput = ref(false)

// 编辑器状态
const showEditor = ref(false)
const editorContainer = ref(null)
const editorInstance = ref(null)
const isEditorRunning = ref(false)
const hasEditorError = ref(false)
const editorOutputLines = ref([])
const showEditorOutput = ref(false)
const editorCode = ref(props.code)

// 复制代码
const copyCode = async () => {
  try {
    isCopying.value = true
    await navigator.clipboard.writeText(props.code)
    ElMessage.success('代码已复制到剪贴板')
  } catch (err) {
    ElMessage.error('复制失败')
  } finally {
    isCopying.value = false
  }
}

// 运行代码
const runCode = async () => {
  if (props.language !== 'javascript' && props.language !== 'js') {
    ElMessage.warning('只支持运行 JavaScript 代码')
    return
  }

  try {
    isRunning.value = true
    hasError.value = false
    outputLines.value = []
    showOutput.value = true

    const console = {
      log: (...args) => {
        const message = args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ')
        outputLines.value.push(escapeHtml(message))
      },
      error: (...args) => {
        hasError.value = true
        const message = 'Error: ' + args.join(' ')
        outputLines.value.push(`<span style="color: #ff4d4f;">${escapeHtml(message)}</span>`)
      }
    }

    new Function('console', props.code)(console)
  } catch (err) {
    hasError.value = true
    outputLines.value.push(`<span style="color: #ff4d4f;">Error: ${escapeHtml(err.message)}</span>`)
  } finally {
    isRunning.value = false
  }
}

// 在编辑器中打开
const editInMonaco = async () => {
  showEditor.value = true
  editorCode.value = props.code
  
  await nextTick()
  initMonacoEditor()
}

// 初始化 Monaco Editor
const initMonacoEditor = () => {
  if (!editorContainer.value) return

  if (editorInstance.value) {
    editorInstance.value.dispose()
  }

  editorInstance.value = monaco.editor.create(editorContainer.value, {
    value: editorCode.value,
    language: props.language,
    theme: 'vs-dark',
    fontSize: 14,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    automaticLayout: true,
    lineNumbers: 'on',
    tabSize: 2,
    wordWrap: 'on'
  })

  // 监听内容变化
  editorInstance.value.onDidChangeModelContent(() => {
    editorCode.value = editorInstance.value.getValue()
  })
}

// 运行编辑器中的代码
const runEditorCode = async () => {
  if (!editorInstance.value) {
    ElMessage.error('编辑器未就绪')
    return
  }

  try {
    isEditorRunning.value = true
    hasEditorError.value = false
    editorOutputLines.value = []
    showEditorOutput.value = true

    const console = {
      log: (...args) => {
        const message = args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ')
        editorOutputLines.value.push(escapeHtml(message))
      },
      error: (...args) => {
        hasEditorError.value = true
        const message = 'Error: ' + args.join(' ')
        editorOutputLines.value.push(`<span style="color: #ff4d4f;">${escapeHtml(message)}</span>`)
      }
    }

    const currentCode = editorInstance.value.getValue()
    new Function('console', currentCode)(console)
  } catch (err) {
    hasEditorError.value = true
    editorOutputLines.value.push(`<span style="color: #ff4d4f;">Error: ${escapeHtml(err.message)}</span>`)
  } finally {
    isEditorRunning.value = false
  }
}

// 重置编辑器代码
const resetEditorCode = () => {
  if (editorInstance.value) {
    editorInstance.value.setValue(props.code)
    editorCode.value = props.code
    ElMessage.success('代码已重置')
  }
}

// 复制编辑器代码
const copyEditorCode = async () => {
  if (!editorInstance.value) return

  try {
    const currentCode = editorInstance.value.getValue()
    await navigator.clipboard.writeText(currentCode)
    ElMessage.success('代码已复制到剪贴板')
  } catch (err) {
    ElMessage.error('复制失败')
  }
}

// 关闭编辑器
const handleEditorClose = () => {
  if (editorInstance.value) {
    editorInstance.value.dispose()
    editorInstance.value = null
  }
  showEditor.value = false
  showEditorOutput.value = false
}

// HTML 转义
const escapeHtml = (text) => {
  if (typeof text !== 'string') {
    return String(text)
  }
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

onBeforeUnmount(() => {
  if (editorInstance.value) {
    editorInstance.value.dispose()
  }
})
</script>

<style scoped>
.embedded-code-block {
  margin: 1rem 0;
  border: 1px solid #e1e4e8;
  border-radius: 6px;
  overflow: hidden;
  background-color: #fff;
}

.code-header {
  background-color: #f6f8fa;
  padding: 0.75rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e1e4e8;
}

.language-tag {
  font-size: 0.875rem;
  color: #586069;
  font-weight: 600;
  text-transform: uppercase;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.code-display {
  position: relative;
}

.code-display pre {
  margin: 0;
  padding: 1rem;
  background-color: #f8f9fa;
  overflow-x: auto;
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
  line-height: 1.4;
}

.code-display code {
  background: none;
  padding: 0;
  border-radius: 0;
  font-size: inherit;
}

.output-section, .editor-output {
  border-top: 1px solid #e1e4e8;
}

.output-header {
  background-color: #f1f3f4;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #586069;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close-btn {
  padding: 0 !important;
  margin: 0 !important;
}

.output-content {
  padding: 1rem;
  background-color: #fff;
  font-family: 'Courier New', Courier, monospace;
  white-space: pre-wrap;
  min-height: 2rem;
  max-height: 200px;
  overflow-y: auto;
}

.output-content.error {
  background-color: #fef2f2;
}

.no-output {
  color: #888;
  font-style: italic;
}

.editor-dialog {
  .el-dialog__body {
    padding: 0;
  }
}

.editor-container {
  height: 70vh;
  display: flex;
  flex-direction: column;
}

.editor-toolbar {
  padding: 1rem;
  background-color: #f6f8fa;
  border-bottom: 1px solid #e1e4e8;
  display: flex;
  gap: 0.5rem;
}

.monaco-editor-wrapper {
  flex: 1;
  height: 100%;
}

.editor-output {
  max-height: 200px;
  border-top: 1px solid #e1e4e8;
}
</style>