import { Link, useLocation } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'
import { navigation } from '@/config/navigation'

export function Breadcrumb() {
  const location = useLocation()
  const path = location.pathname

  const allItems = navigation.flatMap((g) => g.items)
  const current = allItems.find(
    (i) => (i.href === '/' && path === '/') || (i.href !== '/' && path.startsWith(i.href))
  )

  const parts: { label: string; href: string }[] = [{ label: 'Trang chủ', href: '/' }]
  if (current && current.href !== '/') {
    parts.push({ label: current.label, href: current.href })
  }

  return (
    <nav className="flex items-center gap-1.5 text-sm">
      {parts.map((p, idx) => {
        const isLast = idx === parts.length - 1
        return (
          <div key={p.href} className="flex items-center gap-1.5">
            {idx === 0 ? (
              <Link to={p.href} className="flex items-center text-muted-foreground hover:text-foreground">
                <Home className="h-4 w-4" />
              </Link>
            ) : (
              <Link
                to={p.href}
                className={isLast ? 'font-medium text-foreground' : 'text-muted-foreground hover:text-foreground'}
              >
                {p.label}
              </Link>
            )}
            {!isLast && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
          </div>
        )
      })}
    </nav>
  )
}
