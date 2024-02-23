/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import cn from 'classnames'

import { Tooltip } from './Tooltip'

type ResourceMeterProps = {
  value: number
  warningThreshold?: number
  errorThreshold?: number
}

/**
 * Show "percent used" relative to "total available"
 *
 * This is a vertical indicator showing how a resource's usage compares with
 * the total amount of the resource available. Note that the current
 * configuration of this component has "low usage" showing as "positive" (green)
 * with warning (yellow) and error (red) thresholds at "high usage" levels.
 */
export const ResourceMeter = ({
  value,
  warningThreshold = 66,
  errorThreshold = 75,
}: ResourceMeterProps) => {
  const usagePercent = `${value.toFixed(2)}%`
  const label = `${usagePercent} used`
  // prettier-ignore
  const fg =
    value > errorThreshold ? 'bg-destructive'
    : value > warningThreshold ? 'bg-notice'
    : 'bg-accent'

  const bg =
    value > errorThreshold
      ? 'bg-destructive-secondary'
      : value > warningThreshold
        ? 'bg-notice-secondary'
        : 'bg-accent-secondary'
  return (
    <Tooltip content={label} placement="top">
      <div
        aria-label={label}
        className={cn('flex h-5 w-1.5 flex-col justify-end rounded-[1px]', bg)}
      >
        <div
          className={cn('w-full rounded-[1px]', fg)}
          style={{ height: usagePercent }}
        ></div>
      </div>
    </Tooltip>
  )
}
