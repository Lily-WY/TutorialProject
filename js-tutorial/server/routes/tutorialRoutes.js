const express = require('express');
const router = express.Router();
const db = require('../db');

// 获取内容
router.get('/:path', async (req, res) => {
  const { path } = req.params;
  try {
    const [rows] = await db.execute(
      'SELECT content FROM tutorial_contents WHERE path = ?',
      [path]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: '未找到内容' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('查询错误:', err);
    res.status(500).json({ 
      message: '查询失败',
      error: err.message 
    });
  }
});

// 插入内容
router.post('/', async (req, res) => {
  const { path, content } = req.body;
  if (!path || !content) {
    return res.status(400).json({ message: 'path 和 content 不能为空' });
  }

  try {
    const [result] = await db.execute(
      'INSERT INTO tutorial_contents (path, content) VALUES (?, ?)',
      [path, content]
    );
    res.json({ 
      success: true, 
      id: result.insertId 
    });
  } catch (err) {
    console.error('插入错误:', err);
    res.status(500).json({ 
      message: '插入失败',
      error: err.message 
    });
  }
});

module.exports = router;
