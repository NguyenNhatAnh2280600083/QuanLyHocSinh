import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, GraduationCap, Eye, Pencil, X } from 'lucide-react'
import { api } from '@/services/api'
import { PageHeader, EmptyState } from '@/components/common/StateComponents'
import { FilterPanel, FilterField } from '@/components/common/FilterPanel'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useToast } from '@/components/ui/toast'
import { GENDER_LABELS } from '@/utils/constants'
import { formatDate, getInitials } from '@/utils/format'
import type { ClassRoom } from '@/types'

type ClassRoomFormState = {
  id?: string
  name: string
  code: string
  gradeId: string
  schoolYearId: string
  homeroomTeacherId?: string
  maxStudents: number
}

const emptyClassForm = (item?: ClassRoom): ClassRoomFormState => ({
  id: item?.id,
  name: item?.name ?? '',
  code: item?.code ?? '',
  gradeId: item?.gradeId ?? '',
  schoolYearId: item?.schoolYearId ?? 'sy-2024-2025',
  homeroomTeacherId: item?.homeroomTeacherId ?? '',
  maxStudents: item?.maxStudents ?? 40,
})

export default function ClassesPage() {
  const { data: classRooms } = useQuery({ queryKey: ['classRooms'], queryFn: api.getClassRooms })
  const { data: grades } = useQuery({ queryKey: ['grades'], queryFn: api.getGrades })
  const { data: teachers } = useQuery({ queryKey: ['teachers'], queryFn: api.getTeachers })
  const { data: studentClasses } = useQuery({ queryKey: ['studentClasses'], queryFn: api.getStudentClasses })
  const { data: students } = useQuery({ queryKey: ['students'], queryFn: api.getStudents })
  const { data: schoolYears } = useQuery({ queryKey: ['schoolYears'], queryFn: api.getSchoolYears })

  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [yearFilter, setYearFilter] = useState('sy-2024-2025')
  const [gradeFilter, setGradeFilter] = useState('all')
  const [selectedClass, setSelectedClass] = useState<ClassRoom | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<ClassRoom | null>(null)
  const [form, setForm] = useState<ClassRoomFormState>(emptyClassForm())

  const createClassMutation = useMutation({
    mutationFn: (data: ClassRoomFormState) => api.createClassRoom(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classRooms'] })
      toast({ title: 'Thêm lớp học thành công', type: 'success' })
      setFormOpen(false)
      setForm(emptyClassForm())
      setEditing(null)
    },
    onError: (error: Error) => {
      toast({ title: error.message, type: 'error' })
    },
  })

  const updateClassMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ClassRoomFormState }) => api.updateClassRoom(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classRooms'] })
      toast({ title: 'Cập nhật lớp học thành công', type: 'success' })
      setFormOpen(false)
      setForm(emptyClassForm())
      setEditing(null)
    },
    onError: (error: Error) => {
      toast({ title: error.message, type: 'error' })
    },
  })

  const deleteClassMutation = useMutation({
    mutationFn: (id: string) => api.deleteClassRoom(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classRooms'] })
      toast({ title: 'Đã xóa lớp học', type: 'success' })
    },
    onError: (error: Error) => {
      toast({ title: error.message, type: 'error' })
    },
  })

  const teacherMap = useMemo(() => {
    const m = new Map<string, string>()
    teachers?.forEach((t) => m.set(t.id, t.fullName))
    return m
  }, [teachers])

  const gradeMap = useMemo(() => {
    const m = new Map<string, string>()
    grades?.forEach((g) => m.set(g.id, g.name))
    return m
  }, [grades])

  const classSizeMap = useMemo(() => {
    const m = new Map<string, number>()
    studentClasses?.forEach((sc) => {
      if (sc.schoolYearId === yearFilter) m.set(sc.classId, (m.get(sc.classId) ?? 0) + 1)
    })
    return m
  }, [studentClasses, yearFilter])

  const filtered = useMemo(() => {
    return classRooms?.filter((c) => {
      if (c.schoolYearId !== yearFilter) return false
      if (gradeFilter !== 'all' && c.gradeId !== gradeFilter) return false
      return true
    }) ?? []
  }, [classRooms, yearFilter, gradeFilter])

  const classStudents = useMemo(() => {
    if (!selectedClass || !studentClasses || !students) return []
    return studentClasses
      .filter((sc) => sc.classId === selectedClass.id)
      .map((sc) => ({ ...sc, student: students.find((s) => s.id === sc.studentId)! }))
      .sort((a, b) => a.rollNumber - b.rollNumber)
  }, [selectedClass, studentClasses, students])

  const openAdd = () => {
    setEditing(null)
    setForm(emptyClassForm())
    setFormOpen(true)
  }

  const openEdit = (room: ClassRoom) => {
    setEditing(room)
    setForm(emptyClassForm(room))
    setFormOpen(true)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      ...form,
      name: form.name.trim(),
      code: form.code.trim(),
      gradeId: form.gradeId,
      schoolYearId: form.schoolYearId,
      homeroomTeacherId: form.homeroomTeacherId || undefined,
      maxStudents: Number(form.maxStudents) || 40,
    }

    if (!payload.name || !payload.code || !payload.gradeId) {
      toast({ title: 'Vui lòng nhập tên, mã và khối lớp', type: 'error' })
      return
    }

    if (editing) {
      updateClassMutation.mutate({ id: editing.id, data: payload })
    } else {
      createClassMutation.mutate(payload)
    }
  }

  const handleDelete = (room: ClassRoom) => {
    if (window.confirm(`Bạn có chắc muốn xóa lớp ${room.name}?`)) {
      deleteClassMutation.mutate(room.id)
    }
  }

  return (
    <div>
      <PageHeader
        title="Quản lý lớp học"
        description="Quản lý thông tin lớp học, sĩ số và giáo viên chủ nhiệm"
        actions={
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4" /> Thêm lớp
          </Button>
        }
      />

      <FilterPanel className="mb-4">
        <FilterField label="Năm học" className="w-48">
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {schoolYears?.map((sy) => <SelectItem key={sy.id} value={sy.id}>{sy.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </FilterField>
        <FilterField label="Khối lớp" className="w-40">
          <Select value={gradeFilter} onValueChange={setGradeFilter}>
            <SelectTrigger><SelectValue placeholder="Tất cả" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả khối</SelectItem>
              {grades?.map((g) => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </FilterField>
      </FilterPanel>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((c) => {
          const size = classSizeMap.get(c.id) ?? 0
          return (
            <Card key={c.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-lg">{c.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{gradeMap.get(c.gradeId)}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <GraduationCap className="h-6 w-6" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">GV chủ nhiệm</span>
                  <span className="font-medium">{teacherMap.get(c.homeroomTeacherId ?? '') ?? 'Chưa phân công'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Sĩ số</span>
                  <Badge variant="secondary">{size} / {c.maxStudents}</Badge>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${Math.min((size / c.maxStudents) * 100, 100)}%` }} />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => setSelectedClass(c)}>
                    <Eye className="h-4 w-4" /> Xem danh sách
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(c)} title="Sửa">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(c)} title="Xóa">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
        {filtered.length === 0 && (
          <div className="col-span-full">
            <Card><CardContent><EmptyState description="Không có lớp học phù hợp" /></CardContent></Card>
          </div>
        )}
      </div>

      <Dialog open={!!selectedClass} onOpenChange={(o) => !o && setSelectedClass(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Danh sách học sinh – {selectedClass?.name}</DialogTitle>
            <DialogDescription>Sĩ số: {classStudents.length} học sinh</DialogDescription>
          </DialogHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">STT</TableHead>
                <TableHead>Họ tên</TableHead>
                <TableHead>Ngày sinh</TableHead>
                <TableHead>Giới tính</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classStudents.map((sc) => (
                <TableRow key={sc.id}>
                  <TableCell className="text-muted-foreground">{sc.rollNumber}</TableCell>
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
                  <TableCell>{formatDate(sc.student.dateOfBirth)}</TableCell>
                  <TableCell>{GENDER_LABELS[sc.student.gender]}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>

      <Dialog open={formOpen} onOpenChange={(open) => {
        if (!open) {
          setFormOpen(false)
          setForm(emptyClassForm())
          setEditing(null)
        } else {
          setFormOpen(true)
        }
      }}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing ? 'Chỉnh sửa lớp học' : 'Thêm lớp học mới'}</DialogTitle>
            <DialogDescription>Nhập thông tin cơ bản của lớp</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Tên lớp <span className="text-destructive">*</span></Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label>Mã lớp <span className="text-destructive">*</span></Label>
              <Input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label>Khối lớp <span className="text-destructive">*</span></Label>
              <Select value={form.gradeId} onValueChange={(value) => setForm((f) => ({ ...f, gradeId: value }))}>
                <SelectTrigger><SelectValue placeholder="Chọn khối" /></SelectTrigger>
                <SelectContent>
                  {grades?.map((g) => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Năm học</Label>
              <Select value={form.schoolYearId} onValueChange={(value) => setForm((f) => ({ ...f, schoolYearId: value }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {schoolYears?.map((sy) => <SelectItem key={sy.id} value={sy.id}>{sy.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>GV chủ nhiệm</Label>
              <Select value={form.homeroomTeacherId} onValueChange={(value) => setForm((f) => ({ ...f, homeroomTeacherId: value }))}>
                <SelectTrigger><SelectValue placeholder="Chưa phân công" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Chưa phân công</SelectItem>
                  {teachers?.map((t) => <SelectItem key={t.id} value={t.id}>{t.fullName}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Sĩ số tối đa</Label>
              <Input type="number" value={form.maxStudents} onChange={(e) => setForm((f) => ({ ...f, maxStudents: Number(e.target.value) || 40 }))} />
            </div>
            <DialogFooter className="sm:col-span-2">
              <Button type="button" variant="outline" onClick={() => { setFormOpen(false); setForm(emptyClassForm()); setEditing(null) }}>Hủy</Button>
              <Button type="submit" disabled={createClassMutation.isPending || updateClassMutation.isPending}>{editing ? 'Cập nhật' : 'Thêm'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
