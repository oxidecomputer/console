/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import tunnel from 'tunnel-rat'

import {
  Pagination as UIPagination,
  type PaginationProps as UIPaginationProps,
} from '~/ui/lib/Pagination'

const Tunnel = tunnel()

export function Pagination(props: UIPaginationProps) {
  return (
    <Tunnel.In>
      <UIPagination className="gutter h-14 py-5" {...props} />
    </Tunnel.In>
  )
}

Pagination.Target = Tunnel.Out
