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
            <el-button size="small" @click="handleFormat">
              <el-icon><Document /></el-icon> 格式化
            </el-button>
            <el-button size="small" @click="handleClear">
              <el-icon><Delete /></el-icon> 清空
            </el-button>
          </div>
        </div>
        <MonacoEditor
          v-model:value="code"
          class="editor"
          :options="editorOptions"
          @mount="handleMount"    
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
import { ref, onMounted } from 'vue'
import MonacoEditor from '@guolao/vue-monaco-editor'
import { VideoPlay, Delete, Document } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// Monaco Editor 实例
const editor = ref(null)

const isLoading = ref(false)
const isError = ref(false)
const outputLines = ref([])
const defaultCode = '// 在这里输入你的JavaScript代码\nconsole.log("Hello World!");'
const code = ref(defaultCode)

const editorOptions = {
  language: 'javascript',
  theme: 'vs-dark',
  automaticLayout: true,
  formatOnType: true,
  formatOnPaste: true,
  fontSize: 17,
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  lineNumbers: 'on',
  tabSize: 2,
  wordWrap: 'on',
  readOnly: false
}

// 获取编辑器实例
const handleMount = (editorInstance) => {
  editor.value = editorInstance
  console.log('Monaco Editor 已挂载:', editorInstance)
}

const handleChange = (value) => {
  code.value = value
}

// 运行代码
const handleRun = async () => {
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

// 格式化代码
const handleFormat = () => {
  if (!editor.value) {
    ElMessage.error('编辑器未就绪')
    return
  }

  try {
    editor.value.getAction('editor.action.formatDocument').run()
    ElMessage.success('代码格式化成功')
  } catch (err) {
    console.error('格式化错误:', err)
    ElMessage.error('格式化失败：' + err.message)
  }
}

// 清空代码
const handleClear = () => {
  try {
    code.value = ''
    outputLines.value = []
    isError.value = false
    ElMessage.success('已清空代码和输出')
  } catch (err) {
    ElMessage.error('清空失败：' + err.message)
  }
}

// 从 localStorage 加载代码
onMounted(() => {
  const savedCode = localStorage.getItem('playground-code')
  if (savedCode) {
    code.value = savedCode
    localStorage.removeItem('playground-code')
  }
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
  /* 在小屏幕时变为垂直布局 */
  flex-direction: row;
}

.code-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #1e1e1e;
  border-radius: 8px;
  overflow: hidden;
  /* 确保在垂直布局时有最小高度 */
  min-height: 300px;
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
  /* 确保在垂直布局时有最小高度 */
  min-height: 250px;
}

.output-header {
  padding: 8px 16px;
  background-color: #f6f8fa;
  border-bottom: 1px solid #ddd;
  font-size: 16px; /* 从 14px 改为 16px */
  font-weight: 500; 
}

.output-content {
  flex: 1;
  padding: 16px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 17px; /* 增大字体 */
  line-height: 1.6; /* 增加行高 */
  white-space: pre-wrap;
  overflow-y: auto;
  background-color: var(--bg-color);
  color: var(--text-color);
  /* 修复触摸滚动问题 */
  -webkit-overflow-scrolling: touch;
  touch-action: pan-y; /* 允许垂直滚动 */
  /* 确保滚动条可见 */
  scrollbar-width: thin;
  scrollbar-color: #ccc transparent;
}

.output-content::-webkit-scrollbar {
  width: 8px;
}

.output-content::-webkit-scrollbar-track {
  background: transparent;
}

.output-content::-webkit-scrollbar-thumb {
  background-color: #ccc;
  border-radius: 4px;
}

.output-content::-webkit-scrollbar-thumb:hover {
  background-color: #999;
}

.output-content.error {
  color: #ff4d4f;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .editor-container {
    flex-direction: column;
    gap: 15px;
  }
  
  .playground {
    padding: 15px;
    height: auto;
    min-height: calc(100vh - 120px);
  }
  
  .code-section {
    min-height: 350px;
  }
  
  .editor {
    height: 350px;
    min-height: 350px;
  }
  
  .output-section {
    min-height: 200px;
  }
  
  .output-content {
    font-size: 17px; /* 平板端稍小一些 */
    padding: 14px;
  }
}

@media (max-width: 768px) {
  .playground {
    padding: 10px;
  }
  
  .editor-container {
    gap: 10px;
  }
  
  .toolbar {
    padding: 6px 12px;
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .actions {
    gap: 6px;
  }
  
  .actions :deep(.el-button) {
    font-size: 11px;
    padding: 4px 8px;
  }
  
  .code-section {
    min-height: 300px;
  }
  
  .editor {
    height: 300px;
    min-height: 300px;
  }
  
  .output-section {
    min-height: 180px;
  }
  
  .output-header {
    padding: 6px 12px;
    font-size: 15px; /* 从 14px 改为 15px */
    font-weight: 500;
  }
  
  .output-content {
    padding: 12px;
    font-size: 17px; /* 手机端保持适中大小 */
    line-height: 1.5;
    /* 增强移动端滚动 */
    -webkit-overflow-scrolling: touch;
    touch-action: pan-y;
    /* 为移动端增加更明显的滚动指示 */
    border: 1px solid #eee;
  }
}

@media (max-width: 480px) {
  .playground {
    padding: 8px;
  }
  
  .toolbar {
    padding: 4px 8px;
  }
  
  .toolbar span {
    font-size: 13px;
  }
  
  .actions :deep(.el-button) {
    font-size: 10px;
    padding: 3px 6px;
  }
  
  .code-section {
    min-height: 250px;
  }
  
  .editor {
    height: 250px;
    min-height: 250px;
  }
  
  .output-section {
    min-height: 150px;
  }
  
  .output-header {
    padding: 6px 12px;
    font-size: 14px; /* 小屏幕保持 14px */
    font-weight: 500;
  }
  
  .output-content {
    padding: 10px;
    font-size: 17px; /* 小屏幕适当减小 */
    line-height: 1.4;
  }
}

/* 为移动设备添加额外的触摸支持 */
@media (pointer: coarse) {
  .output-content {
    /* 在触摸设备上改善滚动体验 */
    overscroll-behavior: contain;
    scroll-behavior: smooth;
  }
}
</style>