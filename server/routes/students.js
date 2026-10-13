const express = require('express')
const pool = require('../config/db')
const router = express.Router()

router.get('/students', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM students ORDER BY code')
  res.json(rows.map((r) => ({
    id: r.id, code: r.code, fullName: r.full_name, gender: r.gender,
    dateOfBirth: r.date_of_birth, placeOfBirth: r.place_of_birth, ethnicity: r.ethnicity,
    religion: r.religion, phone: r.phone, email: r.email, address: r.address,
    enrollmentDate: r.enrollment_date, status: r.status, avatarColor: r.avatar_color,
  })))
})

router.post('/students', async (req, res) => {
  const { code, fullName, gender, dateOfBirth, placeOfBirth, ethnicity, religion, phone, email, address, enrollmentDate, status, avatarColor } = req.body
  const id = code || `stu-${Date.now()}`
  await pool.query(
    'INSERT INTO students (id, code, full_name, gender, date_of_birth, place_of_birth, ethnicity, religion, phone, email, address, enrollment_date, status, avatar_color) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [id, code, fullName, gender, dateOfBirth, placeOfBirth, ethnicity, religion, phone, email, address, enrollmentDate, status || 'STUDYING', avatarColor || '#3b82f6']
  )
  res.status(201).json({ id, ...req.body })
})

router.put('/students/:id', async (req, res) => {
  const { fullName, gender, dateOfBirth, phone, email, address, status } = req.body
  await pool.query(
    'UPDATE students SET full_name = ?, gender = ?, date_of_birth = ?, phone = ?, email = ?, address = ?, status = ? WHERE id = ?',
    [fullName, gender, dateOfBirth, phone, email, address, status, req.params.id]
  )
  res.json({ id: req.params.id, ...req.body })
})

router.delete('/students/:id', async (req, res) => {
  await pool.query('DELETE FROM students WHERE id = ?', [req.params.id])
  res.json({ message: 'Đã xóa' })
})

module.exports = router
