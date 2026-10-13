import { NavLink, useLocation } from 'react-router-dom'
import { ChevronLeft, GraduationCap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { navigation } from '@/config/navigation'

interface AppSidebarProps {
  collapsed: boolean
  onToggle: () => void
  mobileOpen: boolean
  onCloseMobile: () => void
}

export function AppSidebar({ collapsed, onToggle, mobileOpen, onCloseMobile }: AppSidebarProps) {
  const location = useLocation()

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onCloseMobile}
        />
      )}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-card transition-all duration-300 lg:static lg:translate-x-0',
          collapsed ? 'lg:w-[72px]' : 'lg:w-64',
          mobileOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex h-16 items-center gap-3 border-b px-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="truncate text-sm font-bold text-foreground">EduManage</p>
              <p className="truncate text-[11px] text-muted-foreground">Quản lý học sinh</p>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4">
          {navigation.map((group) => (
            <div key={group.title} className="mb-6">
              {!collapsed && (
                <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {group.title}
                </p>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon
                  const active =
                    item.href === '/'
                      ? location.pathname === '/'
                      : location.pathname.startsWith(item.href)
                  return (
                    <NavLink
                      key={item.href}
                      to={item.href}
                      onClick={onCloseMobile}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        active
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      )}
                    >
                      <Icon className={cn('h-5 w-5 shrink-0', active && 'text-primary')} />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </NavLink>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        <button
          onClick={onToggle}
          className="hidden items-center justify-center border-t py-3 text-muted-foreground hover:bg-muted hover:text-foreground lg:flex"
        >
          <ChevronLeft className={cn('h-5 w-5 transition-transform', collapsed && 'rotate-180')} />
        </button>
      </aside>
    </>
  )
}
