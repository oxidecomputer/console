import React from 'react'
import type { PaginationProps as UIPaginationProps } from '@oxide/ui'
import { Pagination as UIPagination } from '@oxide/ui'
import ReactDOM from 'react-dom'

interface PaginationProps extends UIPaginationProps {
  target: 'inline' | 'page'
}
/** This component's provided children will be rendered at `#pagination-target` */
export const Pagination = ({ target, ...props }: PaginationProps) => {
  return target === 'page' ? (
    ReactDOM.createPortal(
      <>
        <hr className="ox-pagination-border" />
        <UIPagination className="py-5" {...props} />
      </>,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      document.getElementById('pagination-target')!
    )
  ) : (
    <UIPagination {...props} />
  )
}
