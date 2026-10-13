import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Award, AlertTriangle, Pencil, X } from 'lucide-react'
import { api } from '@/services/api'
import { PageHeader, EmptyState } from '@/components/common/StateComponents'
import { FilterPanel, FilterField } from '@/components/common/FilterPanel'
import { SearchBar } from '@/components/common/SearchBar'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useToast } from '@/components/ui/toast'
import { REWARD_TYPE_LABELS } from '@/utils/constants'
import { formatDate, getInitials } from '@/utils/format'
import type { RewardType, Student, RewardDiscipline } from '@/types'

type RewardFormState = {
  id?: string
  studentId: string
  type: RewardType
  title: string
  reason: string
  date: string
  decisionNumber: string
}

const emptyRewardForm = (item?: RewardDiscipline): RewardFormState => ({
  id: item?.id,
  studentId: item?.studentId ?? '',
  type: item?.type ?? 'REWARD',
  title: item?.title ?? '',
  reason: item?.reason ?? '',
  date: item?.date ?? new Date().toISOString().slice(0, 10),
  decisionNumber: item?.decisionNumber ?? '',
})

export default function RewardsPage() {
  const { data: rewardDisciplines } = useQuery({ queryKey: ['rewardDisciplines'], queryFn: api.getRewardDisciplines })
  const { data: students } = useQuery({ queryKey: ['students'], queryFn: api.getStudents })
  const { data: classRooms } = useQuery({ queryKey: ['classRooms'], queryFn: api.getClassRooms })
  const { data: studentClasses } = useQuery({ queryKey: ['studentClasses'], queryFn: api.getStudentClasses })

  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | RewardType>('all')
  const [classFilter, setClassFilter] = useState('all')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<RewardDiscipline | null>(null)
  const [form, setForm] = useState<RewardFormState>(emptyRewardForm())

  const studentMap = useMemo(() => {
    const m = new Map<string, Student>()
    students?.forEach((s) => m.set(s.id, s))
    return m
  }, [students])

  const studentClassMap = useMemo(() => {
    const m = new Map<string, string>()
    studentClasses?.forEach((sc) => {
      if (sc.schoolYearId === 'sy-2024-2025') m.set(sc.studentId, sc.classId)
    })
    return m
  }, [studentClasses])

  const classNameMap = useMemo(() => {
    const m = new Map<string, string>()
    classRooms?.forEach((c) => m.set(c.id, c.name))
    return m
  }, [classRooms])

  const filtered = useMemo(() => {
    return rewardDisciplines?.filter((rd) => {
      const student = studentMap.get(rd.studentId)
      if (search) {
        const q = search.toLowerCase()
        if (!student?.fullName.toLowerCase().includes(q) && !rd.title.toLowerCase().includes(q)) return false
      }
      if (typeFilter !== 'all' && rd.type !== typeFilter) return false
      if (classFilter !== 'all') {
        const cid = studentClassMap.get(rd.studentId)
        if (cid !== classFilter) return false
      }
      return true
    }) ?? []
  }, [rewardDisciplines, studentMap, search, typeFilter, classFilter, studentClassMap])

  const stats = useMemo(() => ({
    reward: rewardDisciplines?.filter((r) => r.type === 'REWARD').length ?? 0,
    discipline: rewardDisciplines?.filter((r) => r.type === 'DISCIPLINE').length ?? 0,
  }), [rewardDisciplines])

  const createRewardMutation = useMutation({
    mutationFn: (data: RewardFormState) => api.createRewardDiscipline(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewardDisciplines'] })
      toast({ title: 'Thêm quyết định thành công', type: 'success' })
      setFormOpen(false)
      setForm(emptyRewardForm())
      setEditing(null)
    },
    onError: (error: Error) => toast({ title: error.message, type: 'error' }),
  })

  const updateRewardMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: RewardFormState }) => api.updateRewardDiscipline(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewardDisciplines'] })
      toast({ title: 'Cập nhật quyết định thành công', type: 'success' })
      setFormOpen(false)
      setForm(emptyRewardForm())
      setEditing(null)
    },
    onError: (error: Error) => toast({ title: error.message, type: 'error' }),
  })

  const deleteRewardMutation = useMutation({
    mutationFn: (id: string) => api.deleteRewardDiscipline(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewardDisciplines'] })
      toast({ title: 'Đã xóa quyết định', type: 'success' })
    },
    onError: (error: Error) => toast({ title: error.message, type: 'error' }),
  })

  const openCreate = () => {
    setEditing(null)
    setForm(emptyRewardForm())
    setFormOpen(true)
  }

  const openEdit = (item: RewardDiscipline) => {
    setEditing(item)
    setForm(emptyRewardForm(item))
    setFormOpen(true)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      ...form,
      studentId: form.studentId,
      title: form.title.trim(),
      reason: form.reason.trim(),
      decisionNumber: form.decisionNumber.trim(),
    }
    if (!payload.studentId || !payload.title || !payload.decisionNumber || !payload.date) {
      toast({ title: 'Vui lòng nhập đầy đủ thông tin', type: 'error' })
      return
    }
    if (editing) {
      updateRewardMutation.mutate({ id: editing.id, data: payload })
    } else {
      createRewardMutation.mutate(payload)
    }
  }

  return (
    <div>
      <PageHeader
        title="Khen thưởng & Kỷ luật"
        description="Quản lý các quyết định khen thưởng và kỷ luật đối với học sinh"
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> Thêm quyết định
          </Button>
        }
      />

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="border-success/30 bg-success/5">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/15 text-success">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Số quyết định khen thưởng</p>
              <p className="text-2xl font-bold text-success">{stats.reward}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/15 text-destructive">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Số quyết định kỷ luật</p>
              <p className="text-2xl font-bold text-destructive">{stats.discipline}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <FilterPanel className="mb-4">
        <div className="w-full sm:w-72">
          <SearchBar value={search} onChange={setSearch} placeholder="Tìm theo tên học sinh hoặc nội dung..." />
        </div>
        <FilterField label="Loại" className="w-44">
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as any)}>
            <SelectTrigger><SelectValue placeholder="Tất cả" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="REWARD">Khen thưởng</SelectItem>
              <SelectItem value="DISCIPLINE">Kỷ luật</SelectItem>
            </SelectContent>
          </Select>
        </FilterField>
        <FilterField label="Lớp" className="w-40">
          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger><SelectValue placeholder="Tất cả" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả lớp</SelectItem>
              {classRooms?.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </FilterField>
      </FilterPanel>

      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <EmptyState description="Không có quyết định nào phù hợp" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Số quyết định</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Học sinh</TableHead>
                  <TableHead>Lớp</TableHead>
                  <TableHead>Nội dung</TableHead>
                  <TableHead>Ngày</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((rd) => {
                  const student = studentMap.get(rd.studentId)
                  const cid = studentClassMap.get(rd.studentId)
                  return (
                    <TableRow key={rd.id}>
                      <TableCell className="font-mono text-xs">{rd.decisionNumber}</TableCell>
                      <TableCell>
                        <Badge variant={rd.type === 'REWARD' ? 'success' : 'destructive'}>
                          {REWARD_TYPE_LABELS[rd.type]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {student && (
                            <Avatar className="h-8 w-8">
                              <AvatarFallback style={{ backgroundColor: student.avatarColor, color: 'white', fontSize: '11px' }}>
                                {getInitials(student.fullName)}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <span className="font-medium">{student?.fullName}</span>
                        </div>
                      </TableCell>
                      <TableCell>{cid ? classNameMap.get(cid) : '—'}</TableCell>
                      <TableCell>
                        <p className="font-medium">{rd.title}</p>
                        <p className="text-xs text-muted-foreground">{rd.reason}</p>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center justify-between gap-2">
                          <span>{formatDate(rd.date)}</span>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEdit(rd)} title="Sửa"><Pencil className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => {
                              if (window.confirm('Bạn có chắc muốn xóa quyết định này?')) deleteRewardMutation.mutate(rd.id)
                            }} title="Xóa"><X className="h-4 w-4" /></Button>
                          </div>
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

      <Dialog open={formOpen} onOpenChange={(open) => {
        if (!open) {
          setFormOpen(false)
          setForm(emptyRewardForm())
          setEditing(null)
        } else setFormOpen(true)
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Chỉnh sửa quyết định' : 'Thêm quyết định'}</DialogTitle>
            <DialogDescription>Nhập chi tiết khen thưởng hoặc kỷ luật</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label>Học sinh <span className="text-destructive">*</span></Label>
              <Select value={form.studentId} onValueChange={(value) => setForm((f) => ({ ...f, studentId: value }))}>
                <SelectTrigger><SelectValue placeholder="Chọn học sinh" /></SelectTrigger>
                <SelectContent>
                  {students?.map((s) => <SelectItem key={s.id} value={s.id}>{s.fullName}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Loại</Label>
                <Select value={form.type} onValueChange={(value) => setForm((f) => ({ ...f, type: value as RewardType }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="REWARD">Khen thưởng</SelectItem>
                    <SelectItem value="DISCIPLINE">Kỷ luật</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Ngày</Label>
                <Input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Số quyết định <span className="text-destructive">*</span></Label>
              <Input value={form.decisionNumber} onChange={(e) => setForm((f) => ({ ...f, decisionNumber: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label>Tiêu đề <span className="text-destructive">*</span></Label>
              <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label>Lý do</Label>
              <Input value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setFormOpen(false); setForm(emptyRewardForm()); setEditing(null) }}>Hủy</Button>
              <Button type="submit" disabled={createRewardMutation.isPending || updateRewardMutation.isPending}>{editing ? 'Cập nhật' : 'Thêm'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
