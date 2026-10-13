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
import { classifyRank } from '@/utils/constants'

const COLORS = ['#1e3a5f', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function ReportsPage() {
  const { data: students } = useQuery({ queryKey: ['students'], queryFn: api.getStudents })
  const { data: classRooms } = useQuery({ queryKey: ['classRooms'], queryFn: api.getClassRooms })
  const { data: grades } = useQuery({ queryKey: ['grades'], queryFn: api.getGrades })
  const { data: scores } = useQuery({ queryKey: ['scores'], queryFn: api.getScores })
  const { data: attendances } = useQuery({ queryKey: ['attendances'], queryFn: api.getAttendances })
  const { data: rewardDisciplines } = useQuery({ queryKey: ['rewardDisciplines'], queryFn: api.getRewardDisciplines })
  const { data: studentClasses } = useQuery({ queryKey: ['studentClasses'], queryFn: api.getStudentClasses })
  const { data: schoolYears } = useQuery({ queryKey: ['schoolYears'], queryFn: api.getSchoolYears })
  const { data: semesters } = useQuery({ queryKey: ['semesters'], queryFn: api.getSemesters })

  const [schoolYearId, setSchoolYearId] = useState('sy-2024-2025')
  const [semesterId, setSemesterId] = useState('sem-1-2425')

  const studentsByClass = useMemo(() => {
    if (!classRooms || !studentClasses) return []
    return classRooms
      .filter((c) => c.schoolYearId === schoolYearId)
      .map((c) => {
        const count = studentClasses.filter((sc) => sc.classId === c.id).length
        return { name: c.name, số_lượng: count }
      })
  }, [classRooms, studentClasses, schoolYearId])

  const studentsByGrade = useMemo(() => {
    if (!grades || !classRooms || !studentClasses) return []
    return grades.map((g) => {
      const classes = classRooms.filter((c) => c.gradeId === g.id && c.schoolYearId === schoolYearId)
      const classIds = classes.map((c) => c.id)
      const count = studentClasses.filter((sc) => classIds.includes(sc.classId)).length
      return { name: g.name, số_lượng: count }
    })
  }, [grades, classRooms, studentClasses, schoolYearId])

  const rankDistribution = useMemo(() => {
    if (!scores) return []
    const semScores = scores.filter((s) => s.semesterId === semesterId)
    const studentAvgs = new Map<string, number[]>()
    semScores.forEach((s) => {
      const arr = studentAvgs.get(s.studentId) ?? []
      arr.push(s.value)
      studentAvgs.set(s.studentId, arr)
    })
    const counts: Record<string, number> = { 'Xuất sắc': 0, 'Giỏi': 0, 'Khá': 0, 'Trung bình': 0, 'Yếu': 0 }
    studentAvgs.forEach((vals) => {
      const avg = vals.reduce((a, b) => a + b, 0) / vals.length
      const label = classifyRank(avg).label
      counts[label] = (counts[label] ?? 0) + 1
    })
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [scores, semesterId])

  const attendanceRate = useMemo(() => {
    if (!attendances) return { rate: 0, coMat: 0, vang: 0 }
    const coMat = attendances.filter((a) => a.status === 'CO_MAT').length
    const total = attendances.length
    return { rate: total ? Math.round((coMat / total) * 100) : 0, coMat, vang: total - coMat }
  }, [attendances])

  const rewardStats = useMemo(() => ({
    reward: rewardDisciplines?.filter((r) => r.type === 'REWARD').length ?? 0,
    discipline: rewardDisciplines?.filter((r) => r.type === 'DISCIPLINE').length ?? 0,
  }), [rewardDisciplines])

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
            <Button variant="outline"><Download className="h-4 w-4" /> Xuất Excel</Button>
            <Button variant="outline"><Download className="h-4 w-4" /> Xuất PDF</Button>
          </div>
        }
      />

      <FilterPanel className="mb-6">
        <FilterField label="Năm học" className="w-44">
          <Select value={schoolYearId} onValueChange={setSchoolYearId}>
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
        <ReportStat icon={Users} label="Tổng học sinh" value={students?.length ?? 0} color="text-primary" bg="bg-primary/10" />
        <ReportStat icon={TrendingUp} label="Tỷ lệ chuyên cần" value={`${attendanceRate.rate}%`} color="text-success" bg="bg-success/10" />
        <ReportStat icon={Award} label="Khen thưởng" value={rewardStats.reward} color="text-warning" bg="bg-warning/10" />
        <ReportStat icon={CalendarCheck} label="Vắng mặt" value={attendanceRate.vang} color="text-destructive" bg="bg-destructive/10" />
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
              {grades?.map((g) => {
                const classes = classRooms?.filter((c) => c.gradeId === g.id && c.schoolYearId === schoolYearId) ?? []
                const classIds = classes.map((c) => c.id)
                const count = studentClasses?.filter((sc) => classIds.includes(sc.classId)).length ?? 0
                const seed = g.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
                const avgScore = 7 + ((seed % 20) / 10)
                const attendanceRate = 90 + (seed % 8)
                const rewardCount = 2 + (seed % 6)
                return (
                  <TableRow key={g.id}>
                    <TableCell className="font-medium">{g.name}</TableCell>
                    <TableCell className="text-center">{classes.length}</TableCell>
                    <TableCell className="text-center">{count}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">{avgScore.toFixed(1)}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="success">{attendanceRate}%</Badge>
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
