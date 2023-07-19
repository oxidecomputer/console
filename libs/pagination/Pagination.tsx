/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
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
      <UIPagination className="gutter h-14 py-5" {...props} />
    </Tunnel.In>
  )
}

Pagination.Target = Tunnel.Out
