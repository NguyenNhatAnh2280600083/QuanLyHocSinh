import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, BookOpen, Users, Pencil, X } from 'lucide-react'
import { api } from '@/services/api'
import { PageHeader } from '@/components/common/StateComponents'
import { FilterPanel, FilterField } from '@/components/common/FilterPanel'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useToast } from '@/components/ui/toast'
import type { Subject, TeachingAssignment } from '@/types'

type SubjectFormState = {
  id?: string
  name: string
  code: string
  gradeId: string
  isElective: boolean
  description: string
}

type AssignmentFormState = {
  id?: string
  teacherId: string
  subjectId: string
  classId: string
  semesterId: string
  schoolYearId: string
}

const emptySubjectForm = (item?: Subject): SubjectFormState => ({
  id: item?.id,
  name: item?.name ?? '',
  code: item?.code ?? '',
  gradeId: item?.gradeId ?? '',
  isElective: item?.isElective ?? false,
  description: item?.description ?? '',
})

const emptyAssignmentForm = (item?: TeachingAssignment): AssignmentFormState => ({
  id: item?.id,
  teacherId: item?.teacherId ?? '',
  subjectId: item?.subjectId ?? '',
  classId: item?.classId ?? '',
  semesterId: item?.semesterId ?? '',
  schoolYearId: item?.schoolYearId ?? 'sy-2024-2025',
})

