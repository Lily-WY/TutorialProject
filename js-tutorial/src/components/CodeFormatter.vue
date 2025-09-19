<template>
  <!-- Code formatter component - provides formatting logic without UI -->
  <!-- 代码格式化组件 - 仅提供格式化逻辑，无UI -->
</template>

<script setup>
import { defineExpose } from 'vue'

// Default formatting options / 默认格式化选项
const defaultOptions = {
  indentSize: 2,
  semicolon: true,
  singleQuote: true,
  bracketSpacing: true,
  arrowParens: 'avoid'
}

// Main JavaScript code formatter / 主要的JavaScript代码格式化函数
const formatJavaScript = (code, options = {}) => {
  const opts = { ...defaultOptions, ...options }
  
  if (!code?.trim()) return code
  
  try {
    // Step 1: Protect string literals / 保护字符串字面量
    const { code: processedCode, strings } = protectStrings(code)
    
    let formatted = processedCode
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
    
    // Step 2-6: Format structure, operators, keywords, arrays/objects, and indentation
    // 格式化结构、操作符、关键字、数组/对象和缩进
    formatted = formatStructure(formatted)
    formatted = formatOperators(formatted)
    formatted = formatKeywords(formatted)
    formatted = formatArraysAndObjects(formatted, opts)
    formatted = addIndentation(formatted, opts.indentSize)
    
    // Step 7: Restore protected strings / 恢复被保护的字符串
    formatted = restoreStrings(formatted, strings)
    
    return formatted
  } catch (error) {
    console.error('Formatting error / 格式化错误:', error)
    return code
  }
}

// Protect string literals from formatting / 保护字符串不被格式化
const protectStrings = (code) => {
  const strings = []
  let stringIndex = 0
  
  // Replace all string types with placeholders / 用占位符替换所有字符串类型
  code = code.replace(/"([^"\\]|\\.)*"/g, (match) => {
    strings[stringIndex] = match
    return `__STRING_${stringIndex++}__`
  })
  
  code = code.replace(/'([^'\\]|\\.)*'/g, (match) => {
    strings[stringIndex] = match
    return `__STRING_${stringIndex++}__`
  })
  
  code = code.replace(/`([^`\\]|\\.)*`/g, (match) => {
    strings[stringIndex] = match
    return `__STRING_${stringIndex++}__`
  })
  
  return { code, strings }
}

// Restore protected strings / 恢复被保护的字符串
const restoreStrings = (code, strings) => {
  strings.forEach((str, index) => {
    code = code.replace(`__STRING_${index}__`, str)
  })
  return code
}

// Format code structure and blocks / 格式化代码结构和块
const formatStructure = (code) => {
  code = code.replace(/\s+/g, ' ').trim()
  
  // Protect control structure conditions / 保护控制结构的条件部分
  const strings = []
  let stringIndex = 0
  
  code = code.replace(/(['"`])([^'"`\\]|\\.)*?\1/g, (match) => {
    strings[stringIndex] = match
    return `__STR_${stringIndex++}__`
  })
  
  const conditions = []
  let condIndex = 0
  
  code = code.replace(/\b(for|while|if|switch|catch)\s*\([^)]*\)/g, (match) => {
    const cleaned = match.replace(/\s*;\s*/g, '; ').replace(/\s+/g, ' ')
    conditions[condIndex] = cleaned
    return `__COND_${condIndex++}__`
  })
  
  code = code.replace(/([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g, '$1(')
  
  // Expand brace blocks to multiple lines / 展开大括号块为多行
  code = code.replace(/\{\s*([^{}]*?)\s*\}/g, (match, content) => {
    content = content.trim()
    if (!content) return '{}'
    
    // Split statements by semicolons / 按分号分割语句
    const statements = []
    let current = ''
    let depth = 0
    
    for (let i = 0; i < content.length; i++) {
      const char = content[i]
      if (char === '{') depth++
      else if (char === '}') depth--
      else if (char === ';' && depth === 0) {
        if (current.trim()) statements.push(current.trim())
        current = ''
        continue
      }
      current += char
    }
    if (current.trim()) statements.push(current.trim())
    
    if (statements.length === 1) {
      return `{\n  ${statements[0]}\n}`
    } else if (statements.length > 1) {
      return `{\n${statements.map(stmt => `  ${stmt}`).join(';\n')}\n}`
    } else {
      return `{\n  ${content}\n}`
    }
  })
  
  code = code.replace(/;(?!\s*\n)/g, ';\n')
  code = code.replace(/\s*{\s*/g, ' {\n')
  code = code.replace(/\s*}\s*/g, '\n}')
  
  // Handle else statements / 处理else语句
  code = code.replace(/}\s*\nelse/g, '} else')
  
  // Restore protected content / 恢复被保护的内容
  conditions.forEach((cond, i) => {
    code = code.replace(`__COND_${i}__`, cond)
  })
  
  strings.forEach((str, i) => {
    code = code.replace(`__STR_${i}__`, str)
  })
  
  return code
}

