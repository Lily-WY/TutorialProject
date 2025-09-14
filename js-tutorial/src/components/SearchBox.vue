<template>
  <div class="search-container">
    <!-- 桌面端搜索框 -->
    <div v-if="!isMobile" class="desktop-search">
      <el-input
        v-model="searchQuery"
        placeholder="请输入搜索内容"
        :suffix-icon="Search"
        size="large"
        class="search-box"
        @input="onInput"
        @focus="showDropdown = true"
        @keyup.enter="selectFirstResult"
        @keydown.down="navigateDown"
        @keydown.up="navigateUp"
        @keydown.esc="hideDropdown"
      />
      
      <!-- 搜索结果下拉 -->
      <div v-if="showDropdown && (searchResults.length > 0 || searchQuery)" class="search-dropdown">
        <div v-if="searchResults.length === 0 && searchQuery" class="no-results">
          未找到 "{{ searchQuery }}" 相关内容
        </div>
        <div 
          v-for="(result, index) in searchResults" 
          :key="result.id"
          class="result-item"
          :class="{ active: index === activeIndex }"
          @click="selectResult(result)"
          @mouseenter="activeIndex = index"
        >
          <div class="result-content">
            <div class="result-type">{{ result.type === 'category' ? '分类' : '文章' }}</div>
            <div class="result-title" v-html="highlightText(result.title, searchQuery)"></div>
            <div class="result-breadcrumb">{{ result.breadcrumb }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 移动端搜索覆盖层 -->
    <div v-if="showMobileSearch" class="mobile-search-overlay" @click="closeMobileSearch">
      <div class="mobile-search-container" @click.stop>
        <div class="mobile-header">
          <el-input
            v-model="searchQuery"
            placeholder="请输入搜索内容"
            size="large"
            class="mobile-search-input"
            autofocus
            @input="onInput"
            @keyup.enter="selectFirstResult"
          />
          <el-button @click="closeMobileSearch" type="text">取消</el-button>
        </div>
        
        <!-- 移动端搜索结果 -->
        <div v-if="searchResults.length > 0 || searchQuery" class="mobile-results">
          <div v-if="searchResults.length === 0 && searchQuery" class="no-results">
            未找到 "{{ searchQuery }}" 相关内容
          </div>
          <div 
            v-for="result in searchResults" 
            :key="result.id"
            class="result-item"
            @click="selectResult(result)"
          >
            <div class="result-content">
              <div class="result-type">{{ result.type === 'category' ? '分类' : '文章' }}</div>
              <div class="result-title" v-html="highlightText(result.title, searchQuery)"></div>
              <div class="result-breadcrumb">{{ result.breadcrumb }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { searchService } from '@/utils/searchService.js'

const props = defineProps({
  isMobile: {
    type: Boolean,
    default: false
  },
  showMobileSearch: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close-mobile-search'])

const router = useRouter()
const searchQuery = ref('')
const searchResults = ref([])
const showDropdown = ref(false)
const activeIndex = ref(-1)

// 搜索功能
const onInput = () => {
  if (searchQuery.value.trim()) {
    searchResults.value = searchService.search(searchQuery.value, 8)
    showDropdown.value = true
    activeIndex.value = -1
    console.log('搜索结果:', searchResults.value) // 调试用
  } else {
    searchResults.value = []
    showDropdown.value = false
  }
}

// 键盘导航
const navigateDown = () => {
  if (searchResults.value.length > 0) {
    activeIndex.value = Math.min(activeIndex.value + 1, searchResults.value.length - 1)
  }
}

const navigateUp = () => {
  if (searchResults.value.length > 0) {
    activeIndex.value = Math.max(activeIndex.value - 1, -1)
  }
}

// 选择第一个结果
const selectFirstResult = () => {
  if (searchResults.value.length > 0) {
    const result = activeIndex.value >= 0 ? searchResults.value[activeIndex.value] : searchResults.value[0]
    selectResult(result)
  }
}

// 高亮关键词
const highlightText = (text, keyword) => {
  if (!keyword) return text
  
  const regex = new RegExp(`(${keyword})`, 'gi')
  return text.replace(regex, '<span class="highlight">$1</span>')
}

// 选择搜索结果
const selectResult = (result) => {
  console.log('点击搜索结果:', result) // 调试用
  console.log('跳转路径:', result.path) // 调试用
  router.push(result.path)
  clearSearch()
  emit('close-mobile-search')
}

// 清空搜索
const clearSearch = () => {
  searchQuery.value = ''
  searchResults.value = []
  showDropdown.value = false
  activeIndex.value = -1
}

// 隐藏下拉框
const hideDropdown = () => {
  showDropdown.value = false
  activeIndex.value = -1
}

// 关闭移动端搜索
const closeMobileSearch = () => {
  clearSearch()
  emit('close-mobile-search')
}

// 点击外部关闭
const handleClickOutside = (event) => {
  if (!event.target.closest('.search-container')) {
    hideDropdown()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

defineExpose({
  clearSearch
})
</script>

<style scoped>
.search-container {
  position: relative;
}

/* 桌面端搜索框 - 使用你原有的样式 */
.desktop-search {
  position: relative;
}

.search-box {
  width: 700px;
  font-size: 15px;
  margin-top: 6px;
  margin-right: 20px;
}

/* 搜索下拉框 */
.search-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--bg-color);
  border: 1px solid var(--border-color, #dcdfe6);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-height: 300px;
  overflow-y: auto;
  z-index: 1001;
  margin-top: 4px;
}

.result-item {
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s;
}

.result-item:hover,
.result-item.active {
  background-color: #f8f9ff;
}

.result-item:last-child {
  border-bottom: none;
}

.result-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.result-type {
  font-size: 11px;
  color: #666;
  background: #f0f0f0;
  padding: 2px 6px;
  border-radius: 10px;
  width: fit-content;
}

.result-title {
  font-weight: 500;
  color: var(--text-color, #333);
  font-size: 14px;
}

.result-title :deep(.highlight) {
  background: #fffbf0;
  color: #d46b08;
  padding: 1px 2px;
  border-radius: 2px;
}

.result-breadcrumb {
  font-size: 12px;
  color: #999;
}

.no-results {
  padding: 20px;
  text-align: center;
  color: #999;
  font-size: 14px;
}

/* 移动端样式 - 保持你原有的样式 */
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
  padding-top: 95px;
}

.mobile-search-container {
  width: 100%;
  background: var(--bg-color);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.mobile-header {
  display: flex;
  gap: 10px;
  align-items: center;
}

.mobile-search-input {
  flex: 1;
}

.mobile-results {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid var(--border-color, #dcdfe6);
  border-radius: 6px;
  background: var(--bg-color);
}

/* 暗色模式适配 */
.dark .search-dropdown,
.dark .mobile-results {
  border-color: #30363d;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  background-color: #0d1117;
}

.dark .result-item:hover,
.dark .result-item.active {
  background-color: #21262d;
}

.dark .result-type {
  background: #30363d;
  color: #8b949e;
}

.dark .result-title :deep(.highlight) {
  background: #3d2914;
  color: #f1c40f;
}

.dark .result-title {
  color: #f0f6fc;
}

@media (max-width: 768px) {
  .desktop-search {
    display: none;
  }
}
</style>