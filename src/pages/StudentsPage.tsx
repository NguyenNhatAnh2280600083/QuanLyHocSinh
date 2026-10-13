import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Eye, Pencil, X, Phone, Mail, MapPin, Calendar, User as UserIcon, GraduationCap } from 'lucide-react'
import { api } from '@/services/api'
import { PageHeader, EmptyState } from '@/components/common/StateComponents'
import { SearchBar } from '@/components/common/SearchBar'
import { Pagination } from '@/components/common/Pagination'
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
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useToast } from '@/components/ui/toast'
import { GENDER_LABELS, STUDENT_STATUS_LABELS } from '@/utils/constants'
import { formatDate, getInitials } from '@/utils/format'
import type { Student } from '@/types'

const STATUS_STYLES: Record<string, string> = {
  STUDYING: 'bg-success/15 text-success',
  GRADUATED: 'bg-accent/15 text-accent',
  TRANSFERRED: 'bg-warning/15 text-warning',
  SUSPENDED: 'bg-destructive/15 text-destructive',
}

const PAGE_SIZE = 10

type StudentFormState = {
  code: string
  fullName: string
  gender: Student['gender']
  dateOfBirth: string
  placeOfBirth: string
  ethnicity: string
  religion: string
  phone: string
  email: string
  address: string
  enrollmentDate: string
  status: Student['status']
  avatarColor: string
}

const emptyStudentForm = (student?: Student): StudentFormState => ({
  code: student?.code ?? '',
  fullName: student?.fullName ?? '',
  gender: student?.gender ?? 'MALE',
  dateOfBirth: student?.dateOfBirth ?? '',
  placeOfBirth: student?.placeOfBirth ?? '',
  ethnicity: student?.ethnicity ?? '',
  religion: student?.religion ?? '',
  phone: student?.phone ?? '',
  email: student?.email ?? '',
  address: student?.address ?? '',
  enrollmentDate: student?.enrollmentDate ?? '',
  status: student?.status ?? 'STUDYING',
  avatarColor: student?.avatarColor ?? '#3b82f6',
})

