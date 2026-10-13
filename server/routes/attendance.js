const express = require('express')
const pool = require('../config/db')
const router = express.Router()

router.get('/attendances', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM attendances')
  res.json(rows.map((r) => ({
    id: r.id, sessionId: r.session_id, studentId: r.student_id, status: r.status, note: r.note,
  })))
})

router.post('/attendances', async (req, res) => {
  const records = Array.isArray(req.body) ? req.body : [req.body]
  for (const rec of records) {
    const { sessionId, studentId, status, note } = rec
    const id = `att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    await pool.query(
      'INSERT INTO attendances (id, session_id, student_id, status, note) VALUES (?, ?, ?, ?, ?)',
      [id, sessionId, studentId, status, note || null]
    )
  }
  res.status(201).json({ message: 'Đã lưu điểm danh' })
})

module.exports = router
