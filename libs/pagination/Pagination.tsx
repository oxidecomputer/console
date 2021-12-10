import React from 'react'
import type { PaginationProps as UIPaginationProps } from '@oxide/ui'
import { Pagination as UIPagination } from '@oxide/ui'
import ReactDOM from 'react-dom'

interface PaginationProps extends UIPaginationProps {
  target: 'inline' | 'page'
}
/** This component's provided children will be rendered at `#pagination-target` */
export const Pagination = ({ target, ...props }: PaginationProps) => {
  const domNode = document.getElementById('pagination-target')

  return target === 'page' && domNode
    ? ReactDOM.createPortal(
        <>
          <hr className="!col-span-3 border-gray-400" />
          <UIPagination className="py-5" {...props} />
        </>,
        domNode
      )
    : null
}
