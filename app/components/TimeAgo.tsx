/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { Placement } from '@floating-ui/react'
import { format } from 'date-fns'

import { Tooltip } from '@oxide/ui'

import { timeAgoAbbr } from 'app/util/date'

export const TimeAgo = ({
  datetime,
  description,
  placement = 'top',
}: {
  datetime: Date
  description?: string
  placement?: Placement
}): JSX.Element => {
  const content = (
    <div className="flex flex-col">
      <span className="text-tertiary">{description}</span>
      <span>{format(datetime, 'MMM d, yyyy p')}</span>
    </div>
  )
  return (
    <span className="mt-0.5">
      <Tooltip content={content} placement={placement}>
        <span className="text-sans-sm text-tertiary">{timeAgoAbbr(datetime)}</span>
      </Tooltip>
    </span>
  )
}
