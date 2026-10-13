import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Shield, UserPlus, Eye, Pencil, ShieldCheck } from 'lucide-react'
import { api } from '@/services/api'
import { PageHeader, EmptyState } from '@/components/common/StateComponents'
import { SearchBar } from '@/components/common/SearchBar'
import { FilterPanel, FilterField } from '@/components/common/FilterPanel'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { getInitials } from '@/utils/format'
import type { Role } from '@/types'
import { rolePermissions } from '@/data/mockData'

const ALL_PERMISSIONS = [
  'Quản lý học sinh',
  'Quản lý giáo viên',
  'Quản lý lớp học',
  'Quản lý môn học',
  'Nhập điểm',
  'Xem điểm',
  'Điểm danh',
  'Xem kết quả học tập',
  'Quản lý khen thưởng',
  'Xem báo cáo',
  'Quản lý tài khoản',
  'Phân quyền',
]

export default function AccountsPage() {
  const queryClient = useQueryClient()
  const { data: userAccounts } = useQuery({ queryKey: ['userAccounts'], queryFn: api.getUserAccounts })
  const { data: roles = [] } = useQuery({ queryKey: ['roles'], queryFn: api.getRoles })
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [activeRole, setActiveRole] = useState<Role>('ADMIN')

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: Role }) => api.updateUserAccount(id, { role }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['userAccounts'] })
    },
  })

  const filtered = useMemo(() => {
    return userAccounts?.filter((u) => {
      if (search) {
        const q = search.toLowerCase()
        if (!u.fullName.toLowerCase().includes(q) && !u.username.toLowerCase().includes(q)) return false
      }
      if (roleFilter !== 'all' && u.role !== roleFilter) return false
      return true
    }) ?? []
  }, [userAccounts, search, roleFilter])

  const activeRolePerms = rolePermissions.find((r) => r.role === activeRole)

  return (
    <div>
      <PageHeader
        title="Tài khoản & Phân quyền"
        description="Quản lý tài khoản người dùng và phân quyền truy cập theo vai trò"
        actions={
          <Button>
            <UserPlus className="h-4 w-4" /> Thêm tài khoản
          </Button>
        }
      />

      <Tabs defaultValue="accounts" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="accounts">Tài khoản</TabsTrigger>
          <TabsTrigger value="permissions">Phân quyền</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts">
          <FilterPanel className="mb-4">
            <div className="w-full sm:w-72">
              <SearchBar value={search} onChange={setSearch} placeholder="Tìm theo tên hoặc tên đăng nhập..." />
            </div>
            <FilterField label="Vai trò" className="w-44">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger><SelectValue placeholder="Tất cả" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả vai trò</SelectItem>
                  {roles.length > 0 ? roles.map((role) => (
                    <SelectItem key={role.name} value={role.name}>{role.label}</SelectItem>
                  )) : (
                    <>
                      <SelectItem value="ADMIN">Quản trị viên</SelectItem>
                      <SelectItem value="TEACHER">Giáo viên</SelectItem>
                      <SelectItem value="STUDENT">Học sinh</SelectItem>
                      <SelectItem value="PARENT">Phụ huynh</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </FilterField>
          </FilterPanel>

          <Card>
            <CardContent className="p-0">
              {filtered.length === 0 ? (
                <EmptyState description="Không tìm thấy tài khoản" />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tên đăng nhập</TableHead>
                      <TableHead>Họ tên</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Vai trò</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Lần đăng nhập cuối</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback style={{ backgroundColor: u.avatarColor, color: 'white', fontSize: '11px' }}>
                                {getInitials(u.fullName)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{u.username}</span>
                          </div>
                        </TableCell>
                        <TableCell>{u.fullName}</TableCell>
                        <TableCell className="text-muted-foreground">{u.email}</TableCell>
                        <TableCell>
                          <Select
                            value={u.role}
                            onValueChange={(value) => updateRoleMutation.mutate({ id: u.id, role: value as Role })}
                          >
                            <SelectTrigger className="h-9 w-[150px]">
                              <SelectValue placeholder="Chọn vai trò" />
                            </SelectTrigger>
                            <SelectContent>
                              {roles.length > 0 ? roles.map((role) => (
                                <SelectItem key={role.name} value={role.name}>{role.label}</SelectItem>
                              )) : (
                                <>
                                  <SelectItem value="ADMIN">Quản trị viên</SelectItem>
                                  <SelectItem value="TEACHER">Giáo viên</SelectItem>
                                  <SelectItem value="STUDENT">Học sinh</SelectItem>
                                  <SelectItem value="PARENT">Phụ huynh</SelectItem>
                                </>
                              )}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Badge variant={u.status === 'ACTIVE' ? 'success' : 'destructive'}>
                            {u.status === 'ACTIVE' ? 'Hoạt động' : 'Khoá'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{u.lastLogin ?? '—'}</TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr">
            <Card className="h-fit">
              <CardContent className="p-3">
                <p className="mb-2 px-2 text-xs font-semibold uppercase text-muted-foreground">Vai trò</p>
                <div className="space-y-1">
                  {rolePermissions.map((r) => (
                    <button
                      key={r.role}
                      onClick={() => setActiveRole(r.role)}
                      className={
                        'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ' +
                        (activeRole === r.role ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground')
                      }
                    >
                      <ShieldCheck className="h-4 w-4" />
                      {r.label}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                  <h3 className="text-lg font-semibold">Quyền của: {activeRolePerms?.label}</h3>
                  <p className="text-sm text-muted-foreground">
                    Cấu hình các quyền truy cập cho vai trò này</p>
                </div>
                  <Button><Shield className="h-4 w-4" /> Cập nhật quyền</Button>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {ALL_PERMISSIONS.map((perm) => {
                  const checked = activeRole === 'ADMIN' || activeRolePerms?.permissions.includes(perm) || activeRolePerms?.permissions.includes('Tất cả')
                  return (
                    <label
                      key={perm}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <span className="text-sm font-medium">{perm}</span>
                      <div
                        className={
                          'flex h-6 w-11 items-center rounded-full p-0.5 transition-colors ' +
                          (checked ? 'bg-primary' : 'bg-muted')
                        }
                      >
                        <div
                          className={
                            'h-5 w-5 rounded-full bg-white shadow transition-transform ' +
                            (checked ? 'translate-x-5' : 'translate-x-0.5')
                          }
                        />
                      </div>
                    </label>
                  )
                })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
