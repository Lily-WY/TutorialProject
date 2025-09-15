const express = require('express')
const router = express.Router()
const db = require('../db')

/**
 * 获取教程内容 API
 * Get tutorial content API
 * GET /:path - 根据路径获取教程内容
 */
router.get('/:path', async (req, res) => {
  const { path } = req.params

  try {
    const [rows] = await db.execute(
      'SELECT content FROM tutorial_contents WHERE path = ?',
      [path]
    )

    if (rows.length === 0) {
      return res.status(404).json({ message: '未找到内容' })
    }

    res.json(rows[0])
  } catch (err) {
    console.error('数据库查询错误 / Database query error:', err)
    res.status(500).json({ message: '查询失败' })
  }
})

/**
 * 创建或更新教程内容 API
 * Create or update tutorial content API
 * POST / - 创建新内容或更新现有内容
 */
router.post('/', async (req, res) => {
  const { path, content } = req.body

  if (!path || !content) {
    return res.status(400).json({ message: 'path 和 content 不能为空' })
  }

  try {
    const [result] = await db.execute(
      'REPLACE INTO tutorial_contents (path, content) VALUES (?, ?)',
      [path, content]
    )

    const message = result.insertId ? '内容已创建' : '内容已更新'
    res.json({ message })
  } catch (err) {
    console.error('数据库操作错误 / Database operation error:', err)
    res.status(500).json({
      message: '操作失败',
      error: err.message
    })
  }
})

module.exports = router
