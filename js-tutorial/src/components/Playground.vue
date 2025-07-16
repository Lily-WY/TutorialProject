//无法编辑、清空
<template>
  <div class="playground">
    <div class="editor-container">
      <div class="code-section">
        <div class="toolbar">
          <span>JavaScript</span>
          <div class="actions">
            <el-button size="small" @click="handleRun" :loading="isLoading">
              <el-icon><VideoPlay /></el-icon> 运行
            </el-button>
            <el-dropdown>
              <el-button size="small">
                <el-icon><Delete /></el-icon> 清空
                <el-icon class="el-icon--right"><arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="handleReset">重置为默认代码</el-dropdown-item>
                  <el-dropdown-item @click="handleClear">完全清空</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
        <MonacoEditor
          ref="monacoEditor"
          v-model:value="code"
          class="editor"
          :options="editorOptions"
          @mounted="handleEditorMounted"
          @change="handleChange"
        />
      </div>
      <div class="output-section">
        <div class="output-header">输出结果</div>
        <div class="output-content" :class="{ 'error': isError }">
          <template v-if="outputLines.length">
            <div v-for="(line, index) in outputLines" :key="index">{{ line }}</div>
          </template>
          <div v-else>点击"运行"按钮查看输出结果</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import MonacoEditor from '@guolao/vue-monaco-editor' // Changed import
import { VideoPlay, Delete, ArrowDown } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const monacoEditor = ref(null)
const isLoading = ref(false)
const isError = ref(false)
const outputLines = ref([])
const defaultCode = '// 在这里输入你的JavaScript代码\nconsole.log("Hello World!");'
const code = ref(defaultCode)

const editorOptions = {
  language: 'javascript',
  theme: 'vs-dark',
  fontSize: 17,
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  automaticLayout: true,
  lineNumbers: 'on',
  tabSize: 2,
  wordWrap: 'on',
  formatOnPaste: true,
  formatOnType: true,
  readOnly: false
}

const handleEditorMounted = (editor) => {
  monacoEditor.value = editor
}

const handleChange = (value) => {
  code.value = value
}

const handleRun = async () => {
  if (!monacoEditor.value) {
    ElMessage.error('编辑器未就绪')
    return
  }

  try {
    isLoading.value = true
    isError.value = false
    outputLines.value = []

    const customConsole = {
      log: (...args) => {
        outputLines.value.push(
          args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
          ).join(' ')
        )
      },
      error: (...args) => {
        isError.value = true
        outputLines.value.push('Error: ' + args.join(' '))
      }
    }

    new Function('console', code.value)(customConsole)
  } catch (err) {
    isError.value = true
    outputLines.value.push('Error: ' + err.message)
    ElMessage.error('代码执行出错')
  } finally {
    isLoading.value = false
  }
}

const handleReset = () => {
  if (!monacoEditor.value) {
    ElMessage.error('编辑器未就绪')
    return
  }

  try {
    code.value = defaultCode
    outputLines.value = []
    isError.value = false
    ElMessage.success('已重置代码和输出')
  } catch (err) {
    ElMessage.error('重置失败：' + err.message)
  }
}

const handleClear = () => {
  if (!monacoEditor.value) {
    ElMessage.error('编辑器未就绪')
    return
  }

  try {
    code.value = ''
    outputLines.value = []
    isError.value = false
    ElMessage.success('已清空代码和输出')
  } catch (err) {
    ElMessage.error('清空失败：' + err.message)
  }
}

onMounted(() => {
  const savedCode = localStorage.getItem('playground-code')
  if (savedCode) {
    // 设置到编辑器中
    code.value = savedCode
    // 可选：清除 localStorage 中的代码
    localStorage.removeItem('playground-code')
  }
})

onBeforeUnmount(() => {
  // Cleanup if needed
})
</script>

<style scoped>
.playground {
  padding: 20px;
  height: calc(100vh - 120px);
}

.editor-container {
  display: flex;
  gap: 20px;
  height: 100%;
}

.code-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #1e1e1e;
  border-radius: 8px;
  overflow: hidden;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background-color: #2d2d2d;
  color: #fff;
  z-index: 1;
}

.actions {
  display: flex;
  gap: 8px;
}

.actions :deep(.el-button) {
  font-size: 12px; 
}

:deep(.el-dropdown-menu__item) {
  font-size: 12px;
}

.editor {
  flex: 1;
  height: calc(100vh - 200px);
  min-height: 400px;
  width: 100%;
}

:deep(.monaco-editor) {
  padding: 0;
  width: 100% !important;
  height: 100% !important;
}

.output-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

.output-header {
  padding: 8px 16px;
  background-color: #f6f8fa;
  border-bottom: 1px solid #ddd;
}

.output-content {
  flex: 1;
  padding: 16px;
  font-family: Monaco, monospace;
  white-space: pre-wrap;
  overflow-y: auto;
  background-color: var(--bg-color);
  color: var(--text-color);
}

.output-content.error {
  color: #ff4d4f;
}
</style>