import React from 'react'
import cn from 'classnames'

export interface SeparatorProps {
  className?: string
}
export const Separator = ({ className }: SeparatorProps) => {
  return (
    <hr className={cn(className, '!mx-0 !w-full border-t border-secondary')} />
  )
}
