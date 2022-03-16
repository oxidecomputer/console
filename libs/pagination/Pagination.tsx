import React from 'react'
import type { PaginationProps as UIPaginationProps } from '@oxide/ui'
import { Pagination as UIPagination } from '@oxide/ui'
import tunnel from 'tunnel-rat'

const Tunnel = tunnel()

interface PaginationProps extends UIPaginationProps {
  /** If true pagination will be rendered wherever `Pagination.Target` is included */
  inline?: boolean
}
export function Pagination({ inline = false, ...props }: PaginationProps) {
  if (inline) return <UIPagination {...props} />

  return (
    <Tunnel.In>
      <hr className="ox-pagination-border" />
      <UIPagination className="py-5" {...props} />
    </Tunnel.In>
  )
}

Pagination.Target = Tunnel.Out as () => React.ReactElement
