import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from 'recharts'
import { Download, Users, Award, CalendarCheck, TrendingUp } from 'lucide-react'
import { api } from '@/services/api'
import { PageHeader } from '@/components/common/StateComponents'
import { FilterPanel, FilterField } from '@/components/common/FilterPanel'
import { ChartCard } from '@/components/common/ChartCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useToast } from '@/components/ui/toast'
import { classifyRank } from '@/utils/constants'

const COLORS = ['#1e3a5f', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
const SCORE_WEIGHTS = { TX: 1, GK: 3, CK: 5 } as const

export default function ReportsPage() {
  const { data: students } = useQuery({ queryKey: ['students'], queryFn: api.getStudents })
  const { data: classRooms } = useQuery({ queryKey: ['classRooms'], queryFn: api.getClassRooms })
  const { data: grades } = useQuery({ queryKey: ['grades'], queryFn: api.getGrades })
  const { data: subjects } = useQuery({ queryKey: ['subjects'], queryFn: api.getSubjects })
  const { data: scores } = useQuery({ queryKey: ['scores'], queryFn: api.getScores })
  const { data: attendances } = useQuery({ queryKey: ['attendances'], queryFn: api.getAttendances })
  const { data: classSessions } = useQuery({ queryKey: ['classSessions'], queryFn: api.getClassSessions })
  const { data: rewardDisciplines } = useQuery({ queryKey: ['rewardDisciplines'], queryFn: api.getRewardDisciplines })
  const { data: studentClasses } = useQuery({ queryKey: ['studentClasses'], queryFn: api.getStudentClasses })
  const { data: schoolYears } = useQuery({ queryKey: ['schoolYears'], queryFn: api.getSchoolYears })
  const { data: semesters } = useQuery({ queryKey: ['semesters'], queryFn: api.getSemesters })
  const { toast } = useToast()

  const [schoolYearId, setSchoolYearId] = useState('sy-2024-2025')
  const [semesterId, setSemesterId] = useState('sem-1-2425')

  const selectedSchoolYear = schoolYears?.find((schoolYear) => schoolYear.id === schoolYearId)
  const selectedSemester = semesters?.find((semester) => semester.id === semesterId)
  const periodStart = selectedSemester?.startDate ?? selectedSchoolYear?.startDate
  const periodEnd = selectedSemester?.endDate ?? selectedSchoolYear?.endDate

  const studentsByClass = useMemo(() => {
    if (!classRooms || !studentClasses) return []
    return classRooms
      .filter((c) => c.schoolYearId === schoolYearId)
      .map((c) => {
        const count = studentClasses.filter((sc) => sc.classId === c.id && sc.schoolYearId === schoolYearId).length
        return { name: c.name, số_lượng: count }
      })
  }, [classRooms, studentClasses, schoolYearId])

  const studentsByGrade = useMemo(() => {
    if (!grades || !classRooms || !studentClasses) return []
    return grades.map((g) => {
      const classes = classRooms.filter((c) => c.gradeId === g.id && c.schoolYearId === schoolYearId)
      const classIds = classes.map((c) => c.id)
      const count = studentClasses.filter((sc) => classIds.includes(sc.classId) && sc.schoolYearId === schoolYearId).length
      return { name: g.name, số_lượng: count }
    })
  }, [grades, classRooms, studentClasses, schoolYearId])

  const reportRows = useMemo(() => {
    if (!students || !classRooms || !grades || !subjects || !scores || !attendances || !classSessions ||
      !rewardDisciplines || !studentClasses) return []

    const enrollments = studentClasses
      .filter((studentClass) => studentClass.schoolYearId === schoolYearId)
      .flatMap((studentClass) => {
        const student = students.find((item) => item.id === studentClass.studentId)
        const classRoom = classRooms.find((item) => item.id === studentClass.classId && item.schoolYearId === schoolYearId)
        const grade = classRoom && grades.find((item) => item.id === classRoom.gradeId)
        return student && classRoom && grade ? [{ studentClass, student, classRoom, grade }] : []
      })
    const enrolledStudentIds = new Set(enrollments.map(({ student }) => student.id))
    const enrolledClassIds = new Set(enrollments.map(({ classRoom }) => classRoom.id))
    const sessionIds = new Set(classSessions
      .filter((session) =>
        enrolledClassIds.has(session.classId) &&
        isDateInRange(session.date, periodStart, periodEnd)
      )
      .map((session) => session.id))

    const attendanceByStudent = new Map<string, { present: number; absentExcused: number; absentUnexcused: number; late: number }>()
    attendances
      .filter((attendance) => sessionIds.has(attendance.sessionId) && enrolledStudentIds.has(attendance.studentId))
      .forEach((attendance) => {
        const stats = attendanceByStudent.get(attendance.studentId) ?? {
          present: 0,
          absentExcused: 0,
          absentUnexcused: 0,
          late: 0,
        }
        if (attendance.status === 'CO_MAT') stats.present += 1
        if (attendance.status === 'VANG_PHEP') stats.absentExcused += 1
        if (attendance.status === 'VANG_KHONG_PHEP') stats.absentUnexcused += 1
        if (attendance.status === 'DI_MUON') stats.late += 1
        attendanceByStudent.set(attendance.studentId, stats)
      })

    const rewardsByStudent = new Map<string, { reward: number; discipline: number }>()
    rewardDisciplines
      .filter((record) =>
        enrolledStudentIds.has(record.studentId) &&
        isDateInRange(record.date, periodStart, periodEnd)
      )
      .forEach((record) => {
        const stats = rewardsByStudent.get(record.studentId) ?? { reward: 0, discipline: 0 }
        if (record.type === 'REWARD') stats.reward += 1
        else stats.discipline += 1
        rewardsByStudent.set(record.studentId, stats)
      })

    return enrollments.map(({ studentClass, student, classRoom, grade }) => {
      const studentScores = scores.filter((score) =>
        score.studentId === student.id &&
        score.classId === classRoom.id &&
        score.schoolYearId === schoolYearId &&
        score.semesterId === semesterId
      )
      const scoresBySubject = new Map<string, typeof studentScores>()
      studentScores.forEach((score) => {
        const subjectScores = scoresBySubject.get(score.subjectId) ?? []
        subjectScores.push(score)
        scoresBySubject.set(score.subjectId, subjectScores)
      })
      const subjectAverages = [...scoresBySubject.entries()].map(([subjectId, subjectScores]) => {
        const txScores = subjectScores.filter((score) => score.scoreType === 'TX')
        const txAverage = txScores.length
          ? txScores.reduce((sum, score) => sum + score.value, 0) / txScores.length
          : 0
        const gkScore = subjectScores.find((score) => score.scoreType === 'GK')?.value ?? 0
        const ckScore = subjectScores.find((score) => score.scoreType === 'CK')?.value ?? 0
        const average = (
          txAverage * SCORE_WEIGHTS.TX +
          gkScore * SCORE_WEIGHTS.GK +
          ckScore * SCORE_WEIGHTS.CK
        ) / (SCORE_WEIGHTS.TX + SCORE_WEIGHTS.GK + SCORE_WEIGHTS.CK)
        return { subjectId, average }
      })
      const average = subjectAverages.length
        ? subjectAverages.reduce((sum, subject) => sum + subject.average, 0) / subjectAverages.length
        : null
      const attendance = attendanceByStudent.get(student.id) ?? {
        present: 0,
        absentExcused: 0,
        absentUnexcused: 0,
        late: 0,
      }
      const rewardStats = rewardsByStudent.get(student.id) ?? { reward: 0, discipline: 0 }
      const attendanceTotal = attendance.present + attendance.absentExcused + attendance.absentUnexcused + attendance.late

      return {
        rollNumber: studentClass.rollNumber,
        student,
        classRoom,
        grade,
        subjectAverages,
        average,
        rank: average === null ? '' : classifyRank(average).label,
        attendance,
        attendanceTotal,
        rewardCount: rewardStats.reward,
        disciplineCount: rewardStats.discipline,
      }
    }).sort((a, b) =>
      a.classRoom.name.localeCompare(b.classRoom.name) || a.rollNumber - b.rollNumber
    )
  }, [
    students, classRooms, grades, subjects, scores, attendances, classSessions, rewardDisciplines,
    studentClasses, schoolYearId, semesterId, periodStart, periodEnd,
  ])

  const rankDistribution = useMemo(() => {
    const labels = ['Xuất sắc', 'Giỏi', 'Khá', 'Trung bình', 'Yếu']
    const counts = new Map(labels.map((label) => [label, 0]))
    reportRows.forEach((row) => {
      if (row.rank) counts.set(row.rank, (counts.get(row.rank) ?? 0) + 1)
    })
    return labels.map((name) => ({ name, value: counts.get(name) ?? 0 }))
  }, [reportRows])

  const attendanceRate = useMemo(() => {
    const present = reportRows.reduce((sum, row) => sum + row.attendance.present, 0)
    const absent = reportRows.reduce((sum, row) => sum + row.attendance.absentExcused + row.attendance.absentUnexcused, 0)
    const late = reportRows.reduce((sum, row) => sum + row.attendance.late, 0)
    const total = present + absent + late
    return { rate: total ? Math.round((present / total) * 100) : 0, present, absent, late, total }
  }, [reportRows])

  const rewardStats = useMemo(() => ({
    reward: reportRows.reduce((sum, row) => sum + row.rewardCount, 0),
    discipline: reportRows.reduce((sum, row) => sum + row.disciplineCount, 0),
  }), [reportRows])

  const gradeSummary = useMemo(() => {
    if (!grades || !classRooms) return []
    return grades
      .filter((grade) => classRooms.some((classRoom) =>
        classRoom.gradeId === grade.id && classRoom.schoolYearId === schoolYearId
      ))
      .map((grade) => {
        const rows = reportRows.filter((row) => row.grade.id === grade.id)
        const scoredRows = rows.filter((row) => row.average !== null)
        const totalPresent = rows.reduce((sum, row) => sum + row.attendance.present, 0)
        const totalAttendance = rows.reduce((sum, row) => sum + row.attendanceTotal, 0)
        return {
          grade,
          classCount: classRooms.filter((classRoom) =>
            classRoom.gradeId === grade.id && classRoom.schoolYearId === schoolYearId
          ).length,
          studentCount: rows.length,
          average: scoredRows.length
            ? scoredRows.reduce((sum, row) => sum + (row.average ?? 0), 0) / scoredRows.length
            : null,
          attendanceRate: totalAttendance ? Math.round((totalPresent / totalAttendance) * 100) : null,
          rewardCount: rows.reduce((sum, row) => sum + row.rewardCount, 0),
        }
      })
  }, [grades, classRooms, reportRows, schoolYearId])

  const handleExportExcel = () => {
    if (!students || !classRooms || !grades || !subjects || !scores || !attendances || !classSessions ||
      !rewardDisciplines || !studentClasses) {
      toast({ type: 'error', title: 'Chưa thể xuất báo cáo', description: 'Dữ liệu báo cáo đang được tải hoặc không khả dụng.' })
      return
    }

    try {
      const scoredRows = reportRows.filter((row) => row.average !== null)
      const overallAverage = scoredRows.length
        ? scoredRows.reduce((sum, row) => sum + (row.average ?? 0), 0) / scoredRows.length
        : null
      const subjectNames = new Map(subjects.map((subject) => [subject.id, subject.name]))
      const worksheets: { name: string; rows: (string | number)[][] }[] = [
        {
          name: 'Tổng quan',
          rows: [
            ['BÁO CÁO TỔNG KẾT KẾT QUẢ HỌC SINH'],
            ['Năm học', selectedSchoolYear?.name ?? schoolYearId],
            ['Học kỳ', selectedSemester?.name ?? semesterId],
            ['Ngày xuất báo cáo', new Date().toLocaleString('vi-VN')],
            [],
            ['Chỉ tiêu', 'Giá trị'],
            ['Tổng số học sinh', reportRows.length],
            ['Học sinh có kết quả điểm', scoredRows.length],
            ['Điểm trung bình chung', overallAverage === null ? 'Chưa có dữ liệu' : Number(overallAverage.toFixed(2))],
            ['Tỷ lệ có mặt', `${attendanceRate.rate}%`],
            ['Lượt có mặt', attendanceRate.present],
            ['Lượt vắng có phép/không phép', attendanceRate.absent],
            ['Lượt đi muộn', attendanceRate.late],
            ['Khen thưởng', rewardStats.reward],
            ['Kỷ luật', rewardStats.discipline],
          ],
        },
        {
          name: 'Xếp loại',
          rows: [
            ['Xếp loại học lực', 'Số học sinh', 'Tỷ lệ (%)'],
            ...rankDistribution.map(({ name, value }) => [
              name,
              value,
              scoredRows.length ? Number(((value / scoredRows.length) * 100).toFixed(2)) : 0,
            ]),
          ],
        },
        {
          name: 'Tổng hợp theo khối',
          rows: [
            ['Khối lớp', 'Số lớp', 'Sĩ số', 'Điểm trung bình', 'Tỷ lệ chuyên cần (%)', 'Khen thưởng'],
            ...gradeSummary.map(({ grade, classCount, studentCount, average, attendanceRate: rate, rewardCount }) => [
              grade.name,
              classCount,
              studentCount,
              average === null ? '' : Number(average.toFixed(2)),
              rate ?? '',
              rewardCount,
            ]),
          ],
        },
        {
          name: 'Chi tiết học sinh',
          rows: [
            [
              'STT', 'Mã học sinh', 'Họ và tên', 'Lớp', 'Khối', 'Điểm trung bình', 'Xếp loại',
              'Số lượt điểm danh', 'Có mặt', 'Vắng có phép', 'Vắng không phép', 'Đi muộn', 'Khen thưởng', 'Kỷ luật',
            ],
            ...reportRows.map((row, index) => [
              index + 1,
              row.student.code,
              row.student.fullName,
              row.classRoom.name,
              row.grade.name,
              row.average === null ? '' : Number(row.average.toFixed(2)),
              row.rank || 'Chưa có điểm',
              row.attendanceTotal,
              row.attendance.present,
              row.attendance.absentExcused,
              row.attendance.absentUnexcused,
              row.attendance.late,
              row.rewardCount,
              row.disciplineCount,
            ]),
          ],
        },
        {
          name: 'Kết quả theo môn',
          rows: [
            ['Mã học sinh', 'Họ và tên', 'Lớp', 'Môn học', 'Điểm trung bình môn'],
            ...reportRows.flatMap((row) =>
              row.subjectAverages.map(({ subjectId, average }) => [
                row.student.code,
                row.student.fullName,
                row.classRoom.name,
                subjectNames.get(subjectId) ?? subjectId,
                Number(average.toFixed(2)),
              ])
            ),
          ],
        },
      ]

      const safeYear = (selectedSchoolYear?.name ?? schoolYearId).replace(/[<>:"/\\|?*]/g, '-').replace(/\s+/g, '-')
      const safeSemester = (selectedSemester?.name ?? semesterId).replace(/[<>:"/\\|?*]/g, '-').replace(/\s+/g, '-')
      downloadExcelXml(worksheets, `Bao-cao-ket-qua-hoc-sinh-${safeYear}-${safeSemester}.xml`)
      toast({ type: 'success', title: 'Xuất báo cáo thành công', description: 'Workbook Excel đã được tải xuống.' })
    } catch (error) {
      toast({
        type: 'error',
        title: 'Không thể xuất báo cáo',
        description: error instanceof Error ? error.message : 'Đã xảy ra lỗi không xác định.',
      })
    }
  }

  const scoreTrend = useMemo(() => {
    return [
      { tháng: 'Tháng 9', điểm_TB: 7.2 },
      { tháng: 'Tháng 10', điểm_TB: 7.5 },
      { tháng: 'Tháng 11', điểm_TB: 7.8 },
      { tháng: 'Tháng 12', điểm_TB: 7.6 },
      { tháng: 'Tháng 1', điểm_TB: 8.0 },
    ]
  }, [])

  return (
    <div>
      <PageHeader
        title="Báo cáo & Thống kê"
        description="Tổng hợp các báo cáo và số liệu thống kê của nhà trường"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportExcel}><Download className="h-4 w-4" /> Xuất Excel</Button>
            <Button variant="outline"><Download className="h-4 w-4" /> Xuất PDF</Button>
          </div>
        }
      />

      <FilterPanel className="mb-6">
        <FilterField label="Năm học" className="w-44">
          <Select
            value={schoolYearId}
            onValueChange={(value) => {
              setSchoolYearId(value)
              const firstSemester = semesters?.find((semester) => semester.schoolYearId === value)
              if (firstSemester) setSemesterId(firstSemester.id)
            }}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {schoolYears?.map((sy) => <SelectItem key={sy.id} value={sy.id}>{sy.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </FilterField>
        <FilterField label="Học kỳ" className="w-40">
          <Select value={semesterId} onValueChange={setSemesterId}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {semesters?.filter((s) => s.schoolYearId === schoolYearId).map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterField>
      </FilterPanel>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <ReportStat icon={Users} label="Tổng học sinh" value={reportRows.length} color="text-primary" bg="bg-primary/10" />
        <ReportStat icon={TrendingUp} label="Tỷ lệ chuyên cần" value={`${attendanceRate.rate}%`} color="text-success" bg="bg-success/10" />
        <ReportStat icon={Award} label="Khen thưởng" value={rewardStats.reward} color="text-warning" bg="bg-warning/10" />
        <ReportStat icon={CalendarCheck} label="Lượt vắng" value={attendanceRate.absent} color="text-destructive" bg="bg-destructive/10" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-6">
        <ChartCard title="Số lượng học sinh theo lớp" description="Phân bổ sĩ số các lớp trong năm học">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={studentsByClass} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-20} textAnchor="end" height={60} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="số_lượng" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={50} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Phân bố học lực học kỳ" description="Tỷ lệ xếp loại học lực theo học kỳ">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={rankDistribution}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {rankDistribution.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-6">
        <ChartCard title="Số lượng học sinh theo khối lớp" description="So sánh sĩ số giữa các khối">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={studentsByGrade} margin={{ top: 10, right: 10, left: -10, bottom: 0 }} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={80} />
              <Tooltip />
              <Bar dataKey="số_lượng" fill="#1e3a5f" radius={[0, 6, 6, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Xu hướng điểm trung bình" description="Chuyển động điểm TB theo tháng">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={scoreTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="tháng" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="điểm_TB" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tổng hợp kết quả theo khối lớp</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Khối lớp</TableHead>
                <TableHead className="text-center">Số lớp</TableHead>
                <TableHead className="text-center">Sĩ số</TableHead>
                <TableHead className="text-center">Điểm TB</TableHead>
                <TableHead className="text-center">Tỷ lệ chuyên cần</TableHead>
                <TableHead className="text-center">Khen thưởng</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {gradeSummary.map(({ grade, classCount, studentCount, average, attendanceRate: rate, rewardCount }) => {
                return (
                  <TableRow key={grade.id}>
                    <TableCell className="font-medium">{grade.name}</TableCell>
                    <TableCell className="text-center">{classCount}</TableCell>
                    <TableCell className="text-center">{studentCount}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">{average === null ? '—' : average.toFixed(1)}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="success">{rate === null ? '—' : `${rate}%`}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {rewardCount} quyết định
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function ReportStat({ icon: Icon, label, value, color, bg }: { icon: any; label: string; value: string | number; color: string; bg: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${bg} ${color}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function isDateInRange(value: string, start?: string, end?: string) {
  const date = value.slice(0, 10)
  return (!start || date >= start.slice(0, 10)) && (!end || date <= end.slice(0, 10))
}

function downloadExcelXml(
  worksheets: { name: string; rows: (string | number)[][] }[],
  filename: string
) {
  const escapeXml = (value: string) => value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
  const xmlRows = (rows: (string | number)[][]) => rows.map((row) =>
    `<Row>${row.map((value) => {
      if (value === '') return '<Cell/>'
      const type = typeof value === 'number' && Number.isFinite(value) ? 'Number' : 'String'
      return `<Cell><Data ss:Type="${type}">${escapeXml(String(value))}</Data></Cell>`
    }).join('')}</Row>`
  ).join('')
  const sheetsXml = worksheets.map(({ name, rows }) =>
    `<Worksheet ss:Name="${escapeXml(name)}"><Table>${xmlRows(rows)}</Table></Worksheet>`
  ).join('')
  const workbookXml = `<?xml version="1.0" encoding="UTF-8"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" xmlns:html="http://www.w3.org/TR/REC-html40">${sheetsXml}</Workbook>`
  const url = URL.createObjectURL(new Blob([`\uFEFF${workbookXml}`], { type: 'application/vnd.ms-excel;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
