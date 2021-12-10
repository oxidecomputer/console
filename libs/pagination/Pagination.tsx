import React from 'react'
import type { PaginationProps as UIPaginationProps } from '@oxide/ui'
import { Pagination as UIPagination } from '@oxide/ui'

interface PaginationProps extends UIPaginationProps {
  target: 'inline' | 'page'
}
/** This component's provided children will be rendered at `#pagination-target` */
export const Pagination = ({ target, ...props }: PaginationProps) => {
  return target === 'page' ? (
    <>
      <span className="h-16" />
      <hr className="ox-pagination-border" />
      <div className="ox-pagination-container">
        <UIPagination className="py-5" {...props} />
      </div>
    </>
  ) : (
    <UIPagination {...props} />
  )
}
