/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { splitDecimal } from '@oxide/util'

export const CapacityBar = ({
  icon,
  title,
  unit,
  provisioned,
  allocated,
  allocatedLabel,
  includeUnit = true,
}: {
  icon: JSX.Element
  title: 'CPU' | 'Memory' | 'Storage'
  unit: 'nCPUs' | 'GiB' | 'TiB'
  provisioned: number
  allocated: number
  allocatedLabel: string
  includeUnit?: boolean
}) => {
  const percentOfAllocatedUsed = (provisioned / allocated) * 100
  const [wholeNumber, decimal] = splitDecimal(percentOfAllocatedUsed)
  const formattedPercentUsed = `${percentOfAllocatedUsed}%`
  const warningThreshold = 66
  const errorThreshold = 75

  const barColor =
    percentOfAllocatedUsed > errorThreshold
      ? 'bg-destructive-secondary border-destructive-secondary'
      : percentOfAllocatedUsed > warningThreshold
      ? 'bg-notice-secondary border-notice-secondary'
      : 'bg-accent-secondary border-accent-secondary'

  return (
    <div className="w-full min-w-min rounded-lg border border-default">
      <div className="flex p-3">
        {/* the icon, title, and hero datum */}
        <div className="-ml-0.5 mr-1 flex h-6 w-6 items-start justify-center text-accent">
          {icon}
        </div>
        <div className="flex flex-grow items-start">
          <span className="text-mono-sm text-secondary">{title}</span>
          <span className="ml-1 !normal-case text-mono-sm text-quaternary">({unit})</span>
        </div>
        <div className="flex -translate-y-0.5 items-baseline">
          <div className="font-light text-sans-2xl">{wholeNumber.toLocaleString()}</div>
          <div className="text-sans-xl text-quaternary">{decimal || ''}%</div>
        </div>
      </div>
      <div className="p-3 pt-1">
        {/* the bar */}
        <div className="flex w-full gap-0.5">
          <div
            className={`h-3 rounded-l border ${barColor}`}
            style={{ width: formattedPercentUsed }}
          ></div>
          <div className="h-3 grow rounded-r border bg-info-secondary border-info-secondary"></div>
        </div>
      </div>
      <div>
        <div className="flex justify-between border-t border-secondary">
          <div className="p-3 text-mono-sm">
            <div className="text-quaternary">Provisioned</div>
            <div className="text-secondary">
              {provisioned.toLocaleString()}
              <span className="normal-case">{includeUnit ? ' ' + unit : ''}</span>
            </div>
          </div>
          <div className="p-3 text-mono-sm">
            <div className="text-quaternary">{allocatedLabel}</div>
            <div className="text-secondary">
              {allocated.toLocaleString()}
              <span className="normal-case">{includeUnit ? ' ' + unit : ''}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
