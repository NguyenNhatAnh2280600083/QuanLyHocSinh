const mysql = require('mysql2/promise')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '.env') })

async function setup() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  })

  const schemaPath = path.join(__dirname, 'sql', 'schema.sql')
  const schema = fs.readFileSync(schemaPath, 'utf8')

  await conn.query(schema)
  console.log('✅ Đã tạo database và tất cả các bảng thành công!')
  await conn.end()
  process.exit(0)
}

setup().catch((err) => {
  console.error('❌ Lỗi khi setup database:', err.message)
  process.exit(1)
})
