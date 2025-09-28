<template>
  <div class="search-container" :class="{ 'mobile': isMobile }">
    <!-- 移动端搜索遮罩 -->
    <div 
      v-if="isMobile && showMobileSearch" 
      class="mobile-search-overlay"
      @click="closeMobileSearch"
    >
      <div class="mobile-search-content" @click.stop>
        <div class="mobile-search-header">
          <el-input
            ref="searchInputRef"
            v-model="searchQuery"
            placeholder="搜索教程内容..."
            size="large"
            @keyup.enter="handleSearch"
            @input="handleInput"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-button @click="closeMobileSearch" text>
            <el-icon><Close /></el-icon>
          </el-button>
        </div>
        
        <!-- 移动端搜索结果 -->
        <div v-if="shouldShowResults" class="search-results-container">
          <div class="search-results">
            <!-- 加载状态 -->
            <div v-if="isLoading" class="loading-state">
              <el-icon class="is-loading"><Loading /></el-icon>
              <span>搜索中...</span>
            </div>
            
            <!-- 搜索结果列表 -->
            <div v-else-if="searchResults.length > 0" class="results-list">
              <div 
                v-for="result in searchResults" 
                :key="result.id"
                class="result-item"
                @click="handleSelectResult(result)"
                @mousedown.prevent
              >
                <div class="result-header">
                  <div class="result-title-wrapper">
                    <h4 class="result-title" v-html="highlightText(result.title, searchQuery)"></h4>
                  </div>
                  <span class="result-category-text">{{ result.sectionTitle }}</span>
                </div>
                <div class="result-snippet" v-html="highlightText(result.snippet, searchQuery)"></div>
              </div>
            </div>
            
            <!-- 无结果 - 只在搜索完成且无结果时显示 -->
            <div v-else-if="!isLoading && searchQuery.trim() && hasSearched" class="no-results">
              <el-icon><DocumentRemove /></el-icon>
              <span>未找到 "{{ searchQuery }}" 相关内容</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 桌面端搜索 - 只在非移动端显示 -->
    <div v-if="!isMobile" class="desktop-search">
      <el-input
        ref="searchInputRef"
        v-model="searchQuery"
        placeholder="搜索教程内容..."
        style="width: 700px;"
        @focus="handleFocus"
        @blur="handleBlur"
        @keyup.enter="handleSearch"
        @input="handleInput"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      
      <!-- 桌面端搜索结果下拉框 - 只在有内容时显示 -->
      <div v-if="shouldShowResults" class="search-dropdown">
        <div class="search-results">
          <!-- 加载状态 -->
          <div v-if="isLoading" class="loading-state">
            <el-icon class="is-loading"><Loading /></el-icon>
            <span>搜索中...</span>
          </div>
          
          <!-- 搜索结果列表 -->
          <div v-else-if="searchResults.length > 0" class="results-list">
            <div 
              v-for="result in searchResults" 
              :key="result.id"
              class="result-item"
              @click="handleSelectResult(result)"
              @mousedown.prevent
            >
              <div class="result-header">
                <div class="result-title-wrapper">
                  <h4 class="result-title" v-html="highlightText(result.title, searchQuery)"></h4>
                </div>
                <span class="result-category-text">{{ result.sectionTitle }}</span>
              </div>
              <div class="result-snippet" v-html="highlightText(result.snippet, searchQuery)"></div>
            </div>
          </div>
          
          <!-- 无结果 - 只在搜索完成且无结果时显示 -->
          <div v-else-if="!isLoading && searchQuery.trim() && hasSearched" class="no-results">
            <el-icon><DocumentRemove /></el-icon>
            <span>未找到 "{{ searchQuery }}" 相关内容</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Close, Loading, DocumentRemove } from '@element-plus/icons-vue'

const props = defineProps({
  isMobile: Boolean,
  showMobileSearch: Boolean
})

const emit = defineEmits(['close-mobile-search'])

const router = useRouter()
const searchInputRef = ref(null)
const searchQuery = ref('')
const searchResults = ref([])
const isLoading = ref(false)
const showResults = ref(false)
const hasSearched = ref(false) // 新增：标记是否已经执行过搜索

// 计算是否应该显示搜索结果区域
const shouldShowResults = computed(() => {
  return showResults.value && (
    isLoading.value || 
    searchResults.value.length > 0 || 
    (hasSearched.value && !isLoading.value && searchQuery.value.trim())
  )
})

// 防抖函数
const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// 搜索函数
const searchTutorials = async (query, limit = 8) => {
  try {
    const response = await fetch(`/api/search?query=${encodeURIComponent(query)}&limit=${limit}`)
    if (!response.ok) throw new Error('搜索失败')
    return await response.json()
  } catch (error) {
    console.error('搜索失败:', error)
    throw error
  }
}

