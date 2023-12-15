/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { splitDecimal } from '@oxide/util'

// exported to use in the loader because it needs to be identical
export const capacityQueryParams = {
  // beginning of time, aka 1970
  startTime: new Date(0),
  // kind of janky to use pageload time. we can think about making it live
  // later. ideally refetch would be coordinated with the graphs
  endTime: new Date(),
  limit: 1,
  order: 'descending' as const,
}

export const CapacityBar = ({
  icon,
  title,
  unit,
  provisioned,
  quota,
}: {
  icon: JSX.Element
  title: 'CPU' | 'Disk' | 'Memory'
  unit: 'nCPUs' | 'GiB' | 'TiB'
  provisioned: number
  quota: number
}) => {
  const percentOfQuotaUsed = (provisioned / quota) * 100
  const [wholeNumber, decimal] = splitDecimal(percentOfQuotaUsed)

  const formattedPercentUsed = `${percentOfQuotaUsed}%`

  const UtilizationDatum = ({
    name,
    amount,
  }: {
    name: 'Provisioned' | 'Quota'
    amount: number
  }) => (
    <div className="p-3 text-mono-sm">
      <div className="text-quaternary">{name}</div>
      <div className="text-secondary">{amount.toLocaleString()}</div>
    </div>
  )

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
            className="h-3 rounded-l border bg-accent-secondary border-accent-secondary"
            style={{ width: formattedPercentUsed }}
          ></div>
          <div className="h-3 grow rounded-r border bg-info-secondary border-info-secondary"></div>
        </div>
      </div>
      <div>
        {/* the more detailed data */}
        <div className="flex justify-between border-t border-secondary">
          <UtilizationDatum name="Provisioned" amount={provisioned} />
          <UtilizationDatum name="Quota" amount={quota} />
        </div>
      </div>
    </div>
  )
}