export default function SubjectsPage() {
  const { data: subjects } = useQuery({ queryKey: ['subjects'], queryFn: api.getSubjects })
  const { data: grades } = useQuery({ queryKey: ['grades'], queryFn: api.getGrades })
  const { data: classRooms } = useQuery({ queryKey: ['classRooms'], queryFn: api.getClassRooms })
  const { data: teachers } = useQuery({ queryKey: ['teachers'], queryFn: api.getTeachers })
  const { data: teachingAssignments } = useQuery({ queryKey: ['teachingAssignments'], queryFn: api.getTeachingAssignments })
  const { data: semesters } = useQuery({ queryKey: ['semesters'], queryFn: api.getSemesters })

  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [tab, setTab] = useState<'subjects' | 'assignments'>('subjects')
  const [gradeFilter, setGradeFilter] = useState('all')
  const [classFilter, setClassFilter] = useState('all')
  const [semesterFilter, setSemesterFilter] = useState('sem-1-2425')
  const [subjectFormOpen, setSubjectFormOpen] = useState(false)
  const [assignmentFormOpen, setAssignmentFormOpen] = useState(false)
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null)
  const [editingAssignment, setEditingAssignment] = useState<TeachingAssignment | null>(null)
  const [subjectForm, setSubjectForm] = useState<SubjectFormState>(emptySubjectForm())
  const [assignmentForm, setAssignmentForm] = useState<AssignmentFormState>(emptyAssignmentForm())

  const createSubjectMutation = useMutation({
    mutationFn: (data: SubjectFormState) => api.createSubject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] })
      toast({ title: 'Thêm môn học thành công', type: 'success' })
      setSubjectFormOpen(false)
      setSubjectForm(emptySubjectForm())
      setEditingSubject(null)
    },
    onError: (error: Error) => toast({ title: error.message, type: 'error' }),
  })

  const updateSubjectMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: SubjectFormState }) => api.updateSubject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] })
      toast({ title: 'Cập nhật môn học thành công', type: 'success' })
      setSubjectFormOpen(false)
      setSubjectForm(emptySubjectForm())
      setEditingSubject(null)
    },
    onError: (error: Error) => toast({ title: error.message, type: 'error' }),
  })

  const deleteSubjectMutation = useMutation({
    mutationFn: (id: string) => api.deleteSubject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] })
      toast({ title: 'Đã xóa môn học', type: 'success' })
    },
    onError: (error: Error) => toast({ title: error.message, type: 'error' }),
  })

  const createAssignmentMutation = useMutation({
    mutationFn: (data: AssignmentFormState) => api.createTeachingAssignment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachingAssignments'] })
      toast({ title: 'Thêm phân công thành công', type: 'success' })
      setAssignmentFormOpen(false)
      setAssignmentForm(emptyAssignmentForm())
      setEditingAssignment(null)
    },
    onError: (error: Error) => toast({ title: error.message, type: 'error' }),
  })

  const updateAssignmentMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: AssignmentFormState }) => api.updateTeachingAssignment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachingAssignments'] })
      toast({ title: 'Cập nhật phân công thành công', type: 'success' })
      setAssignmentFormOpen(false)
      setAssignmentForm(emptyAssignmentForm())
      setEditingAssignment(null)
    },
    onError: (error: Error) => toast({ title: error.message, type: 'error' }),
  })

  const deleteAssignmentMutation = useMutation({
    mutationFn: (id: string) => api.deleteTeachingAssignment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachingAssignments'] })
      toast({ title: 'Đã xóa phân công', type: 'success' })
    },
    onError: (error: Error) => toast({ title: error.message, type: 'error' }),
  })

  const teacherMap = useMemo(() => {
    const m = new Map<string, string>()
    teachers?.forEach((t) => m.set(t.id, t.fullName))
    return m
  }, [teachers])

  const classNameMap = useMemo(() => {
    const m = new Map<string, string>()
    classRooms?.forEach((c) => m.set(c.id, c.name))
    return m
  }, [classRooms])

  const uniqueSubjects = useMemo(() => {
    const seen = new Map<string, Subject>()
    subjects?.forEach((s) => {
      if (!seen.has(s.code)) seen.set(s.code, s)
    })
    return Array.from(seen.values())
  }, [subjects])

  const gradeFiltered = useMemo(() => {
    return uniqueSubjects.filter((s) => {
      if (gradeFilter !== 'all') {
        const hasGrade = subjects?.some((sub) => sub.code === s.code && sub.gradeId === gradeFilter)
        if (!hasGrade) return false
      }
      return true
    })
  }, [uniqueSubjects, gradeFilter, subjects])

  const assignments = useMemo(() => {
    return teachingAssignments?.filter((a) => {
      if (a.semesterId !== semesterFilter) return false
      if (classFilter !== 'all' && a.classId !== classFilter) return false
      return true
    }) ?? []
  }, [teachingAssignments, semesterFilter, classFilter])

  const handleSaveSubject = (e: React.FormEvent) => {
    e.preventDefault()
    const payload = { ...subjectForm, name: subjectForm.name.trim(), code: subjectForm.code.trim() }
    if (!payload.name || !payload.code || !payload.gradeId) {
      toast({ title: 'Vui lòng nhập tên, mã và khối lớp', type: 'error' })
      return
    }
    if (editingSubject) {
      updateSubjectMutation.mutate({ id: editingSubject.id, data: payload })
    } else {
      createSubjectMutation.mutate(payload)
    }
  }

  const handleSaveAssignment = (e: React.FormEvent) => {
    e.preventDefault()
    const payload = { ...assignmentForm, teacherId: assignmentForm.teacherId, subjectId: assignmentForm.subjectId, classId: assignmentForm.classId, semesterId: assignmentForm.semesterId }
    if (!payload.teacherId || !payload.subjectId || !payload.classId || !payload.semesterId) {
      toast({ title: 'Vui lòng chọn đầy đủ thông tin phân công', type: 'error' })
      return
    }
    if (editingAssignment) {
      updateAssignmentMutation.mutate({ id: editingAssignment.id, data: payload })
    } else {
      createAssignmentMutation.mutate(payload)
    }
  }

  const openSubjectCreate = () => {
    setEditingSubject(null)
    setSubjectForm(emptySubjectForm())
    setSubjectFormOpen(true)
  }

  const openSubjectEdit = (subject: Subject) => {
    setEditingSubject(subject)
    setSubjectForm(emptySubjectForm(subject))
    setSubjectFormOpen(true)
  }

  const openAssignmentCreate = () => {
    setEditingAssignment(null)
    setAssignmentForm(emptyAssignmentForm())
    setAssignmentFormOpen(true)
  }

  const openAssignmentEdit = (assignment: TeachingAssignment) => {
    setEditingAssignment(assignment)
    setAssignmentForm(emptyAssignmentForm(assignment))
    setAssignmentFormOpen(true)
  }

  return (
    <div>
      <PageHeader
        title="Môn học & Phân công giảng dạy"
        description="Quản lý danh mục môn học và phân công giáo viên theo lớp, học kỳ"
      />

      <div className="mb-4 inline-flex rounded-lg bg-muted p-1">
        <button
          onClick={() => setTab('subjects')}
          className={
            'rounded-md px-4 py-1.5 text-sm font-medium transition-colors ' +
            (tab === 'subjects' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground')
          }
        >
          Danh mục môn học
        </button>
        <button
          onClick={() => setTab('assignments')}
          className={
            'rounded-md px-4 py-1.5 text-sm font-medium transition-colors ' +
            (tab === 'assignments' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground')
          }
        >
          Phân công giảng dạy
        </button>
      </div>

      {tab === 'subjects' ? (
        <>
          <FilterPanel className="mb-4">
            <FilterField label="Khối lớp" className="w-40">
              <Select value={gradeFilter} onValueChange={setGradeFilter}>
                <SelectTrigger><SelectValue placeholder="Tất cả" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả khối</SelectItem>
                  {grades?.map((g) => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </FilterField>
            <Button onClick={openSubjectCreate}><Plus className="h-4 w-4" /> Thêm môn học</Button>
          </FilterPanel>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {gradeFiltered.map((s) => (
              <Card key={s.code}>
                <CardHeader className="flex-row items-center justify-between space-y-0">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent/10 text-accent">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{s.name}</CardTitle>
                      <p className="text-xs text-muted-foreground">Mã: {s.code}</p>
                    </div>
                  </div>
                  {s.isElective && <Badge variant="warning">Tự chọn</Badge>}
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">Áp dụng cho các khối:</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {grades?.map((g) => {
                      const has = subjects?.some((sub) => sub.code === s.code && sub.gradeId === g.id)
                      if (!has) return null
                      return (
                        <Badge key={g.id} variant="secondary">{g.name}</Badge>
                      )
                    })}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => openSubjectEdit(s)}><Pencil className="h-4 w-4" /> Sửa</Button>
                    <Button variant="ghost" size="sm" onClick={() => {
                      if (window.confirm(`Bạn có chắc muốn xóa môn ${s.name}?`)) deleteSubjectMutation.mutate(s.id)
                    }}><X className="h-4 w-4" /> Xóa</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <>
          <FilterPanel className="mb-4">
            <FilterField label="Học kỳ" className="w-44">
              <Select value={semesterFilter} onValueChange={setSemesterFilter}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {semesters?.map((s) => <SelectItem key={s.id} value={s.id}>{s.name} - {s.schoolYearId.replace('sy-', '')}</SelectItem>)}
                </SelectContent>
              </Select>
            </FilterField>
            <FilterField label="Lớp học" className="w-40">
              <Select value={classFilter} onValueChange={setClassFilter}>
                <SelectTrigger><SelectValue placeholder="Tất cả" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả lớp</SelectItem>
                  {classRooms?.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </FilterField>
            <Button onClick={openAssignmentCreate}><Plus className="h-4 w-4" /> Thêm phân công</Button>
          </FilterPanel>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lớp học</TableHead>
                    <TableHead>Môn học</TableHead>
                    <TableHead>Giáo viên</TableHead>
                    <TableHead>Học kỳ</TableHead>
                    <TableHead>Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.map((a) => {
                    const subject = subjects?.find((s) => s.id === a.subjectId)
                    const sem = semesters?.find((s) => s.id === a.semesterId)
                    return (
                      <TableRow key={a.id}>
                        <TableCell className="font-medium">{classNameMap.get(a.classId)}</TableCell>
                        <TableCell>{subject?.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            {teacherMap.get(a.teacherId)}
                          </div>
                        </TableCell>
                        <TableCell>{sem?.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant="success">Đã phân công</Badge>
                            <Button variant="ghost" size="icon" onClick={() => openAssignmentEdit(a)} title="Sửa"><Pencil className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => {
                              if (window.confirm('Bạn có chắc muốn xóa phân công này?')) deleteAssignmentMutation.mutate(a.id)
                            }} title="Xóa"><X className="h-4 w-4" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                  {assignments.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                        Không có phân công nào phù hợp
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      <Dialog open={subjectFormOpen} onOpenChange={(open) => {
        if (!open) {
          setSubjectFormOpen(false)
          setSubjectForm(emptySubjectForm())
          setEditingSubject(null)
        } else setSubjectFormOpen(true)
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingSubject ? 'Chỉnh sửa môn học' : 'Thêm môn học'}</DialogTitle>
            <DialogDescription>Nhập thông tin môn học</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveSubject} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Tên môn <span className="text-destructive">*</span></Label>
                <Input value={subjectForm.name} onChange={(e) => setSubjectForm((f) => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label>Mã môn <span className="text-destructive">*</span></Label>
                <Input value={subjectForm.code} onChange={(e) => setSubjectForm((f) => ({ ...f, code: e.target.value }))} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Khối áp dụng <span className="text-destructive">*</span></Label>
              <Select value={subjectForm.gradeId} onValueChange={(value) => setSubjectForm((f) => ({ ...f, gradeId: value }))}>
                <SelectTrigger><SelectValue placeholder="Chọn khối" /></SelectTrigger>
                <SelectContent>
                  {grades?.map((g) => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Mô tả</Label>
              <Input value={subjectForm.description} onChange={(e) => setSubjectForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={subjectForm.isElective} onChange={(e) => setSubjectForm((f) => ({ ...f, isElective: e.target.checked }))} />
              <Label>Môn học tự chọn</Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setSubjectFormOpen(false); setEditingSubject(null); setSubjectForm(emptySubjectForm()) }}>Hủy</Button>
              <Button type="submit" disabled={createSubjectMutation.isPending || updateSubjectMutation.isPending}>{editingSubject ? 'Cập nhật' : 'Thêm'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={assignmentFormOpen} onOpenChange={(open) => {
        if (!open) {
          setAssignmentFormOpen(false)
          setAssignmentForm(emptyAssignmentForm())
          setEditingAssignment(null)
        } else setAssignmentFormOpen(true)
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingAssignment ? 'Chỉnh sửa phân công' : 'Thêm phân công giảng dạy'}</DialogTitle>
            <DialogDescription>Chọn giáo viên, môn học, lớp và học kỳ</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveAssignment} className="space-y-4">
            <div className="space-y-2">
              <Label>Giáo viên <span className="text-destructive">*</span></Label>
              <Select value={assignmentForm.teacherId} onValueChange={(value) => setAssignmentForm((f) => ({ ...f, teacherId: value }))}>
                <SelectTrigger><SelectValue placeholder="Chọn giáo viên" /></SelectTrigger>
                <SelectContent>
                  {teachers?.map((t) => <SelectItem key={t.id} value={t.id}>{t.fullName}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Môn học <span className="text-destructive">*</span></Label>
              <Select value={assignmentForm.subjectId} onValueChange={(value) => setAssignmentForm((f) => ({ ...f, subjectId: value }))}>
                <SelectTrigger><SelectValue placeholder="Chọn môn" /></SelectTrigger>
                <SelectContent>
                  {subjects?.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Lớp học <span className="text-destructive">*</span></Label>
              <Select value={assignmentForm.classId} onValueChange={(value) => setAssignmentForm((f) => ({ ...f, classId: value }))}>
                <SelectTrigger><SelectValue placeholder="Chọn lớp" /></SelectTrigger>
                <SelectContent>
                  {classRooms?.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Học kỳ <span className="text-destructive">*</span></Label>
              <Select value={assignmentForm.semesterId} onValueChange={(value) => setAssignmentForm((f) => ({ ...f, semesterId: value }))}>
                <SelectTrigger><SelectValue placeholder="Chọn học kỳ" /></SelectTrigger>
                <SelectContent>
                  {semesters?.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setAssignmentFormOpen(false); setAssignmentForm(emptyAssignmentForm()); setEditingAssignment(null) }}>Hủy</Button>
              <Button type="submit" disabled={createAssignmentMutation.isPending || updateAssignmentMutation.isPending}>{editingAssignment ? 'Cập nhật' : 'Thêm'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
