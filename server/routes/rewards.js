const express = require('express')
const pool = require('../config/db')
const router = express.Router()

router.get('/reward-disciplines', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM reward_disciplines ORDER BY date DESC')
  res.json(rows.map((r) => ({
    id: r.id, studentId: r.student_id, type: r.type, title: r.title,
    reason: r.reason, date: r.date, decisionNumber: r.decision_number,
  })))
})

router.post('/reward-disciplines', async (req, res) => {
  const { studentId, type, title, reason, date, decisionNumber } = req.body
  const id = `rd-${Date.now()}`
  await pool.query(
    'INSERT INTO reward_disciplines (id, student_id, type, title, reason, date, decision_number) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, studentId, type, title, reason || null, date, decisionNumber]
  )
  res.status(201).json({ id, ...req.body })
})

router.put('/reward-disciplines/:id', async (req, res) => {
  const { studentId, type, title, reason, date, decisionNumber } = req.body
  await pool.query(
    'UPDATE reward_disciplines SET student_id = ?, type = ?, title = ?, reason = ?, date = ?, decision_number = ? WHERE id = ?',
    [studentId, type, title, reason || null, date, decisionNumber, req.params.id]
  )
  res.json({ id: req.params.id, ...req.body })
})

router.delete('/reward-disciplines/:id', async (req, res) => {
  await pool.query('DELETE FROM reward_disciplines WHERE id = ?', [req.params.id])
  res.json({ message: 'Đã xóa quyết định' })
})

module.exports = router
