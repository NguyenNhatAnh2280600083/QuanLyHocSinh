import type { LucideIcon } from 'lucide-react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  change?: number
  changeLabel?: string
  iconClassName?: string
}

export function StatCard({ title, value, icon: Icon, change, changeLabel, iconClassName }: StatCardProps) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
        </div>
        <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary', iconClassName)}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      {change !== undefined && (
        <div className="mt-4 flex items-center gap-2 text-sm">
          <span
            className={cn(
              'inline-flex items-center gap-0.5 font-medium',
              change >= 0 ? 'text-success' : 'text-destructive'
            )}
          >
            {change >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            {Math.abs(change)}%
          </span>
          {changeLabel && <span className="text-muted-foreground">{changeLabel}</span>}
        </div>
      )}
    </div>
  )
}
