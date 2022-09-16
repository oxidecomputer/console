import tunnel from 'tunnel-rat'

import type { PaginationProps as UIPaginationProps } from '@oxide/ui'
import { Pagination as UIPagination } from '@oxide/ui'

const Tunnel = tunnel('pagination')

interface PaginationProps extends UIPaginationProps {
  /** If true pagination will be rendered wherever `Pagination.Target` is included */
  inline?: boolean
}
export function Pagination({ inline = false, ...props }: PaginationProps) {
  if (inline) return <UIPagination {...props} />

  return (
    <Tunnel.In>
      <UIPagination className="h-14 py-5 gutter" {...props} />
    </Tunnel.In>
  )
}

Pagination.Target = Tunnel.Out
