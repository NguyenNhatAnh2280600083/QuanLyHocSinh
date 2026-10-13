import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Users,
  UserCog,
  GraduationCap,
  BookOpen,
  CalendarCheck,
  Award,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { api } from '@/services/api'
import { StatCard } from '@/components/common/StatCard'
import { ChartCard } from '@/components/common/ChartCard'
import { PageHeader, LoadingState } from '@/components/common/StateComponents'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { classifyRank, ACADEMIC_RANK_LABELS } from '@/utils/constants'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

export default function DashboardPage() {
  const { data: students, isLoading: sLoading } = useQuery({ queryKey: ['students'], queryFn: api.getStudents })
  const { data: teachers } = useQuery({ queryKey: ['teachers'], queryFn: api.getTeachers })
  const { data: classRooms } = useQuery({ queryKey: ['classRooms'], queryFn: api.getClassRooms })
  const { data: grades } = useQuery({ queryKey: ['grades'], queryFn: api.getGrades })
  const { data: scores } = useQuery({ queryKey: ['scores'], queryFn: api.getScores })
  const { data: attendances } = useQuery({ queryKey: ['attendances'], queryFn: api.getAttendances })
  const { data: studentClasses } = useQuery({ queryKey: ['studentClasses'], queryFn: api.getStudentClasses })
  const { data: schoolYears } = useQuery({ queryKey: ['schoolYears'], queryFn: api.getSchoolYears })
  const { data: semesters } = useQuery({ queryKey: ['semesters'], queryFn: api.getSemesters })
  const { data: notifications } = useQuery({ queryKey: ['notifications'], queryFn: api.getNotifications })

  const [schoolYearId, setSchoolYearId] = useState('sy-2024-2025')
  const [semesterId, setSemesterId] = useState('sem-1-2425')

  const stats = useMemo(() => {
    if (!students || !teachers || !classRooms || !studentClasses) {
      return { totalStudents: 0, activeStudents: 0, totalTeachers: 0, totalClasses: 0 }
    }
    const activeSy = studentClasses.filter((sc) => sc.schoolYearId === schoolYearId)
    return {
      totalStudents: students.length,
      activeStudents: new Set(activeSy.map((sc) => sc.studentId)).size,
      totalTeachers: teachers.filter((t) => t.status === 'ACTIVE').length,
      totalClasses: classRooms.filter((c) => c.schoolYearId === schoolYearId).length,
    }
  }, [students, teachers, classRooms, studentClasses, schoolYearId])

  const distributionByGrade = useMemo(() => {
    if (!grades || !classRooms || !studentClasses) return []
    return grades.map((g) => {
      const classesInGrade = classRooms.filter((c) => c.gradeId === g.id && c.schoolYearId === schoolYearId)
      const classIds = classesInGrade.map((c) => c.id)
      const count = new Set(
        studentClasses.filter((sc) => classIds.includes(sc.classId)).map((sc) => sc.studentId)
      ).size
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
    const counts: Record<string, number> = { XUAT_SAC: 0, GIOI: 0, KHA: 0, TRUNG_BINH: 0, YEU: 0 }
    studentAvgs.forEach((vals) => {
      const avg = vals.reduce((a, b) => a + b, 0) / vals.length
      counts[classifyRank(avg).key]++
    })
    return Object.entries(counts).map(([key, value]) => ({
      name: ACADEMIC_RANK_LABELS[key],
      value,
    }))
  }, [scores, semesterId])

  const attendanceStats = useMemo(() => {
    if (!attendances?.length) return { coMat: 0, vang: 0, total: 0 }

    const uniqueStudents = new Set(attendances.map((a) => a.studentId))
    const presentStudents = new Set(
      attendances.filter((a) => a.status === 'CO_MAT').map((a) => a.studentId)
    )

    const total = uniqueStudents.size
    const coMat = presentStudents.size

    return { coMat, vang: Math.max(total - coMat, 0), total }
  }, [attendances])

  const notificationCards = useMemo(() => {
    if (!notifications?.length) return []
    return notifications.slice(0, 4).map((n) => ({
      ...n,
      icon: n.type === 'success' ? Award : n.type === 'warning' ? CalendarCheck : BookOpen,
      color:
        n.type === 'success' ? 'text-success' : n.type === 'warning' ? 'text-warning' : 'text-accent',
    }))
  }, [notifications])

  if (sLoading) return <LoadingState label="Đang tải dữ liệu..." />

  return (
    <div>
      <PageHeader
        title="Tổng quan"
        description="Thông tin tổng quan về tình hình học tập và hoạt động của nhà trường"
        actions={
          <div className="flex gap-2">
            <Select value={schoolYearId} onValueChange={setSchoolYearId}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Năm học" />
              </SelectTrigger>
              <SelectContent>
                {schoolYears?.map((sy) => (
                  <SelectItem key={sy.id} value={sy.id}>{sy.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={semesterId} onValueChange={setSemesterId}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Học kỳ" />
              </SelectTrigger>
              <SelectContent>
                {semesters?.filter((s) => s.schoolYearId === schoolYearId).map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Tổng số học sinh" value={stats.totalStudents} icon={Users} change={5.2} changeLabel="so với năm trước" />
        <StatCard title="Học sinh đang theo học" value={stats.activeStudents} icon={BookOpen} change={3.1} changeLabel="trong năm học" iconClassName="bg-accent/10 text-accent" />
        <StatCard title="Tổng số giáo viên" value={stats.totalTeachers} icon={UserCog} change={0} changeLabel="đang công tác" iconClassName="bg-success/10 text-success" />
        <StatCard title="Tổng số lớp học" value={stats.totalClasses} icon={GraduationCap} change={0} changeLabel="lớp đang hoạt động" iconClassName="bg-warning/10 text-warning" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <ChartCard title="Phân bố học sinh theo khối lớp" description="Số lượng học sinh theo từng khối" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={distributionByGrade} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 13 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 13 }} />
              <Tooltip />
              <Bar dataKey="số_lượng" fill="#1e3a5f" radius={[6, 6, 0, 0]} maxBarSize={60} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Phân bố học lực" description="Theo học kỳ đã chọn">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={rankDistribution}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
                labelLine={false}
              >
                {rankDistribution.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Thông báo & Hoạt động gần đây</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {notificationCards.length ? (
              notificationCards.map((a) => {
                const Icon = a.icon
                return (
                  <div key={a.id} className="flex items-start gap-3 rounded-lg border p-3 hover:bg-muted/50">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted ${a.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{a.title}</p>
                      <p className="text-xs text-muted-foreground">{a.message}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{a.time}</span>
                  </div>
                )
              })
            ) : (
              <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                Chưa có thông báo nào trong dữ liệu seed.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Thống kê chuyên cần</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-success/10 p-4">
              <div>
                <p className="text-sm text-muted-foreground">Có mặt</p>
                <p className="text-2xl font-bold text-success">{attendanceStats.coMat}</p>
              </div>
              <CalendarCheck className="h-8 w-8 text-success" />
            </div>
            <div className="flex items-center justify-between rounded-lg bg-destructive/10 p-4">
              <div>
                <p className="text-sm text-muted-foreground">Vắng mặt</p>
                <p className="text-2xl font-bold text-destructive">{attendanceStats.vang}</p>
              </div>
              <Users className="h-8 w-8 text-destructive" />
            </div>
            <div className="rounded-lg border p-4">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Tỷ lệ có mặt</span>
                <span className="font-semibold">
                  {attendanceStats.total ? Math.round((attendanceStats.coMat / attendanceStats.total) * 100) : 0}%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-success"
                  style={{ width: `${attendanceStats.total ? (attendanceStats.coMat / attendanceStats.total) * 100 : 0}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
