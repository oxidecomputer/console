/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { Placement } from '@floating-ui/react'

import { Tooltip } from '~/ui/lib/Tooltip'
import { timeAgoAbbr, toLocaleDateTimeString } from '~/util/date'

export const TimeAgo = ({
  datetime,
  tooltipText,
  placement = 'top',
}: {
  datetime: Date
  tooltipText?: string
  placement?: Placement
}): JSX.Element => {
  const content = (
    <div className="flex flex-col">
      <span className="text-tertiary">{tooltipText}</span>
      <span>{toLocaleDateTimeString(datetime)}</span>
    </div>
  )
  return (
    <Tooltip content={content} placement={placement}>
      <span className="text-sans-sm text-tertiary">{timeAgoAbbr(datetime)}</span>
    </Tooltip>
  )
}
