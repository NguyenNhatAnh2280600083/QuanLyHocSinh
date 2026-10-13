import {
  LayoutDashboard,
  Users,
  GraduationCap,
  UserCog,
  BookOpen,
  ClipboardList,
  CalendarCheck,
  FileBarChart,
  Award,
  BarChart3,
  Shield,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  roles?: string[]
}

export interface NavGroup {
  title: string
  items: NavItem[]
}

export const navigation: NavGroup[] = [
  {
    title: 'Tổng quan',
    items: [
      { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Quản lý hồ sơ',
    items: [
      { label: 'Học sinh', href: '/students', icon: Users },
      { label: 'Giáo viên', href: '/teachers', icon: UserCog },
      { label: 'Lớp học', href: '/classes', icon: GraduationCap },
      { label: 'Môn học & Phân công', href: '/subjects', icon: BookOpen },
    ],
  },
  {
    title: 'Nghiệp vụ giáo dục',
    items: [
      { label: 'Quản lý điểm', href: '/scores', icon: ClipboardList },
      { label: 'Điểm danh', href: '/attendance', icon: CalendarCheck },
      { label: 'Kết quả học tập', href: '/results', icon: FileBarChart },
      { label: 'Khen thưởng & Kỷ luật', href: '/rewards', icon: Award },
    ],
  },
  {
    title: 'Báo cáo & Hệ thống',
    items: [
      { label: 'Báo cáo thống kê', href: '/reports', icon: BarChart3 },
      { label: 'Tài khoản & Phân quyền', href: '/accounts', icon: Shield },
    ],
  },
]
