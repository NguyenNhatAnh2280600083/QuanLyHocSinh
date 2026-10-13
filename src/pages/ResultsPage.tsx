import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Download } from 'lucide-react'
import { api } from '@/services/api'
import { PageHeader, EmptyState } from '@/components/common/StateComponents'
import { FilterPanel, FilterField } from '@/components/common/FilterPanel'
import { SearchBar } from '@/components/common/SearchBar'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { classifyRank } from '@/utils/constants'
import { formatScore, getInitials } from '@/utils/format'

export default function ResultsPage() {
  const { data: students } = useQuery({ queryKey: ['students'], queryFn: api.getStudents })
  const { data: classRooms } = useQuery({ queryKey: ['classRooms'], queryFn: api.getClassRooms })
  const { data: subjects } = useQuery({ queryKey: ['subjects'], queryFn: api.getSubjects })
  const { data: scores } = useQuery({ queryKey: ['scores'], queryFn: api.getScores })
  const { data: studentClasses } = useQuery({ queryKey: ['studentClasses'], queryFn: api.getStudentClasses })
  const { data: schoolYears } = useQuery({ queryKey: ['schoolYears'], queryFn: api.getSchoolYears })
  const { data: semesters } = useQuery({ queryKey: ['semesters'], queryFn: api.getSemesters })

  const [tab, setTab] = useState<'subject' | 'semester' | 'year'>('subject')
  const [schoolYearId, setSchoolYearId] = useState('sy-2024-2025')
  const [semesterId, setSemesterId] = useState('sem-1-2425')
  const [classId, setClassId] = useState('c-10a')
  const [subjectId, setSubjectId] = useState('TOAN-K10')
  const [search, setSearch] = useState('')

  const selectedClass = classRooms?.find((c) => c.id === classId)
  const gradeId = selectedClass?.gradeId
  const subjectOptions = useMemo(
    () => subjects?.filter((s) => s.gradeId === gradeId) ?? [],
    [subjects, gradeId]
  )

  const classStudents = useMemo(() => {
    if (!students || !studentClasses) return []
    return studentClasses
      .filter((sc) => sc.classId === classId && sc.schoolYearId === schoolYearId)
      .map((sc) => ({ ...sc, student: students.find((s) => s.id === sc.studentId)! }))
      .sort((a, b) => a.rollNumber - b.rollNumber)
  }, [students, studentClasses, classId, schoolYearId])

  const subjectResults = useMemo(() => {
    if (!scores) return []
    return classStudents.map((sc) => {
      const stuScores = scores.filter(
        (s) => s.studentId === sc.studentId && s.subjectId === subjectId && s.semesterId === semesterId
      )
      const tx = stuScores.filter((s) => s.scoreType === 'TX')
      const gk = stuScores.find((s) => s.scoreType === 'GK')
      const ck = stuScores.find((s) => s.scoreType === 'CK')
      const txAvg = tx.length ? tx.reduce((a, b) => a + b.value, 0) / tx.length : 0
      const gkVal = gk?.value ?? 0
      const ckVal = ck?.value ?? 0
      const avg = tx.length || gk || ck
        ? (txAvg * 1 + gkVal * 3 + ckVal * 5) / (1 + 3 + 5)
        : 0
      return { sc, txAvg, gk: gkVal, ck: ckVal, avg }
    })
  }, [classStudents, scores, subjectId, semesterId])

  const semesterResults = useMemo(() => {
    if (!scores || !subjects) return []
    const mainSubjects = subjectOptions.slice(0, 8)
    return classStudents.map((sc) => {
      const subjectAvgs: Record<string, number> = {}
      let totalWeight = 0
      let weightedSum = 0
      mainSubjects.forEach((sub) => {
        const subjScores = scores.filter(
          (s) => s.studentId === sc.studentId && s.subjectId === sub.id && s.semesterId === semesterId
        )
        const tx = subjScores.filter((s) => s.scoreType === 'TX')
        const gk = subjScores.find((s) => s.scoreType === 'GK')
        const ck = subjScores.find((s) => s.scoreType === 'CK')
        const txAvg = tx.length ? tx.reduce((a, b) => a + b.value, 0) / tx.length : 0
        const subAvg = tx.length || gk || ck
          ? (txAvg * 1 + (gk?.value ?? 0) * 3 + (ck?.value ?? 0) * 5) / 9
          : 0
        subjectAvgs[sub.id] = subAvg
        if (subAvg > 0) {
          weightedSum += subAvg
          totalWeight += 1
        }
      })
      const semAvg = totalWeight ? weightedSum / totalWeight : 0
      return { sc, subjectAvgs, semAvg }
    })
  }, [classStudents, scores, subjects, subjectOptions, semesterId])

  const filteredSubject = subjectResults.filter((r) => {
    if (!search) return true
    const q = search.toLowerCase()
    return r.sc.student.fullName.toLowerCase().includes(q) || r.sc.student.code.toLowerCase().includes(q)
  })

  const filteredSemester = semesterResults.filter((r) => {
    if (!search) return true
    const q = search.toLowerCase()
    return r.sc.student.fullName.toLowerCase().includes(q) || r.sc.student.code.toLowerCase().includes(q)
  })

  return (
    <div>
      <PageHeader
        title="Kết quả học tập"
        description="Tổng hợp kết quả học tập theo môn, học kỳ và năm học"
        actions={
          <Button variant="outline">
            <Download className="h-4 w-4" /> Xuất Excel
          </Button>
        }
      />

      <div className="mb-4 inline-flex rounded-lg bg-muted p-1">
        {[
          { v: 'subject', l: 'Theo môn học' },
          { v: 'semester', l: 'Theo học kỳ' },
          { v: 'year', l: 'Theo năm học' },
        ].map((t) => (
          <button
            key={t.v}
            onClick={() => setTab(t.v as any)}
            className={
              'rounded-md px-4 py-1.5 text-sm font-medium transition-colors ' +
              (tab === t.v ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground')
            }
          >
            {t.l}
          </button>
        ))}
      </div>

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
          <Select value={classId} onValueChange={setClassId}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {classRooms?.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </FilterField>
        {tab === 'subject' && (
          <FilterField label="Môn học" className="w-44">
            <Select value={subjectId} onValueChange={setSubjectId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {subjectOptions.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </FilterField>
        )}
        <div className="w-full sm:w-64">
          <SearchBar value={search} onChange={setSearch} placeholder="Tìm học sinh..." />
        </div>
      </FilterPanel>

      <Card>
        <CardContent className="p-0">
          {tab === 'subject' && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">STT</TableHead>
                  <TableHead>Mã HS</TableHead>
                  <TableHead>Họ tên</TableHead>
                  <TableHead className="text-center">Điểm TX</TableHead>
                  <TableHead className="text-center">Điểm GK</TableHead>
                  <TableHead className="text-center">Điểm CK</TableHead>
                  <TableHead className="text-center">Điểm TB</TableHead>
                  <TableHead className="text-center">Xếp loại</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubject.map((r, i) => {
                  const rank = classifyRank(r.avg)
                  return (
                    <TableRow key={r.sc.id}>
                      <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                      <TableCell className="font-mono text-xs">{r.sc.student.code}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback style={{ backgroundColor: r.sc.student.avatarColor, color: 'white', fontSize: '11px' }}>
                              {getInitials(r.sc.student.fullName)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{r.sc.student.fullName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{r.txAvg ? formatScore(r.txAvg) : '—'}</TableCell>
                      <TableCell className="text-center">{r.gk ? formatScore(r.gk) : '—'}</TableCell>
                      <TableCell className="text-center">{r.ck ? formatScore(r.ck) : '—'}</TableCell>
                      <TableCell className="text-center font-semibold">{r.avg ? formatScore(r.avg) : '—'}</TableCell>
                      <TableCell className="text-center">
                        {r.avg > 0 ? (
                          <Badge variant="secondary" className={rank.color}>{rank.label}</Badge>
                        ) : '—'}
                      </TableCell>
                    </TableRow>
                  )
                })}
                {filteredSubject.length === 0 && (
                  <TableRow><TableCell colSpan={8} className="py-12 text-center text-muted-foreground">Không có dữ liệu</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}

          {tab === 'semester' && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">STT</TableHead>
                    <TableHead>Mã HS</TableHead>
                    <TableHead>Họ tên</TableHead>
                    {subjectOptions.slice(0, 8).map((s) => (
                      <TableHead key={s.id} className="text-center whitespace-nowrap">{s.name}</TableHead>
                    ))}
                    <TableHead className="text-center">TB HK</TableHead>
                    <TableHead className="text-center">Xếp loại</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSemester.map((r, i) => {
                    const rank = classifyRank(r.semAvg)
                    return (
                      <TableRow key={r.sc.id}>
                        <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                        <TableCell className="font-mono text-xs">{r.sc.student.code}</TableCell>
                        <TableCell className="font-medium whitespace-nowrap">{r.sc.student.fullName}</TableCell>
                        {subjectOptions.slice(0, 8).map((s) => (
                          <TableCell key={s.id} className="text-center">
                            {r.subjectAvgs[s.id] ? formatScore(r.subjectAvgs[s.id]) : '—'}
                          </TableCell>
                        ))}
                        <TableCell className="text-center font-semibold">{r.semAvg ? formatScore(r.semAvg) : '—'}</TableCell>
                        <TableCell className="text-center">
                          {r.semAvg > 0 ? (
                            <Badge variant="secondary" className={rank.color}>{rank.label}</Badge>
                          ) : '—'}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                  {filteredSemester.length === 0 && (
                    <TableRow><TableCell colSpan={12} className="py-12 text-center text-muted-foreground">Không có dữ liệu</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {tab === 'year' && (
            <EmptyState
              title="Chưa có dữ liệu tổng kết năm học"
              description="Dữ liệu tổng kết năm học sẽ được hiển thị khi cả hai học kỳ đã được chốt."
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
