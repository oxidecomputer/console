/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { BigNum } from '~/ui/lib/BigNum'
import { percentage, splitDecimal } from '~/util/math'

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
  const unitElt = includeUnit ? <>&nbsp;{unit}</> : null

  return (
    <div className="w-full min-w-min rounded-lg border border-default lg+:max-w-[50%]">
      <div className="flex justify-between p-3">
        <TitleCell icon={icon} title={title} unit={unit} />
        <PctCell pct={pct} />
      </div>
      <div className="p-3 pb-4 pt-1">
        <Bar pct={pct} />
      </div>
      <div className="flex justify-between border-t border-secondary">
        <ValueCell label={provisionedLabel} value={provisioned} unit={unitElt} />
        <ValueCell label={capacityLabel} value={capacity} unit={unitElt} />
      </div>
    </div>
  )
}

type TitleCellProps = { icon: JSX.Element; title: string; unit: string }
function TitleCell({ icon, title, unit }: TitleCellProps) {
  return (
    <div>
      <div className="flex grow items-center">
        <span className="mr-2 flex h-4 w-4 items-center text-accent">{icon}</span>
        <span className="!normal-case text-mono-sm text-default">{title}</span>
        <span className="ml-1 !normal-case text-mono-sm text-tertiary">({unit})</span>
      </div>
    </div>
  )
}

function PctCell({ pct }: { pct: number }) {
  // NaN happens when both top and bottom are 0
  if (Number.isNaN(pct)) {
    return (
      <div className="flex -translate-y-0.5 items-baseline text-tertiary">
        <div className="font-light text-sans-2xl text-raise">—</div>
        <div className="text-sans-xl">%</div>
      </div>
    )
  }

  const [wholeNumber, decimal] = splitDecimal(pct)
  return (
    <div className="flex -translate-y-0.5 items-baseline">
      <div className="font-light text-sans-2xl text-raise">{wholeNumber}</div>
      <div className="text-sans-xl text-tertiary">{decimal}%</div>
    </div>
  )
}

function Bar({ pct }: { pct: number }) {
  return (
    <div className="flex w-full gap-0.5">
      <div
        className="h-3 rounded-l border bg-accent-secondary border-accent-secondary"
        style={{ width: `${pct.toFixed(2)}%` }}
      ></div>
      <div className="h-3 grow rounded-r border bg-info-secondary border-info-secondary"></div>
    </div>
  )
}

type ValueCellProps = {
  label: string
  value: number | bigint
  unit: React.ReactNode
}

function ValueCell({ label, value, unit }: ValueCellProps) {
  return (
    <div className="p-3 text-mono-sm">
      <div className="mb-px text-tertiary">{label}</div>
      <div className="!normal-case text-default">
        <BigNum num={value} />
        {unit}
      </div>
    </div>
  )
}
