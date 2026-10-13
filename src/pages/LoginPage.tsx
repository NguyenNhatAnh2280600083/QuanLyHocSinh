import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, GraduationCap, Lock, User } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

export default function LoginPage() {
  const { login } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('admin123')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!username.trim() || !password.trim()) {
      setError('Vui lòng nhập tên đăng nhập và mật khẩu')
      return
    }
    setLoading(true)
    const ok = await login(username, password)
    setLoading(false)
    if (ok) {
      toast({ type: 'success', title: 'Đăng nhập thành công', description: `Chào mừng ${username}!` })
      const lastPath = sessionStorage.getItem('edumanage_last_path') || '/'
      navigate(lastPath === '/login' ? '/' : lastPath, { replace: true })
    } else {
      setError('Tên đăng nhập hoặc mật khẩu không chính xác')
    }
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 flex-col justify-between bg-primary p-12 text-primary-foreground lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-foreground/10">
            <GraduationCap className="h-7 w-7" />
          </div>
          <div>
            <p className="text-xl font-bold">EduManage</p>
            <p className="text-sm opacity-80">Hệ thống quản lý học sinh</p>
          </div>
        </div>
        <div className="space-y-6">
          <h1 className="text-4xl font-bold leading-tight">
            Quản lý học sinh<br />trường phổ thông chuyên nghiệp
          </h1>
          <p className="max-w-md text-base opacity-90">
            Hệ thống tích hợp quản lý hồ sơ, điểm số, điểm danh, kết quả học tập và báo cáo thống kê một cách thống nhất và dễ dàng.
          </p>
          <div className="grid grid-cols-3 gap-4">
            {[
              { v: '60+', l: 'Học sinh' },
              { v: '12', l: 'Giáo viên' },
              { v: '6', l: 'Lớp học' },
            ].map((s) => (
              <div key={s.l} className="rounded-xl bg-primary-foreground/10 p-4">
                <p className="text-2xl font-bold">{s.v}</p>
                <p className="text-sm opacity-80">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-sm opacity-70">© 2025 EduManage. Phiên bản demo.</p>
      </div>

      <div className="flex w-full items-center justify-center bg-background p-6 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <p className="text-lg font-bold">EduManage</p>
              <p className="text-xs text-muted-foreground">Hệ thống quản lý học sinh</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold">Đăng nhập</h2>
            <p className="mt-1 text-sm text-muted-foreground">Đăng nhập để truy cập hệ thống quản lý</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username">Tên đăng nhập / Email</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nhập tên đăng nhập"
                  className="pl-10"
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu"
                  className="pl-10 pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox id="remember" checked={remember} onCheckedChange={(v) => setRemember(!!v)} />
                <Label htmlFor="remember" className="cursor-pointer text-sm font-normal">
                  Ghi nhớ đăng nhập
                </Label>
              </div>
              <button type="button" className="text-sm font-medium text-accent hover:underline">
                Quên mật khẩu?
              </button>
            </div>

            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>
          </form>
        
        </div>
      </div>
    </div>
  )
}
