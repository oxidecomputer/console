import React from 'react'
import cn from 'classnames'

export interface DividerProps {
  className?: string
}
export function Divider({ className }: DividerProps) {
  return (
    <hr
      className={cn('ox-divider w-full border-t border-secondary', className)}
    />
  )
}
