const express = require('express')
const pool = require('../config/db')
const router = express.Router()

async function resolveRoleId(roleNameOrId) {
  if (!roleNameOrId) return null

  const [rows] = await pool.query(
    'SELECT id, name FROM roles WHERE id = ? OR name = ? LIMIT 1',
    [roleNameOrId, roleNameOrId]
  )

  return rows[0]?.id || null
}

router.get('/roles', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM roles ORDER BY label')
  res.json(rows.map((row) => ({
    id: row.id,
    name: row.name,
    label: row.label,
    description: row.description,
    permissions: typeof row.permissions === 'string' ? JSON.parse(row.permissions) : (row.permissions || []),
  })))
})

router.get('/user-accounts', async (req, res) => {
  const [rows] = await pool.query(`
    SELECT ua.*, r.name AS role_name, r.label AS role_label, r.permissions AS role_permissions
    FROM user_accounts ua
    LEFT JOIN roles r ON r.id = ua.role_id
    ORDER BY ua.username
  `)

  res.json(rows.map((r) => ({
    id: r.id,
    username: r.username,
    fullName: r.full_name,
    email: r.email,
    role: r.role_name || r.role,
    roleId: r.role_id || null,
    roleLabel: r.role_label || r.role,
    status: r.status,
    lastLogin: r.last_login,
    avatarColor: r.avatar_color,
    teacherId: r.teacher_id,
    studentId: r.student_id,
    permissions: typeof r.role_permissions === 'string' ? JSON.parse(r.role_permissions) : (r.role_permissions || []),
  })))
})

router.post('/user-accounts', async (req, res) => {
  const { username, fullName, email, role, roleId, status, avatarColor, teacherId, studentId } = req.body
  const id = `u-${Date.now()}`
  const resolvedRole = role || 'STUDENT'
  const resolvedRoleId = roleId || await resolveRoleId(resolvedRole)

  await pool.query(
    'INSERT INTO user_accounts (id, username, full_name, email, role, role_id, status, last_login, avatar_color, teacher_id, student_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [id, username, fullName, email, resolvedRole, resolvedRoleId, status || 'ACTIVE', null, avatarColor || '#3b82f6', teacherId || null, studentId || null]
  )

  res.status(201).json({ id, username, fullName, email, role: resolvedRole, roleId: resolvedRoleId, status: status || 'ACTIVE' })
})

router.put('/user-accounts/:id', async (req, res) => {
  const { fullName, email, role, roleId, status } = req.body
  const resolvedRole = role || 'STUDENT'
  const resolvedRoleId = roleId || await resolveRoleId(resolvedRole)

  await pool.query(
    'UPDATE user_accounts SET full_name = ?, email = ?, role = ?, role_id = ?, status = ? WHERE id = ?',
    [fullName, email, resolvedRole, resolvedRoleId, status, req.params.id]
  )

  res.json({ id: req.params.id, fullName, email, role: resolvedRole, roleId: resolvedRoleId, status })
})

module.exports = router
