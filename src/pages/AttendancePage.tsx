import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Save, CheckCircle2, XCircle, Clock, AlertTriangle } from 'lucide-react'
import { api } from '@/services/api'
import { PageHeader, EmptyState } from '@/components/common/StateComponents'
import { FilterPanel, FilterField } from '@/components/common/FilterPanel'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useToast } from '@/components/ui/toast'
import { ATTENDANCE_LABELS, ATTENDANCE_STYLES } from '@/utils/constants'
import { formatDate, getInitials } from '@/utils/format'
import type { AttendanceStatus } from '@/types'

const STATUS_OPTIONS: { value: AttendanceStatus; label: string }[] = [
  { value: 'CO_MAT', label: 'Có mặt' },
  { value: 'VANG_PHEP', label: 'Vắng có phép' },
  { value: 'VANG_KHONG_PHEP', label: 'Vắng không phép' },
  { value: 'DI_MUON', label: 'Đi muộn' },
]

export default function AttendancePage() {
  const { data: students } = useQuery({ queryKey: ['students'], queryFn: api.getStudents })
  const { data: classRooms } = useQuery({ queryKey: ['classRooms'], queryFn: api.getClassRooms })
  const { data: studentClasses } = useQuery({ queryKey: ['studentClasses'], queryFn: api.getStudentClasses })
  const { data: classSessions } = useQuery({ queryKey: ['classSessions'], queryFn: api.getClassSessions })
  const { data: attendances } = useQuery({ queryKey: ['attendances'], queryFn: api.getAttendances })

  const { toast } = useToast()
  const [classId, setClassId] = useState('c-10a')
  const [sessionId, setSessionId] = useState('')
  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>({})
  const [locked, setLocked] = useState(true)

  const sessions = useMemo(() => {
    return classSessions?.filter((s) => s.classId === classId) ?? []
  }, [classSessions, classId])

  const classStudents = useMemo(() => {
    if (!students || !studentClasses) return []
    return studentClasses
      .filter((sc) => sc.classId === classId)
      .map((sc) => ({ ...sc, student: students.find((s) => s.id === sc.studentId)! }))
      .sort((a, b) => a.rollNumber - b.rollNumber)
  }, [students, studentClasses, classId])

  const existingAttendance = useMemo(() => {
    const map = new Map<string, AttendanceStatus>()
    attendances?.forEach((a) => {
      if (a.sessionId === sessionId) map.set(a.studentId, a.status)
    })
    return map
  }, [attendances, sessionId])

  const stats = useMemo(() => {
    const counts = { CO_MAT: 0, VANG_PHEP: 0, VANG_KHONG_PHEP: 0, DI_MUON: 0 }
    classStudents.forEach((sc) => {
      const st = statuses[sc.studentId] ?? existingAttendance.get(sc.studentId) ?? 'CO_MAT'
      counts[st]++
    })
    return counts
  }, [classStudents, statuses, existingAttendance])

  const getStatus = (studentId: string) => statuses[studentId] ?? existingAttendance.get(studentId) ?? 'CO_MAT'

  const setStatus = (studentId: string, status: AttendanceStatus) => {
    if (locked) return
    setStatuses((prev) => ({ ...prev, [studentId]: status }))
  }

  const setAll = (status: AttendanceStatus) => {
    if (locked) return
    const all: Record<string, AttendanceStatus> = {}
    classStudents.forEach((sc) => { all[sc.studentId] = status })
    setStatuses(all)
  }

  const handleSave = () => {
    toast({ type: 'success', title: 'Lưu điểm danh thành công', description: `Đã ghi nhận ${classStudents.length} học sinh` })
    setLocked(true)
  }

  return (
    <div>
      <PageHeader
        title="Quản lý điểm danh"
        description="Ghi nhận tình hình tham gia học tập của học sinh theo buổi học"
        actions={
          <div className="flex gap-2">
            <Button variant={locked ? 'outline' : 'secondary'} onClick={() => setLocked((l) => !l)}>
              {locked ? 'Mở khóa' : 'Đang chỉnh sửa'}
            </Button>
            <Button onClick={handleSave} disabled={locked}>
              <Save className="h-4 w-4" /> Lưu điểm danh
            </Button>
          </div>
        }
      />

      <FilterPanel className="mb-4">
        <FilterField label="Lớp học" className="w-40">
          <Select value={classId} onValueChange={(v) => { setClassId(v); setStatuses({}) }}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {classRooms?.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </FilterField>
        <FilterField label="Buổi học" className="w-64">
          <Select value={sessionId} onValueChange={(v) => { setSessionId(v); setStatuses({}) }}>
            <SelectTrigger><SelectValue placeholder="Chọn buổi học" /></SelectTrigger>
            <SelectContent>
              {sessions.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {formatDate(s.date)} - Tiết {s.period}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterField>
        {!locked && (
          <div className="flex items-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setAll('CO_MAT')}>Đánh dấu tất cả có mặt</Button>
          </div>
        )}
      </FilterPanel>

      {sessionId ? (
        <>
          <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatBox icon={CheckCircle2} color="text-success" bg="bg-success/10" label="Có mặt" value={stats.CO_MAT} />
            <StatBox icon={Clock} color="text-warning" bg="bg-warning/10" label="Vắng có phép" value={stats.VANG_PHEP} />
            <StatBox icon={XCircle} color="text-destructive" bg="bg-destructive/10" label="Vắng không phép" value={stats.VANG_KHONG_PHEP} />
            <StatBox icon={AlertTriangle} color="text-warning" bg="bg-warning/10" label="Đi muộn" value={stats.DI_MUON} />
          </div>

          <Card>
            <CardContent className="p-0">
              {classStudents.length === 0 ? (
                <EmptyState description="Lớp chưa có học sinh" />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">STT</TableHead>
                      <TableHead>Họ tên</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead className="text-right">Thao tác nhanh</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {classStudents.map((sc, idx) => {
                      const st = getStatus(sc.studentId)
                      return (
                        <TableRow key={sc.id}>
                          <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback style={{ backgroundColor: sc.student.avatarColor, color: 'white', fontSize: '11px' }}>
                                  {getInitials(sc.student.fullName)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{sc.student.fullName}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={ATTENDANCE_STYLES[st]} variant="outline">
                              {ATTENDANCE_LABELS[st]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-1">
                              {STATUS_OPTIONS.map((opt) => (
                                <button
                                  key={opt.value}
                                  disabled={locked}
                                  onClick={() => setStatus(sc.studentId, opt.value)}
                                  title={opt.label}
                                  className={
                                    'h-8 w-8 rounded-md border text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ' +
                                    (st === opt.value
                                      ? 'border-primary bg-primary text-primary-foreground'
                                      : 'border-input text-muted-foreground hover:bg-muted')
                                  }
                                >
                                  {opt.label.charAt(0)}
                                </button>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <Card><CardContent><EmptyState description="Vui lòng chọn buổi học để điểm danh" /></CardContent></Card>
      )}
    </div>
  )
}

function StatBox({ icon: Icon, color, bg, label, value }: { icon: any; color: string; bg: string; label: string; value: number }) {
  return (
    <div className={`flex items-center gap-3 rounded-xl border ${bg} p-4`}>
      <Icon className={`h-6 w-6 ${color}`} />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`text-xl font-bold ${color}`}>{value}</p>
      </div>
    </div>
  )
}
