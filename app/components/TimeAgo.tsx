/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { format } from 'date-fns'

import { Tooltip } from '@oxide/ui'

import { timeAgoAbbr } from 'app/util/date'

export const TimeAgo = ({
  datetime,
  description,
}: {
  datetime: Date
  description?: string
}): JSX.Element => {
  const content = (
    <div className="flex flex-col">
      <span className="text-tertiary">{description}</span>
      <span>{format(datetime, 'MMM d, yyyy p')}</span>
    </div>
  )
  return (
    <Tooltip content={content} placement="top">
      <div className="text-sans-sm text-tertiary">{timeAgoAbbr(datetime)}</div>
    </Tooltip>
  )
}
