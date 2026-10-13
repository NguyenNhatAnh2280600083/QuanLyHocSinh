const express = require('express')
const pool = require('../config/db')
const router = express.Router()

const PASSWORD_MAP = {
  admin: 'admin123',
  nguyenmai: 'teacher123',
  tranbinh: 'teacher123',
  lehoa: 'teacher123',
  
}

function getDefaultPassword(username) {
  if (PASSWORD_MAP[username]) return PASSWORD_MAP[username]
  if (username.startsWith('hs')) return 'student123'
  return '123456'
}

router.post('/auth/login', async (req, res) => {
  const { username, password } = req.body
  if (!username || !password) {
    return res.status(400).json({ error: 'Vui lòng nhập tên đăng nhập và mật khẩu' })
  }

  const [rows] = await pool.query('SELECT * FROM user_accounts WHERE username = ?', [username])
  if (rows.length === 0) {
    return res.status(401).json({ error: 'Tên đăng nhập không tồn tại' })
  }

  const user = rows[0]
  const expectedPassword = getDefaultPassword(username)
  if (password !== expectedPassword) {
    return res.status(401).json({ error: 'Mật khẩu không đúng' })
  }

  if (user.status !== 'ACTIVE') {
    return res.status(403).json({ error: 'Tài khoản đã bị khóa' })
  }

  await pool.query("UPDATE user_accounts SET last_login = ? WHERE id = ?", [new Date().toISOString().slice(0, 16).replace('T', ' '), user.id])

  res.json({
    user: {
      id: user.id,
      username: user.username,
      fullName: user.full_name,
      email: user.email,
      role: user.role,
      status: user.status,
      avatarColor: user.avatar_color,
      teacherId: user.teacher_id,
      studentId: user.student_id,
    },
    permissions: getPermissions(user.role),
  })
})

function getPermissions(role) {
  const all = ['students', 'teachers', 'classes', 'scores', 'attendance', 'rewards', 'reports', 'accounts', 'settings']
  switch (role) {
    case 'ADMIN':
      return all
    case 'TEACHER':
      return ['students', 'scores', 'attendance', 'reports']
    case 'STUDENT':
      return ['scores', 'attendance', 'rewards', 'reports']
    case 'PARENT':
      return ['students', 'scores', 'attendance', 'reports']
    default:
      return []
  }
}

module.exports = router
