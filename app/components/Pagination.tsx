/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import {
  Pagination as UIPagination,
  type PaginationProps as UIPaginationProps,
} from '~/ui/lib/Pagination'

import { PageFooter } from './PageFooter'

export function Pagination(props: UIPaginationProps) {
  return (
    <PageFooter>
      <UIPagination className="gutter h-14 py-5" {...props} />
    </PageFooter>
  )
}
