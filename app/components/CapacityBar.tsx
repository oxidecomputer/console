/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { displayBigNum, percentage, splitDecimal } from '~/util/math'

export const CapacityBar = <T extends number | bigint>({
  icon,
  title,
  unit,
  provisioned,
  capacity,
  capacityLabel,
  provisionedLabel = 'Provisioned',
  includeUnit = true,
}: {
  icon: JSX.Element
  title: string
  unit: string
  provisioned: T
  capacity: T
  provisionedLabel?: string
  capacityLabel: string
  includeUnit?: boolean
}) => {
  const pct = percentage(provisioned, capacity)
  const [wholeNumber, decimal] = splitDecimal(pct)

  return (
    <div className="w-full min-w-min rounded-lg border border-default">
      <div className="flex p-3">
        {/* the icon, title, and hero datum */}
        <div className="-ml-0.5 mr-1 flex h-6 w-6 items-start justify-center text-accent">
          {icon}
        </div>
        <div className="flex flex-grow items-start">
          <span className="!normal-case text-mono-sm text-secondary">{title}</span>
          <span className="ml-1 !normal-case text-mono-sm text-quaternary">({unit})</span>
        </div>
        <div className="flex -translate-y-0.5 items-baseline">
          <div className="font-light text-sans-2xl">{wholeNumber}</div>
          <div className="text-sans-xl text-quaternary">{decimal}%</div>
        </div>
      </div>
      <div className="p-3 pt-1">
        {/* the bar */}
        <div className="flex w-full gap-0.5">
          <div
            className="h-3 rounded-l border bg-accent-secondary border-accent-secondary"
            style={{ width: `${pct.toFixed(2)}%` }}
          ></div>
          <div className="h-3 grow rounded-r border bg-info-secondary border-info-secondary"></div>
        </div>
      </div>
      <div>
        <div className="flex justify-between border-t border-secondary">
          <div className="p-3 text-mono-sm">
            <div className="text-quaternary">{provisionedLabel}</div>
            <div className="text-secondary">
              {displayBigNum(provisioned)}
              <span className="normal-case">{includeUnit ? ' ' + unit : ''}</span>
            </div>
          </div>
          <div className="p-3 text-mono-sm">
            <div className="text-quaternary">{capacityLabel}</div>
            <div className="!normal-case text-secondary">
              {displayBigNum(capacity)}
              <span className="normal-case">{includeUnit ? ' ' + unit : ''}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