// 防抖搜索 - 减少延迟
const debouncedSearch = debounce(async (query) => {
  if (!query.trim()) {
    searchResults.value = []
    showResults.value = false
    isLoading.value = false
    hasSearched.value = false
    return
  }
  
  // 立即显示加载状态
  isLoading.value = true
  showResults.value = true
  hasSearched.value = false // 重置搜索状态
  
  try {
    const results = await searchTutorials(query)
    console.log('搜索结果:', results)
    
    // 确保搜索词还是当前的（用户可能已经改变了搜索词）
    if (searchQuery.value.trim() === query.trim()) {
      searchResults.value = results
      hasSearched.value = true // 标记已完成搜索
    }
  } catch (error) {
    console.error('搜索失败:', error)
    if (searchQuery.value.trim() === query.trim()) {
      searchResults.value = []
      hasSearched.value = true // 即使失败也标记已完成搜索
    }
  } finally {
    // 只有在搜索词匹配时才更新加载状态
    if (searchQuery.value.trim() === query.trim()) {
      isLoading.value = false
    }
  }
}, 150) // 减少到150ms

// 高亮搜索关键词
const highlightText = (text, query) => {
  if (!query || !text) return text
  
  const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}

// 转义正则表达式特殊字符
const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

const handleInput = (value) => {
  if (value.trim()) {
    debouncedSearch(value)
  } else {
    // 清空输入时立即隐藏
    searchResults.value = []
    showResults.value = false
    isLoading.value = false
    hasSearched.value = false
  }
}

const handleFocus = () => {
  // 只有在有搜索内容时才显示结果
  if (searchQuery.value.trim() && (searchResults.value.length > 0 || isLoading.value || hasSearched.value)) {
    showResults.value = true
  }
}

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push(`/search?q=${encodeURIComponent(searchQuery.value)}`)
    closeMobileSearch()
  }
}

const handleSelectResult = (result) => {
  console.log('=== 点击搜索结果 ===')
  console.log('result:', result)
  
  // 阻止事件冒泡
  event?.preventDefault?.()
  event?.stopPropagation?.()
  
  // 确保路径正确
  let targetPath = result.path
  if (!targetPath.startsWith('/tutorial')) {
    targetPath = `/tutorial${targetPath}`
  }
  
  console.log('跳转路径:', targetPath)
  
  // 立即关闭搜索结果
  showResults.value = false
  searchQuery.value = ''
  hasSearched.value = false
  if (props.isMobile) {
    emit('close-mobile-search')
  }
  
  // 使用 nextTick 确保 DOM 更新后再跳转
  nextTick(() => {
    router.push(targetPath).then(() => {
      console.log('✅ 跳转成功:', targetPath)
    }).catch(err => {
      console.error('❌ 跳转失败:', err)
      // 备用方案
      window.location.href = targetPath
    })
  })
}

const handleBlur = () => {
  setTimeout(() => {
    showResults.value = false
  }, 200)
}

const closeMobileSearch = () => {
  emit('close-mobile-search')
  searchQuery.value = ''
  searchResults.value = []
  showResults.value = false
  hasSearched.value = false
}

watch(() => props.showMobileSearch, (show) => {
  if (show) {
    nextTick(() => {
      searchInputRef.value?.focus()
    })
  }
})
</script>

<style scoped>
.search-container {
  position: relative;
}

.desktop-search {
  position: relative;
}

.search-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  max-height: 400px;
  overflow-y: auto;
  margin-top: 4px;
}

.mobile-search-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 2000;
  display: flex;
  align-items: flex-start;
  padding-top: 60px;
}

.mobile-search-content {
  background: var(--bg-color);
  width: 100%;
  max-height: 80vh;
  border-radius: 12px 12px 0 0;
  display: flex;
  flex-direction: column;
}

.mobile-search-header {
  padding: 20px;
  display: flex;
  gap: 10px;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
}

.mobile-search-header .el-input {
  flex: 1;
}

.search-results-container {
  flex: 1;
  overflow-y: auto;
  padding: 10px 0;
}

/* 搜索结果样式 */
.search-results {
  min-height: 60px;
}

.loading-state, .no-results {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px;
  color: var(--text-color-secondary);
  font-size: 14px;
}

.results-list {
  padding: 8px 0;
}

.result-item {
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid var(--border-color-light);
  transition: background-color 0.2s;
  user-select: none;
}

.result-item:hover {
  background-color: var(--hover-bg-color, rgba(0, 0, 0, 0.05));
}

.result-item:active {
  background-color: var(--active-bg-color, rgba(0, 0, 0, 0.1));
}

.result-item:last-child {
  border-bottom: none;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
  gap: 12px;
}

.result-title-wrapper {
  flex: 1;
}

.result-title {
  font-size: 16px;
  font-weight: 600;
  color: white;
  margin: 0;
  line-height: 1.3;
  background-color: var(--primary-color, #83d8ff);
  padding: 6px 12px;
  border-radius: 6px;
  display: inline-block;
}

.result-category-text {
  color: var(--text-color-secondary, #666);
  font-size: 12px;
  white-space: nowrap;
  flex-shrink: 0;
  align-self: center;
}

.result-snippet {
  font-size: 14px;
  color: var(--text-color-secondary);
  line-height: 1.5;
  margin-bottom: 0;
}

/* 暗色模式适配 */
:root.dark .result-title {
  background-color: var(--primary-color, #409eff);
  color: white;
}

:deep(mark) {
  background-color: #fff3cd;
  color: #856404;
  padding: 2px 4px;
  border-radius: 3px;
  font-weight: 600;
}

/* 暗色模式下的高亮样式 */
:root.dark :deep(mark) {
  background-color: #664d03;
  color: #fff3cd;
}
</style>