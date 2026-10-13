import { useState } from 'react'
import { Menu, Search, Bell, LogOut, User } from 'lucide-react'
import { Breadcrumb } from './Breadcrumb'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { getInitials } from '@/utils/format'
import { ROLE_LABELS } from '@/utils/constants'

interface AppHeaderProps {
  onToggleSidebar: () => void
  onOpenMobile: () => void
}

export function AppHeader({ onToggleSidebar, onOpenMobile }: AppHeaderProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [notifOpen, setNotifOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-card px-4 lg:px-6">
      <button
        onClick={onOpenMobile}
        className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>
      <button
        onClick={onToggleSidebar}
        className="hidden rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground lg:block"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="hidden md:block">
        <Breadcrumb />
      </div>

      <div className="relative ml-auto hidden max-w-xs flex-1 md:block">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          placeholder="Tìm kiếm học sinh, giáo viên, lớp..."
          className="h-10 w-full rounded-lg border border-input bg-background pl-10 pr-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div className="ml-auto flex items-center gap-2 md:ml-0">
        <DropdownMenu open={notifOpen} onOpenChange={setNotifOpen}>
          <DropdownMenuTrigger asChild>
            <button className="relative rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Thông báo</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-80 overflow-y-auto scrollbar-thin">
              {[
                { title: 'Có điểm mới được cập nhật', msg: 'Điểm cuối kỳ môn Toán lớp 10A1 đã được nhập', time: '5 phút trước' },
                { title: 'Khen thưởng học sinh', msg: 'Trường vừa ban hành quyết định khen thưởng', time: '1 giờ trước' },
                { title: 'Nhắc nhở chốt điểm', msg: 'Hạn chốt điểm học kỳ I còn 3 ngày', time: '3 giờ trước' },
              ].map((n, i) => (
                <div key={i} className="flex gap-3 px-2 py-2.5 hover:bg-muted">
                  <div className="h-2 w-2 shrink-0 rounded-full bg-accent mt-2" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{n.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{n.msg}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-muted">
              <Avatar className="h-8 w-8">
                <AvatarFallback style={{ backgroundColor: user?.avatarColor ?? '#3b82f6', color: 'white' }}>
                  {user ? getInitials(user.fullName) : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="hidden text-left sm:block">
                <p className="text-sm font-medium leading-tight">{user?.fullName}</p>
                <p className="text-[11px] text-muted-foreground">{user ? ROLE_LABELS[user.role] : ''}</p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>{user?.fullName}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              Thông tin tài khoản
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