// Format operators with proper spacing / 格式化操作符并添加适当空格
const formatOperators = (code) => {
  return code
    .replace(/([a-zA-Z0-9_\])])\s*=\s*([^=])/g, '$1 = $2')
    .replace(/([a-zA-Z0-9_\])])\s*(===?|!==?)\s*([a-zA-Z0-9_\["'])/g, '$1 $2 $3')
    .replace(/([a-zA-Z0-9_\])])\s*([<>]=?)\s*([a-zA-Z0-9_\["'])/g, '$1 $2 $3')
    .replace(/([a-zA-Z0-9_\])])\s*([+\-*/%])\s*([a-zA-Z0-9_\["'])/g, '$1 $2 $3')
    .replace(/([a-zA-Z0-9_\])])\s*(&&|\|\|)\s*([a-zA-Z0-9_\["'])/g, '$1 $2 $3')
    .replace(/,(?!\s)/g, ', ')
}

// Format JavaScript keywords / 格式化JavaScript关键字
const formatKeywords = (code) => {
  return code
    .replace(/\b(if|for|while|switch|catch|with)\s*\(/g, '$1 (')
    .replace(/\bfunction\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g, 'function $1(')
    .replace(/\bfunction\s*\(/g, 'function (')
    .replace(/\b(const|let|var)\s+/g, '$1 ')
    .replace(/\b(return|throw|new|typeof|instanceof|delete)\s+/g, '$1 ')
}

// Format arrays and objects / 格式化数组和对象
const formatArraysAndObjects = (code, options) => {
  // Convert long arrays to multi-line / 将长数组转换为多行
  code = code.replace(/\[([^\[\]]{60,})\]/g, (match, content) => {
    const items = content.split(',').map(item => item.trim()).filter(item => item)
    if (items.length > 1) {
      return `[\n${items.map(item => `  ${item}`).join(',\n')}\n]`
    }
    return match
  })
  
  // Convert long objects to multi-line / 将长对象转换为多行
  code = code.replace(/\{([^{}]{80,})\}/g, (match, content) => {
    if (!content.includes(':')) return match
    const pairs = content.split(',').map(pair => pair.trim()).filter(pair => pair)
    if (pairs.length > 1) {
      return `{\n${pairs.map(pair => `  ${pair}`).join(',\n')}\n}`
    }
    return match
  })
  
  return code
}

// Add proper indentation to code / 为代码添加适当的缩进
const addIndentation = (code, indentSize) => {
  const lines = code.split('\n')
  let indentLevel = 0
  const indent = ' '.repeat(indentSize)
  
  return lines.map(line => {
    const trimmed = line.trim()
    if (!trimmed) return ''
    
    // Handle closing braces / 处理右大括号
    if (trimmed.startsWith('}')) {
      indentLevel = Math.max(0, indentLevel - 1)
    }
    
    let currentIndent = indentLevel
    if (trimmed.startsWith('} else')) {
      currentIndent = indentLevel
    }
    
    const indentedLine = indent.repeat(currentIndent) + trimmed
    
    // Handle opening braces / 处理左大括号
    if (trimmed.endsWith('{')) {
      indentLevel++
    }
    
    return indentedLine
  }).join('\n')
}

// Validate JavaScript syntax / 验证JavaScript语法
const validateSyntax = (code) => {
  try {
    new Function(code)
    return { valid: true, error: null }
  } catch (error) {
    return { valid: false, error: error.message }
  }
}

// Formatting presets / 格式化预设
const presets = {
  standard: { indentSize: 2, semicolon: true, singleQuote: true, bracketSpacing: true },
  compact: { indentSize: 2, semicolon: true, singleQuote: true, bracketSpacing: false },
  expanded: { indentSize: 4, semicolon: true, singleQuote: false, bracketSpacing: true }
}

defineExpose({
  formatJavaScript,
  validateSyntax,
  presets
})
</script>