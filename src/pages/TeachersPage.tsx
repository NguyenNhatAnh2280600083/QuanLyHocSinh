import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Eye, Pencil, BookOpen, Phone, Mail, MapPin, Calendar, X } from 'lucide-react'
import { api } from '@/services/api'
import { PageHeader, EmptyState } from '@/components/common/StateComponents'
import { SearchBar } from '@/components/common/SearchBar'
import { FilterPanel, FilterField } from '@/components/common/FilterPanel'
import { Card, CardContent } from '@/components/ui/card'
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
import type { Teacher } from '@/types'

type TeacherFormState = {
  code: string
  fullName: string
  gender: Teacher['gender']
  dateOfBirth: string
  phone: string
  email: string
  address: string
  subjectIds: string[]
  hireDate: string
  status: Teacher['status']
}

const emptyTeacherForm = (teacher?: Teacher): TeacherFormState => ({
  code: teacher?.code ?? '',
  fullName: teacher?.fullName ?? '',
  gender: teacher?.gender ?? 'MALE',
  dateOfBirth: teacher?.dateOfBirth ?? '',
  phone: teacher?.phone ?? '',
  email: teacher?.email ?? '',
  address: teacher?.address ?? '',
  subjectIds: teacher?.subjectIds ?? [],
  hireDate: teacher?.hireDate ?? '',
  status: teacher?.status ?? 'ACTIVE',
})

