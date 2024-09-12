/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import React from 'react'

import { Tooltip } from '~/ui/lib/Tooltip'

type ListPlusCellProps = {
  tooltipTitle?: string
  children: React.ReactNode
  /** The number of items to show in the cell vs. in the popup */
  numInCell?: number
}

/**
 * Gives a count with a tooltip that expands to show details when the user hovers over it
 */
export const ListPlusCell = ({
  tooltipTitle,
  children,
  numInCell = 1,
}: ListPlusCellProps) => {
  const array = React.Children.toArray(children)
  const inCell = array.slice(0, numInCell)
  const rest = array.slice(numInCell)
  const content = (
    <div>
      {tooltipTitle && <div className="mb-2">{tooltipTitle}</div>}
      <div className="flex flex-col items-start gap-2">{...rest}</div>
    </div>
  )
  return (
    <div className="flex items-baseline gap-2">
      {inCell}
      {rest.length > 0 && (
        <Tooltip content={content} placement="bottom">
          <div className="text-mono-sm">+{rest.length}</div>
        </Tooltip>
      )}
    </div>
  )
}
