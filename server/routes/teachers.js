const express = require('express')
const pool = require('../config/db')
const router = express.Router()

function safeParseJsonArray(value) {
  if (!value) return []
  if (Array.isArray(value)) return value

  const raw = String(value).trim()
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return raw
      .replace(/^\[|\]$/g, '')
      .split(',')
      .map((item) => item.trim().replace(/^['"]|['"]$/g, ''))
      .filter(Boolean)
  }
}

router.get('/teachers', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM teachers ORDER BY code')
  res.json(rows.map((r) => ({
    id: r.id, code: r.code, fullName: r.full_name, gender: r.gender,
    dateOfBirth: r.date_of_birth, phone: r.phone, email: r.email, address: r.address,
    subjectIds: safeParseJsonArray(r.subject_ids), hireDate: r.hire_date, status: r.status,
  })))
})

router.post('/teachers', async (req, res) => {
  const { code, fullName, gender, dateOfBirth, phone, email, address, subjectIds, hireDate, status } = req.body
  const id = code || `tea-${Date.now()}`
  await pool.query(
    'INSERT INTO teachers (id, code, full_name, gender, date_of_birth, phone, email, address, subject_ids, hire_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [id, code, fullName, gender, dateOfBirth, phone, email, address, JSON.stringify(subjectIds || []), hireDate, status || 'ACTIVE']
  )
  res.status(201).json({ id, ...req.body })
})

router.put('/teachers/:id', async (req, res) => {
  const { code, fullName, gender, dateOfBirth, phone, email, address, subjectIds, hireDate, status } = req.body
  await pool.query(
    'UPDATE teachers SET code = ?, full_name = ?, gender = ?, date_of_birth = ?, phone = ?, email = ?, address = ?, subject_ids = ?, hire_date = ?, status = ? WHERE id = ?',
    [code, fullName, gender, dateOfBirth, phone, email, address, JSON.stringify(subjectIds || []), hireDate, status, req.params.id]
  )
  res.json({ id: req.params.id, ...req.body })
})

router.delete('/teachers/:id', async (req, res) => {
  await pool.query('DELETE FROM teachers WHERE id = ?', [req.params.id])
  res.json({ message: 'Đã xóa giáo viên' })
})

module.exports = router
