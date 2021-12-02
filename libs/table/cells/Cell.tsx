import type { ReactNode } from 'react'
import React from 'react'
import cn from 'classnames'

interface CellProps {
  children: ReactNode
  className?: string
}
export const Cell = ({ children, className }: CellProps) => (
  <div className={cn('mx-4', className)}>{children}</div>
)