export default function StudentsPage() {
  const { data: students } = useQuery({ queryKey: ['students'], queryFn: api.getStudents })
  const { data: classRooms } = useQuery({ queryKey: ['classRooms'], queryFn: api.getClassRooms })
  const { data: studentClasses } = useQuery({ queryKey: ['studentClasses'], queryFn: api.getStudentClasses })
  const { data: grades } = useQuery({ queryKey: ['grades'], queryFn: api.getGrades })
  const { data: schoolYears } = useQuery({ queryKey: ['schoolYears'], queryFn: api.getSchoolYears })

  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [gradeFilter, setGradeFilter] = useState('all')
  const [classFilter, setClassFilter] = useState('all')
  const [yearFilter, setYearFilter] = useState('sy-2024-2025')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<Student | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Student | null>(null)
  const [form, setForm] = useState<StudentFormState>(emptyStudentForm())

  const createStudentMutation = useMutation({
    mutationFn: (data: StudentFormState) => api.createStudent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
      toast({ title: 'Thêm học sinh thành công', type: 'success' })
      setFormOpen(false)
      setForm(emptyStudentForm())
      setEditing(null)
    },
    onError: (error: Error) => {
      toast({ title: error.message, type: 'error' })
    },
  })

  const updateStudentMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: StudentFormState }) => api.updateStudent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
      toast({ title: 'Cập nhật học sinh thành công', type: 'success' })
      setFormOpen(false)
      setForm(emptyStudentForm())
      setEditing(null)
    },
    onError: (error: Error) => {
      toast({ title: error.message, type: 'error' })
    },
  })

  const deleteStudentMutation = useMutation({
    mutationFn: (id: string) => api.deleteStudent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
      toast({ title: 'Đã xóa học sinh', type: 'success' })
    },
    onError: (error: Error) => {
      toast({ title: error.message, type: 'error' })
    },
  })

  const studentClassMap = useMemo(() => {
    const map = new Map<string, { classId: string; rollNumber: number }>()
    studentClasses?.forEach((sc) => {
      if (sc.schoolYearId === yearFilter) map.set(sc.studentId, { classId: sc.classId, rollNumber: sc.rollNumber })
    })
    return map
  }, [studentClasses, yearFilter])

  const classNameMap = useMemo(() => {
    const map = new Map<string, string>()
    classRooms?.forEach((c) => map.set(c.id, c.name))
    return map
  }, [classRooms])

  const filtered = useMemo(() => {
    if (!students) return []
    return students.filter((s) => {
      if (search) {
        const q = search.toLowerCase()
        if (!s.code.toLowerCase().includes(q) && !s.fullName.toLowerCase().includes(q)) return false
      }
      if (statusFilter !== 'all' && s.status !== statusFilter) return false
      const sc = studentClassMap.get(s.id)
      if (classFilter !== 'all') {
        if (!sc || sc.classId !== classFilter) return false
      }
      if (gradeFilter !== 'all') {
        const cls = classRooms?.find((c) => c.id === sc?.classId)
        if (!cls || cls.gradeId !== gradeFilter) return false
      }
      return true
    })
  }, [students, search, statusFilter, classFilter, gradeFilter, studentClassMap, classRooms])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const openDetail = (s: Student) => {
    setSelected(s)
    setDetailOpen(true)
  }

  const openEdit = (s: Student) => {
    setEditing(s)
    setForm(emptyStudentForm(s))
    setFormOpen(true)
  }

  const openAdd = () => {
    setEditing(null)
    setForm(emptyStudentForm())
    setFormOpen(true)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      ...form,
      code: form.code.trim(),
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      address: form.address.trim(),
    }

    if (!payload.code || !payload.fullName) {
      toast({ title: 'Vui lòng nhập mã và họ tên học sinh', type: 'error' })
      return
    }

    if (editing) {
      updateStudentMutation.mutate({ id: editing.id, data: payload })
    } else {
      createStudentMutation.mutate(payload)
    }
  }

  const handleDelete = (student: Student) => {
    if (window.confirm(`Bạn có chắc muốn xóa học sinh ${student.fullName}?`)) {
      deleteStudentMutation.mutate(student.id)
    }
  }

  const filteredClasses = classRooms?.filter((c) => {
    if (gradeFilter !== 'all') return c.gradeId === gradeFilter
    return c.schoolYearId === yearFilter
  })

  return (
    <div>
      <PageHeader
        title="Quản lý học sinh"
        description={`Tổng cộng ${students?.length ?? 0} học sinh`}
        actions={
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4" />
            Thêm học sinh
          </Button>
        }
      />

      <FilterPanel className="mb-4">
        <div className="w-full sm:w-72">
          <SearchBar value={search} onChange={setSearch} placeholder="Tìm theo mã hoặc họ tên..." />
        </div>
        <FilterField label="Năm học" className="w-44">
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {schoolYears?.map((sy) => <SelectItem key={sy.id} value={sy.id}>{sy.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </FilterField>
        <FilterField label="Khối lớp" className="w-36">
          <Select value={gradeFilter} onValueChange={(v) => { setGradeFilter(v); setClassFilter('all') }}>
            <SelectTrigger><SelectValue placeholder="Tất cả" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả khối</SelectItem>
              {grades?.map((g) => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </FilterField>
        <FilterField label="Lớp" className="w-40">
          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger><SelectValue placeholder="Tất cả" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả lớp</SelectItem>
              {filteredClasses?.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </FilterField>
        <FilterField label="Trạng thái" className="w-40">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger><SelectValue placeholder="Tất cả" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="STUDYING">Đang theo học</SelectItem>
              <SelectItem value="GRADUATED">Tốt nghiệp</SelectItem>
              <SelectItem value="TRANSFERRED">Chuyển trường</SelectItem>
              <SelectItem value="SUSPENDED">Thôi học</SelectItem>
            </SelectContent>
          </Select>
        </FilterField>
        <Button variant="outline" onClick={() => { setSearch(''); setGradeFilter('all'); setClassFilter('all'); setStatusFilter('all') }}>
          <X className="h-4 w-4" /> Xóa lọc
        </Button>
      </FilterPanel>

      <Card>
        <CardContent className="p-0">
          {paged.length === 0 ? (
            <EmptyState description="Không tìm thấy học sinh phù hợp" />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã HS</TableHead>
                    <TableHead>Họ tên</TableHead>
                    <TableHead>Ngày sinh</TableHead>
                    <TableHead>Giới tính</TableHead>
                    <TableHead>Lớp</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paged.map((s) => {
                    const sc = studentClassMap.get(s.id)
                    return (
                      <TableRow key={s.id}>
                        <TableCell className="font-mono text-xs">{s.code}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback style={{ backgroundColor: s.avatarColor, color: 'white' }}>
                                {getInitials(s.fullName)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{s.fullName}</span>
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(s.dateOfBirth)}</TableCell>
                        <TableCell>{GENDER_LABELS[s.gender]}</TableCell>
                        <TableCell>{sc ? classNameMap.get(sc.classId) : '—'}</TableCell>
                        <TableCell>
                          <Badge className={STATUS_STYLES[s.status]} variant="outline">
                            {STUDENT_STATUS_LABELS[s.status]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openDetail(s)} title="Xem chi tiết">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => openEdit(s)} title="Chỉnh sửa">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(s)} title="Xóa">
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                totalItems={filtered.length}
                pageSize={PAGE_SIZE}
                onPageChange={setPage}
              />
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Hồ sơ học sinh</DialogTitle>
            <DialogDescription>Thông tin chi tiết của học sinh</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-5">
              <div className="flex items-center gap-4 rounded-lg border bg-muted/30 p-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback style={{ backgroundColor: selected.avatarColor, color: 'white', fontSize: '20px' }}>
                    {getInitials(selected.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-bold">{selected.fullName}</h3>
                  <p className="text-sm text-muted-foreground">Mã học sinh: {selected.code}</p>
                  <Badge className={STATUS_STYLES[selected.status]} variant="outline" >
                    {STUDENT_STATUS_LABELS[selected.status]}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <InfoRow icon={Calendar} label="Ngày sinh" value={formatDate(selected.dateOfBirth)} />
                <InfoRow icon={UserIcon} label="Giới tính" value={GENDER_LABELS[selected.gender]} />
                <InfoRow icon={MapPin} label="Nơi sinh" value={selected.placeOfBirth} />
                <InfoRow icon={GraduationCap} label="Dân tộc" value={selected.ethnicity} />
                <InfoRow icon={Phone} label="Số điện thoại" value={selected.phone} />
                <InfoRow icon={Mail} label="Email" value={selected.email} />
                <InfoRow icon={MapPin} label="Địa chỉ" value={selected.address} full />
                <InfoRow icon={Calendar} label="Ngày nhập học" value={formatDate(selected.enrollmentDate)} />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={formOpen} onOpenChange={(open) => {
        if (!open) {
          setFormOpen(false)
          setForm(emptyStudentForm())
          setEditing(null)
        } else {
          setFormOpen(true)
        }
      }}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? 'Chỉnh sửa học sinh' : 'Thêm học sinh mới'}</DialogTitle>
            <DialogDescription>Điền đầy đủ thông tin học sinh</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Họ tên <span className="text-destructive">*</span></Label>
              <Input value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label>Mã học sinh <span className="text-destructive">*</span></Label>
              <Input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label>Ngày sinh <span className="text-destructive">*</span></Label>
              <Input type="date" value={form.dateOfBirth} onChange={(e) => setForm((f) => ({ ...f, dateOfBirth: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label>Giới tính</Label>
              <Select value={form.gender} onValueChange={(value) => setForm((f) => ({ ...f, gender: value as Student['gender'] }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Nam</SelectItem>
                  <SelectItem value="FEMALE">Nữ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Ngày nhập học</Label>
              <Input type="date" value={form.enrollmentDate} onChange={(e) => setForm((f) => ({ ...f, enrollmentDate: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Trạng thái</Label>
              <Select value={form.status} onValueChange={(value) => setForm((f) => ({ ...f, status: value as Student['status'] }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="STUDYING">Đang theo học</SelectItem>
                  <SelectItem value="GRADUATED">Tốt nghiệp</SelectItem>
                  <SelectItem value="TRANSFERRED">Chuyển trường</SelectItem>
                  <SelectItem value="SUSPENDED">Thôi học</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Số điện thoại</Label>
              <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Nơi sinh</Label>
              <Input value={form.placeOfBirth} onChange={(e) => setForm((f) => ({ ...f, placeOfBirth: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Dân tộc</Label>
              <Input value={form.ethnicity} onChange={(e) => setForm((f) => ({ ...f, ethnicity: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Tôn giáo</Label>
              <Input value={form.religion} onChange={(e) => setForm((f) => ({ ...f, religion: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Màu avatar</Label>
              <Input type="color" value={form.avatarColor} onChange={(e) => setForm((f) => ({ ...f, avatarColor: e.target.value }))} className="h-10 p-1" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Địa chỉ</Label>
              <Input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
            </div>
            <DialogFooter className="sm:col-span-2">
              <Button type="button" variant="outline" onClick={() => { setFormOpen(false); setForm(emptyStudentForm()); setEditing(null) }}>Hủy</Button>
              <Button type="submit" disabled={createStudentMutation.isPending || updateStudentMutation.isPending}>
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
