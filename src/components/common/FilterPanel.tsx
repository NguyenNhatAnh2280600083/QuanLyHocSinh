import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface FilterPanelProps {
  children: ReactNode
  className?: string
}

export function FilterPanel({ children, className }: FilterPanelProps) {
  return (
    <div className={cn('flex flex-wrap items-end gap-3 rounded-lg border bg-card p-4', className)}>
      {children}
    </div>
  )
}

interface FilterFieldProps {
  label: string
  children: ReactNode
  className?: string
}

export function FilterField({ label, children, className }: FilterFieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  )
}