export default function TeachersPage() {
  const { data: teachers } = useQuery({ queryKey: ['teachers'], queryFn: api.getTeachers })
  const { data: subjects } = useQuery({ queryKey: ['subjects'], queryFn: api.getSubjects })
  const { data: teachingAssignments } = useQuery({ queryKey: ['teachingAssignments'], queryFn: api.getTeachingAssignments })
  const { data: classRooms } = useQuery({ queryKey: ['classRooms'], queryFn: api.getClassRooms })

  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selected, setSelected] = useState<Teacher | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Teacher | null>(null)
  const [form, setForm] = useState<TeacherFormState>(emptyTeacherForm())
  const [subjectSelector, setSubjectSelector] = useState('')

  const createTeacherMutation = useMutation({
    mutationFn: (data: TeacherFormState) => api.createTeacher(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] })
      toast({ title: 'Thêm giáo viên thành công', type: 'success' })
      setFormOpen(false)
      setForm(emptyTeacherForm())
      setEditing(null)
    },
    onError: (error: Error) => {
      toast({ title: error.message, type: 'error' })
    },
  })

  const updateTeacherMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: TeacherFormState }) => api.updateTeacher(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] })
      toast({ title: 'Cập nhật giáo viên thành công', type: 'success' })
      setFormOpen(false)
      setForm(emptyTeacherForm())
      setEditing(null)
    },
    onError: (error: Error) => {
      toast({ title: error.message, type: 'error' })
    },
  })

  const deleteTeacherMutation = useMutation({
    mutationFn: (id: string) => api.deleteTeacher(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] })
      toast({ title: 'Đã xóa giáo viên', type: 'success' })
    },
    onError: (error: Error) => {
      toast({ title: error.message, type: 'error' })
    },
  })

  const subjectNameMap = useMemo(() => {
    const m = new Map<string, string>()
    subjects?.forEach((s) => m.set(s.id, s.name))
    return m
  }, [subjects])

  const classNameMap = useMemo(() => {
    const m = new Map<string, string>()
    classRooms?.forEach((c) => m.set(c.id, c.name))
    return m
  }, [classRooms])

  const teacherClasses = useMemo(() => {
    const m = new Map<string, Set<string>>()
    teachingAssignments?.forEach((ta) => {
      const set = m.get(ta.teacherId) ?? new Set<string>()
      set.add(ta.classId)
      m.set(ta.teacherId, set)
    })
    return m
  }, [teachingAssignments])

  const teacherClassAssignments = useMemo(() => {
    const m = new Map<string, Array<{ classId: string; subjectId: string }>>()
    teachingAssignments?.forEach((ta) => {
      const list = m.get(ta.teacherId) ?? []
      list.push({ classId: ta.classId, subjectId: ta.subjectId })
      m.set(ta.teacherId, list)
    })
    return m
  }, [teachingAssignments])

  const filtered = useMemo(() => {
    return teachers?.filter((t) => {
      if (search) {
        const q = search.toLowerCase()
        if (!t.code.toLowerCase().includes(q) && !t.fullName.toLowerCase().includes(q)) return false
      }
      if (statusFilter !== 'all' && t.status !== statusFilter) return false
      if (subjectFilter !== 'all' && !t.subjectIds.includes(subjectFilter)) return false
      return true
    }) ?? []
  }, [teachers, search, statusFilter, subjectFilter])

  const mainSubjects = useMemo(() => {
    const set = new Set<string>()
    teachers?.forEach((t) => t.subjectIds.forEach((id) => set.add(id)))
    return Array.from(set)
  }, [teachers])

  const openAdd = () => {
    setEditing(null)
    setForm(emptyTeacherForm())
    setSubjectSelector('')
    setFormOpen(true)
  }

  const openEdit = (teacher: Teacher) => {
    setEditing(teacher)
    setForm(emptyTeacherForm(teacher))
    setSubjectSelector('')
    setFormOpen(true)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      ...form,
      code: form.code.trim(),
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      subjectIds: form.subjectIds.filter(Boolean),
    }

    if (!payload.code || !payload.fullName) {
      toast({ title: 'Vui lòng nhập mã và họ tên giáo viên', type: 'error' })
      return
    }

    if (editing) {
      updateTeacherMutation.mutate({ id: editing.id, data: payload })
    } else {
      createTeacherMutation.mutate(payload)
    }
  }

  const handleDelete = (teacher: Teacher) => {
    if (window.confirm(`Bạn có chắc muốn xóa giáo viên ${teacher.fullName}?`)) {
      deleteTeacherMutation.mutate(teacher.id)
    }
  }

  return (
    <div>
      <PageHeader
        title="Quản lý giáo viên"
        description={`Tổng cộng ${teachers?.length ?? 0} giáo viên`}
        actions={
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4" /> Thêm giáo viên
          </Button>
        }
      />

      <FilterPanel className="mb-4">
        <div className="w-full sm:w-72">
          <SearchBar value={search} onChange={setSearch} placeholder="Tìm theo mã hoặc họ tên..." />
        </div>
        <FilterField label="Môn học" className="w-48">
          <Select value={subjectFilter} onValueChange={setSubjectFilter}>
            <SelectTrigger><SelectValue placeholder="Tất cả" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả môn</SelectItem>
              {Array.from(new Set(mainSubjects.map((id) => subjectNameMap.get(id) ?? id))).map((name) => {
                const id = mainSubjects.find((sid) => subjectNameMap.get(sid) === name)
                return <SelectItem key={id} value={id ?? name}>{name}</SelectItem>
              })}
            </SelectContent>
          </Select>
        </FilterField>
        <FilterField label="Trạng thái" className="w-40">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger><SelectValue placeholder="Tất cả" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="ACTIVE">Đang công tác</SelectItem>
              <SelectItem value="RESIGNED">Đã nghỉ</SelectItem>
            </SelectContent>
          </Select>
        </FilterField>
      </FilterPanel>

      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <EmptyState description="Không tìm thấy giáo viên phù hợp" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã GV</TableHead>
                  <TableHead>Họ tên</TableHead>
                  <TableHead>Môn học phụ trách</TableHead>
                  <TableHead>Số lớp dạy</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((t) => {
                  const subjectNames = Array.from(new Set(t.subjectIds.map((id) => subjectNameMap.get(id) ?? ''))).filter(Boolean)
                  const classes = teacherClasses.get(t.id)?.size ?? 0
                  const assignments = teacherClassAssignments.get(t.id) ?? []
                  const assignmentChips = assignments.slice(0, 3).map((a) => ({
                    label: `${subjectNameMap.get(a.subjectId) ?? a.subjectId} · ${classNameMap.get(a.classId) ?? a.classId}`,
                    key: `${t.id}-${a.classId}-${a.subjectId}`,
                  }))
                  return (
                    <TableRow key={t.id}>
                      <TableCell className="font-mono text-xs">{t.code}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback style={{ backgroundColor: '#10b981', color: 'white' }}>
                              {getInitials(t.fullName)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{t.fullName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {assignmentChips.length > 0 ? assignmentChips.map((item) => (
                            <Badge key={item.key} variant="secondary">{item.label}</Badge>
                          )) : subjectNames.slice(0, 2).map((n) => (
                            <Badge key={n} variant="secondary">{n}</Badge>
                          ))}
                          {(assignmentChips.length > 0 && assignments.length > 3) || (!assignmentChips.length && subjectNames.length > 2) ? (
                            <Badge variant="outline">+{assignmentChips.length > 0 ? assignments.length - 3 : subjectNames.length - 2}</Badge>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell>{classes} lớp</TableCell>
                      <TableCell>
                        <Badge variant={t.status === 'ACTIVE' ? 'success' : 'secondary'}>
                          {t.status === 'ACTIVE' ? 'Đang công tác' : 'Đã nghỉ'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => setSelected(t)}><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => openEdit(t)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(t)}><X className="h-4 w-4" /></Button>
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

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Thông tin giáo viên</DialogTitle>
            <DialogDescription>Chi tiết hồ sơ giáo viên</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-5">
              <div className="flex items-center gap-4 rounded-lg border bg-muted/30 p-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback style={{ backgroundColor: '#10b981', color: 'white', fontSize: '20px' }}>
                    {getInitials(selected.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-bold">{selected.fullName}</h3>
                  <p className="text-sm text-muted-foreground">Mã: {selected.code}</p>
                  <Badge variant="success">{selected.status === 'ACTIVE' ? 'Đang công tác' : 'Đã nghỉ'}</Badge>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <InfoRow icon={Calendar} label="Ngày sinh" value={formatDate(selected.dateOfBirth)} />
                <InfoRow icon={BookOpen} label="Giới tính" value={GENDER_LABELS[selected.gender]} />
                <InfoRow icon={Phone} label="Điện thoại" value={selected.phone} />
                <InfoRow icon={Mail} label="Email" value={selected.email} />
                <InfoRow icon={MapPin} label="Địa chỉ" value={selected.address} full />
                <InfoRow icon={Calendar} label="Ngày vào làm" value={formatDate(selected.hireDate)} />
                <div>
                  <p className="text-xs text-muted-foreground">Môn học phụ trách</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {Array.from(new Set(selected.subjectIds.map((id) => subjectNameMap.get(id)))).filter(Boolean).map((n) => (
                      <Badge key={n} variant="secondary">{n}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Lớp được phân công</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {Array.from(teacherClasses.get(selected.id) ?? []).map((cid) => (
                      <Badge key={cid} variant="outline">{classNameMap.get(cid)}</Badge>
                    ))}
                    {!teacherClasses.get(selected.id)?.size && <span className="text-sm text-muted-foreground">Chưa có</span>}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs text-muted-foreground">Lịch dạy theo lớp</p>
                  <div className="mt-2 space-y-2">
                    {(teacherClassAssignments.get(selected.id) ?? []).map((ta) => (
                      <div key={`${ta.classId}-${ta.subjectId}`} className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2">
                        <span className="text-sm font-medium">{classNameMap.get(ta.classId) ?? ta.classId}</span>
                        <Badge variant="secondary">{subjectNameMap.get(ta.subjectId) ?? ta.subjectId}</Badge>
                      </div>
                    ))}
                    {!teacherClassAssignments.get(selected.id)?.length && <span className="text-sm text-muted-foreground">Chưa có lịch dạy</span>}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={formOpen} onOpenChange={(open) => {
        if (!open) {
          setFormOpen(false)
          setForm(emptyTeacherForm())
          setSubjectSelector('')
          setEditing(null)
        } else {
          setFormOpen(true)
        }
      }}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? 'Chỉnh sửa giáo viên' : 'Thêm giáo viên mới'}</DialogTitle>
            <DialogDescription>Điền thông tin giáo viên</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Họ tên <span className="text-destructive">*</span></Label>
              <Input value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label>Mã GV <span className="text-destructive">*</span></Label>
              <Input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label>Ngày sinh</Label>
              <Input type="date" value={form.dateOfBirth} onChange={(e) => setForm((f) => ({ ...f, dateOfBirth: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Giới tính</Label>
              <Select value={form.gender} onValueChange={(value) => setForm((f) => ({ ...f, gender: value as Teacher['gender'] }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Nam</SelectItem>
                  <SelectItem value="FEMALE">Nữ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Điện thoại</Label>
              <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Ngày vào làm</Label>
              <Input type="date" value={form.hireDate} onChange={(e) => setForm((f) => ({ ...f, hireDate: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Trạng thái</Label>
              <Select value={form.status} onValueChange={(value) => setForm((f) => ({ ...f, status: value as Teacher['status'] }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Đang công tác</SelectItem>
                  <SelectItem value="RESIGNED">Đã nghỉ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Môn học phụ trách</Label>
              <div className="rounded-md border bg-muted/20 p-3">
                <div className="mb-3">
                  <Select
                    value={subjectSelector}
                    onValueChange={(value) => {
                      setSubjectSelector('')
                      if (!value || form.subjectIds.includes(value)) return
                      setForm((f) => ({ ...f, subjectIds: [...f.subjectIds, value] }))
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Chọn môn học" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects && subjects.length > 0 ? subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id} disabled={form.subjectIds.includes(subject.id)}>
                          {subject.name}
                        </SelectItem>
                      )) : (
                        <div className="px-2 py-2 text-sm text-muted-foreground">Chưa có môn học</div>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-wrap gap-2">
                  {form.subjectIds.length > 0 ? form.subjectIds.map((subjectId) => (
                    <Badge key={subjectId} variant="secondary" className="flex items-center gap-2 px-2 py-1">
                      <span>{subjectNameMap.get(subjectId) ?? subjectId}</span>
                      <button
                        type="button"
                        className="text-muted-foreground transition hover:text-foreground"
                        onClick={() => setForm((f) => ({ ...f, subjectIds: f.subjectIds.filter((id) => id !== subjectId) }))}
                        aria-label={`Xóa ${subjectNameMap.get(subjectId) ?? subjectId}`}
                      >
                        ×
                      </button>
                    </Badge>
                  )) : (
                    <span className="text-sm text-muted-foreground">Chưa chọn môn nào</span>
                  )}
                </div>
              </div>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Địa chỉ</Label>
              <Input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
            </div>
            <DialogFooter className="sm:col-span-2">
              <Button type="button" variant="outline" onClick={() => { setFormOpen(false); setForm(emptyTeacherForm()); setSubjectSelector(''); setEditing(null) }}>Hủy</Button>
              <Button type="submit" disabled={createTeacherMutation.isPending || updateTeacherMutation.isPending}>
                {editing ? 'Cập nhật' : 'Thêm'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function InfoRow({ icon: Icon, label, value, full }: { icon: any; label: string; value: string; full?: boolean }) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="mt-1 flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">{value}</span>
      </div>
    </div>
  )
}
