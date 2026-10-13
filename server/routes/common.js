const express = require('express')
const pool = require('../config/db')
const router = express.Router()

router.get('/school-years', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM school_years ORDER BY start_date DESC')
  res.json(rows.map((r) => ({ id: r.id, name: r.name, startDate: r.start_date, endDate: r.end_date, isActive: !!r.is_active })))
})

router.get('/semesters', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM semesters ORDER BY start_date')
  res.json(rows.map((r) => ({ id: r.id, name: r.name, code: r.code, schoolYearId: r.school_year_id, startDate: r.start_date, endDate: r.end_date })))
})

router.get('/grades', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM grades ORDER BY level')
  res.json(rows.map((r) => ({ id: r.id, name: r.name, code: r.code, level: r.level })))
})

router.get('/subjects', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM subjects ORDER BY code, grade_id')
  res.json(rows.map((r) => ({ id: r.id, name: r.name, code: r.code, gradeId: r.grade_id, isElective: !!r.is_elective, description: r.description })))
})

router.post('/subjects', async (req, res) => {
  const { id, name, code, gradeId, isElective, description } = req.body
  const subjectId = id || `${(code || name || 'subject').toString().toUpperCase()}-${Date.now()}`
  await pool.query(
    'INSERT INTO subjects (id, name, code, grade_id, is_elective, description) VALUES (?, ?, ?, ?, ?, ?)',
    [subjectId, name, code, gradeId, isElective ? 1 : 0, description || null]
  )
  res.status(201).json({ id: subjectId, ...req.body })
})

router.put('/subjects/:id', async (req, res) => {
  const { name, code, gradeId, isElective, description } = req.body
  await pool.query(
    'UPDATE subjects SET name = ?, code = ?, grade_id = ?, is_elective = ?, description = ? WHERE id = ?',
    [name, code, gradeId, isElective ? 1 : 0, description || null, req.params.id]
  )
  res.json({ id: req.params.id, ...req.body })
})

router.delete('/subjects/:id', async (req, res) => {
  await pool.query('DELETE FROM subjects WHERE id = ?', [req.params.id])
  res.json({ message: 'Đã xóa môn học' })
})

router.get('/parents', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM parents')
  res.json(rows.map((r) => ({ id: r.id, fullName: r.full_name, gender: r.gender, phone: r.phone, email: r.email, address: r.address, occupation: r.occupation, studentId: r.student_id, relation: r.relation })))
})

router.get('/teaching-assignments', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM teaching_assignments')
  res.json(rows.map((r) => ({ id: r.id, teacherId: r.teacher_id, subjectId: r.subject_id, classId: r.class_id, semesterId: r.semester_id, schoolYearId: r.school_year_id })))
})

router.post('/teaching-assignments', async (req, res) => {
  const { teacherId, subjectId, classId, semesterId, schoolYearId } = req.body
  const id = `ta-${Date.now()}`
  await pool.query(
    'INSERT INTO teaching_assignments (id, teacher_id, subject_id, class_id, semester_id, school_year_id) VALUES (?, ?, ?, ?, ?, ?)',
    [id, teacherId, subjectId, classId, semesterId, schoolYearId]
  )
  res.status(201).json({ id, ...req.body })
})

router.put('/teaching-assignments/:id', async (req, res) => {
  const { teacherId, subjectId, classId, semesterId, schoolYearId } = req.body
  await pool.query(
    'UPDATE teaching_assignments SET teacher_id = ?, subject_id = ?, class_id = ?, semester_id = ?, school_year_id = ? WHERE id = ?',
    [teacherId, subjectId, classId, semesterId, schoolYearId, req.params.id]
  )
  res.json({ id: req.params.id, ...req.body })
})

router.delete('/teaching-assignments/:id', async (req, res) => {
  await pool.query('DELETE FROM teaching_assignments WHERE id = ?', [req.params.id])
  res.json({ message: 'Đã xóa phân công' })
})

router.get('/class-sessions', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM class_sessions ORDER BY date, period')
  res.json(rows.map((r) => ({ id: r.id, classId: r.class_id, date: r.date, period: r.period, subjectId: r.subject_id, teacherId: r.teacher_id, note: r.note })))
})

router.get('/assessments', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM assessments')
  res.json(rows.map((r) => ({ id: r.id, name: r.name, subjectId: r.subject_id, classId: r.class_id, semesterId: r.semester_id, scoreType: r.score_type, coefficient: r.coefficient, schoolYearId: r.school_year_id })))
})

router.get('/notifications', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM notifications')
  res.json(rows.map((r) => ({ id: r.id, title: r.title, message: r.message, time: r.time, type: r.type })))
})

module.exports = router
