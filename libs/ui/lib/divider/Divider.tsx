import React from 'react'
import cn from 'classnames'

export interface DividerProps {
  className?: string
}
export const Divider = ({ className }: DividerProps) => {
  return (
    <hr
      className={cn(
        'ox-divider',
        className,
        'w-full border-t border-secondary'
      )}
    />
  )
}
