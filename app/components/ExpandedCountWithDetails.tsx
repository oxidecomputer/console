/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { Tooltip } from '~/ui/lib/Tooltip'

type ExpandedCountWithDetailsProps = {
  count: number
  title: string
  details: React.ReactNode
}

/**
 * Gives a count with a tooltip that expands to show details when the user hovers over it
 */
export const ExpandedCountWithDetails = ({
  count,
  title,
  details,
}: ExpandedCountWithDetailsProps) => {
  const content = (
    <div>
      <div className="mb-2">{title}</div>
      {details}
    </div>
  )
  return (
    <Tooltip content={content} placement="bottom">
      <div className="text-mono-sm">+{count}</div>
    </Tooltip>
  )
}
