/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import cn from 'classnames'

import { invariant, splitDecimal } from '@oxide/util'

export const CapacityBar = ({
  icon,
  title,
  unit,
  provisioned,
  allocated,
  capacity,
  includeUnit = true,
}: {
  icon: JSX.Element
  title: 'CPU' | 'Memory' | 'Storage'
  unit: 'nCPUs' | 'GiB' | 'TiB'
  provisioned: number
  allocated?: number
  capacity?: number
  includeUnit?: boolean
}) => {
  invariant(
    typeof allocated === 'number' || typeof capacity === 'number',
    'CapacityBar must be provided with at least one of allocated or capacity'
  )
  const hasAllocated = Number.isInteger(allocated)
  const hasCapacity = Number.isInteger(capacity)

  const percentOfAllocatedUsed = (provisioned / (allocated || 0)) * 100
  const percentOfCapacityUsed = ((allocated ?? provisioned) / (capacity || 0)) * 100
  const allocatedDisplay = hasAllocated && splitDecimal(percentOfAllocatedUsed)
  const capacityDisplay = hasCapacity && splitDecimal(percentOfCapacityUsed)

  const percentStyling = (percent: number) =>
    isFinite(percent) ? { width: `${percent}%` } : { display: 'none' }

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
        {allocatedDisplay && !capacityDisplay && (
          <div className="flex -translate-y-0.5 items-baseline">
            <div className="font-light text-sans-2xl">
              {allocatedDisplay[0].toLocaleString()}
            </div>
            <div className="text-sans-xl text-quaternary">{allocatedDisplay[1] || ''}%</div>
          </div>
        )}
        {capacityDisplay && (
          <div className="flex -translate-y-0.5 items-baseline">
            <div className="font-light text-sans-2xl">
              {capacityDisplay[0].toLocaleString()}
            </div>
            <div className="text-sans-xl text-quaternary">{capacityDisplay[1] || ''}%</div>
          </div>
        )}
      </div>
      <div className="p-3 pt-1">
        {/* the bar */}
        <div className="flex w-full gap-0.5">
          <div
            className="h-3 rounded-l border bg-accent-secondary border-accent-secondary"
            style={percentStyling(percentOfAllocatedUsed)}
          ></div>
          <div
            className={cn(
              'h-3 rounded-l border',
              hasAllocated
                ? 'bg-secondary border-default'
                : 'bg-accent-secondary border-accent-secondary'
            )}
            style={percentStyling(percentOfCapacityUsed)}
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
          {hasAllocated && (
            <div className="p-3 text-mono-sm">
              <div className="text-quaternary">Quota (Total)</div>
              <div className="text-secondary">
                {allocated?.toLocaleString()}
                <span className="normal-case">{includeUnit ? ' ' + unit : ''}</span>
              </div>
            </div>
          )}
          {hasCapacity && (
            <div className="p-3 text-mono-sm">
              <div className="text-quaternary">Capacity</div>
              <div className="text-secondary">
                {capacity?.toLocaleString()}
                <span className="normal-case">{includeUnit ? ' ' + unit : ''}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
