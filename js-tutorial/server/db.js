const mysql = require('mysql2/promise');

// 创建连接池
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'js_tutorial',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 测试连接
pool.getConnection()
  .then(conn => {
    console.log('✅ 成功连接到 MySQL 数据库');
    conn.release(); // 释放连接回连接池
  })
  .catch(err => {
    console.error('数据库连接失败:', err);
  });

module.exports = pool;