import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Save, Lock, Unlock, AlertCircle } from 'lucide-react'
import { api } from '@/services/api'
import { PageHeader, EmptyState } from '@/components/common/StateComponents'
import { FilterPanel, FilterField } from '@/components/common/FilterPanel'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useToast } from '@/components/ui/toast'
import { SCORE_TYPE_LABELS } from '@/utils/constants'
import { getInitials } from '@/utils/format'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import type { ScoreType } from '@/types'

const SCORE_TYPES: ScoreType[] = ['TX', 'GK', 'CK']

export default function ScoresPage() {
  const { data: students } = useQuery({ queryKey: ['students'], queryFn: api.getStudents })
  const { data: classRooms } = useQuery({ queryKey: ['classRooms'], queryFn: api.getClassRooms })
  const { data: subjects } = useQuery({ queryKey: ['subjects'], queryFn: api.getSubjects })
  const { data: scores } = useQuery({ queryKey: ['scores'], queryFn: api.getScores })
  const { data: studentClasses } = useQuery({ queryKey: ['studentClasses'], queryFn: api.getStudentClasses })
  const { data: assessments } = useQuery({ queryKey: ['assessments'], queryFn: api.getAssessments })
  const { data: schoolYears } = useQuery({ queryKey: ['schoolYears'], queryFn: api.getSchoolYears })
  const { data: semesters } = useQuery({ queryKey: ['semesters'], queryFn: api.getSemesters })

  const { toast } = useToast()
  const [schoolYearId, setSchoolYearId] = useState('sy-2024-2025')
  const [semesterId, setSemesterId] = useState('sem-1-2425')
  const [classId, setClassId] = useState('c-10a')
  const [subjectId, setSubjectId] = useState('TOAN-K10')
  const [scoreType, setScoreType] = useState<ScoreType>('TX')
  const [locked, setLocked] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const selectedClass = classRooms?.find((c) => c.id === classId)
  const gradeId = selectedClass?.gradeId

  const subjectOptions = useMemo(() => {
    if (!gradeId || !subjects) return []
    return subjects.filter((s) => s.gradeId === gradeId)
  }, [gradeId, subjects])

  const classStudents = useMemo(() => {
    if (!students || !studentClasses) return []
    return studentClasses
      .filter((sc) => sc.classId === classId && sc.schoolYearId === schoolYearId)
      .map((sc) => ({ ...sc, student: students.find((s) => s.id === sc.studentId)! }))
      .sort((a, b) => a.rollNumber - b.rollNumber)
  }, [students, studentClasses, classId, schoolYearId])

  const selectedAssessment = useMemo(() => {
    return assessments?.find(
      (a) => a.classId === classId && a.subjectId === subjectId && a.semesterId === semesterId && a.scoreType === scoreType
    )
  }, [assessments, classId, subjectId, semesterId, scoreType])

  const [scoreValues, setScoreValues] = useState<Record<string, string>>({})

  const existingScores = useMemo(() => {
    const map = new Map<string, number>()
    scores?.forEach((s) => {
      if (s.classId === classId && s.subjectId === subjectId && s.semesterId === semesterId && s.scoreType === scoreType) {
        map.set(s.studentId, s.value)
      }
    })
    return map
  }, [scores, classId, subjectId, semesterId, scoreType])

  const getDisplayValue = (studentId: string) => {
    if (scoreValues[studentId] !== undefined) return scoreValues[studentId]
    const v = existingScores.get(studentId)
    return v !== undefined ? String(v) : ''
  }

  const handleChange = (studentId: string, value: string) => {
    setScoreValues((prev) => ({ ...prev, [studentId]: value }))
    setErrors((prev) => {
      const next = { ...prev }
      delete next[studentId]
      return next
    })
    if (value === '') return
    const num = parseFloat(value.replace(',', '.'))
    if (isNaN(num) || num < 0 || num > 10) {
      setErrors((prev) => ({ ...prev, [studentId]: 'Điểm phải từ 0 đến 10' }))
    }
  }

  const handleSave = () => {
    const newErrors: Record<string, string> = {}
    Object.entries(scoreValues).forEach(([sid, val]) => {
      if (val === '') return
      const num = parseFloat(val.replace(',', '.'))
      if (isNaN(num) || num < 0 || num > 10) {
        newErrors[sid] = 'Điểm phải từ 0 đến 10'
      }
    })
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) {
      toast({ type: 'error', title: 'Lỗi nhập liệu', description: 'Vui lòng kiểm tra các điểm được đánh dấu' })
      return
    }
    toast({ type: 'success', title: 'Lưu điểm thành công', description: `Đã lưu ${Object.keys(scoreValues).length} điểm` })
    setLocked(true)
  }

  const coefficient = selectedAssessment?.coefficient ?? (scoreType === 'TX' ? 1 : scoreType === 'GK' ? 3 : 5)

  return (
    <div>
      <PageHeader
        title="Quản lý điểm số"
        description="Nhập và cập nhật điểm theo loại đánh giá: Thường xuyên, Giữa kỳ, Cuối kỳ"
        actions={
          <div className="flex gap-2">
            <Button variant={locked ? 'outline' : 'secondary'} onClick={() => setLocked((l) => !l)}>
              {locked ? <><Unlock className="h-4 w-4" /> Mở khóa nhập</> : <><Lock className="h-4 w-4" /> Đang nhập</>}
            </Button>
            <Button onClick={handleSave} disabled={locked || Object.keys(scoreValues).length === 0}>
              <Save className="h-4 w-4" /> Lưu điểm
            </Button>
          </div>
        }
      />

      <FilterPanel className="mb-4">
        <FilterField label="Năm học" className="w-40">
          <Select value={schoolYearId} onValueChange={setSchoolYearId}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {schoolYears?.map((sy) => <SelectItem key={sy.id} value={sy.id}>{sy.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </FilterField>
        <FilterField label="Học kỳ" className="w-36">
          <Select value={semesterId} onValueChange={setSemesterId}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {semesters?.filter((s) => s.schoolYearId === schoolYearId).map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterField>
        <FilterField label="Lớp học" className="w-36">
          <Select value={classId} onValueChange={(v) => { setClassId(v); setScoreValues({}); setErrors({}) }}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {classRooms?.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </FilterField>
        <FilterField label="Môn học" className="w-44">
          <Select value={subjectId} onValueChange={(v) => { setSubjectId(v); setScoreValues({}); setErrors({}) }}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {subjectOptions.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </FilterField>
        <FilterField label="Loại đánh giá" className="w-36">
          <Select value={scoreType} onValueChange={(v) => { setScoreType(v as ScoreType); setScoreValues({}); setErrors({}) }}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {SCORE_TYPES.map((t) => <SelectItem key={t} value={t}>{SCORE_TYPE_LABELS[t]}</SelectItem>)}
            </SelectContent>
          </Select>
        </FilterField>
      </FilterPanel>

      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border bg-card p-3">
        <Badge variant="secondary">Hệ số: {coefficient}</Badge>
        <Badge variant={locked ? 'success' : 'warning'}>{locked ? 'Đã chốt' : 'Đang nhập'}</Badge>
        <span className="text-sm text-muted-foreground">Sĩ số: {classStudents.length} học sinh</span>
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
                  <TableHead>Mã HS</TableHead>
                  <TableHead>Họ tên</TableHead>
                  <TableHead className="w-48 text-center">
                    Điểm {SCORE_TYPE_LABELS[scoreType]}
                    <span className="block text-[10px] font-normal text-muted-foreground">(0 – 10)</span>
                  </TableHead>
                  <TableHead className="w-32 text-center">Nhận xét</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classStudents.map((sc, idx) => {
                  const val = getDisplayValue(sc.studentId)
                  const hasError = errors[sc.studentId]
                  return (
                    <TableRow key={sc.id}>
                      <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                      <TableCell className="font-mono text-xs">{sc.student.code}</TableCell>
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
                      <TableCell className="text-center">
                        <div className="mx-auto max-w-[120px]">
                          <input
                            type="text"
                            inputMode="decimal"
                            value={val}
                            disabled={locked}
                            onChange={(e) => handleChange(sc.studentId, e.target.value)}
                            placeholder="—"
                            className={
                              'h-9 w-full rounded-md border text-center text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:bg-muted ' +
                              (hasError ? 'border-destructive text-destructive' : 'border-input')
                            }
                          />
                          {hasError && (
                            <p className="mt-1 flex items-center justify-center gap-1 text-[11px] text-destructive">
                              <AlertCircle className="h-3 w-3" /> {hasError}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center text-sm text-muted-foreground">—</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
