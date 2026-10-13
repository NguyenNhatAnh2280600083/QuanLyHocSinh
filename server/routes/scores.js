const express = require('express')
const pool = require('../config/db')
const router = express.Router()

router.get('/scores', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM scores')
  res.json(rows.map((r) => ({
    id: r.id, studentId: r.student_id, assessmentId: r.assessment_id, subjectId: r.subject_id,
    classId: r.class_id, semesterId: r.semester_id, schoolYearId: r.school_year_id,
    scoreType: r.score_type, value: parseFloat(r.value), coefficient: r.coefficient,
    comment: r.comment, isLocked: !!r.is_locked,
  })))
})

router.post('/scores', async (req, res) => {
  const { studentId, assessmentId, subjectId, classId, semesterId, schoolYearId, scoreType, value, coefficient, comment } = req.body
  const id = `sc-${Date.now()}`
  await pool.query(
    'INSERT INTO scores (id, student_id, assessment_id, subject_id, class_id, semester_id, school_year_id, score_type, value, coefficient, comment, is_locked) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [id, studentId, assessmentId, subjectId, classId, semesterId, schoolYearId, scoreType, value, coefficient || 1, comment || null, 1]
  )
  res.status(201).json({ id, ...req.body })
})

router.put('/scores/:id', async (req, res) => {
  const { value, isLocked } = req.body
  await pool.query('UPDATE scores SET value = ?, is_locked = ? WHERE id = ?', [value, isLocked ? 1 : 0, req.params.id])
  res.json({ id: req.params.id, ...req.body })
})

module.exports = router
