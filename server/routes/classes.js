const express = require('express')
const pool = require('../config/db')
const router = express.Router()

router.get('/class-rooms', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM class_rooms ORDER BY code')
  res.json(rows.map((r) => ({
    id: r.id, name: r.name, code: r.code, gradeId: r.grade_id,
    schoolYearId: r.school_year_id, homeroomTeacherId: r.homeroom_teacher_id, maxStudents: r.max_students,
  })))
})

router.get('/student-classes', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM student_classes ORDER BY class_id, roll_number')
  res.json(rows.map((r) => ({
    id: r.id, studentId: r.student_id, classId: r.class_id,
    schoolYearId: r.school_year_id, rollNumber: r.roll_number,
  })))
})

router.post('/class-rooms', async (req, res) => {
  const { name, code, gradeId, schoolYearId, homeroomTeacherId, maxStudents } = req.body
  const id = `c-${(code || name || Date.now()).toString().toLowerCase().replace(/\s+/g, '-')}`
  await pool.query(
    'INSERT INTO class_rooms (id, name, code, grade_id, school_year_id, homeroom_teacher_id, max_students) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, name, code, gradeId, schoolYearId, homeroomTeacherId || null, maxStudents || 40]
  )
  res.status(201).json({ id, ...req.body })
})

router.put('/class-rooms/:id', async (req, res) => {
  const { name, code, gradeId, schoolYearId, homeroomTeacherId, maxStudents } = req.body
  await pool.query(
    'UPDATE class_rooms SET name = ?, code = ?, grade_id = ?, school_year_id = ?, homeroom_teacher_id = ?, max_students = ? WHERE id = ?',
    [name, code, gradeId, schoolYearId, homeroomTeacherId || null, maxStudents || 40, req.params.id]
  )
  res.json({ id: req.params.id, ...req.body })
})

router.delete('/class-rooms/:id', async (req, res) => {
  await pool.query('DELETE FROM class_rooms WHERE id = ?', [req.params.id])
  res.json({ message: 'Đã xóa lớp học' })
})

module.exports = router
