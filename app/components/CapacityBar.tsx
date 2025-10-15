/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import type { JSX } from 'react'

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
    <div className="border-default 1000:max-w-1/2 w-full min-w-min rounded-lg border">
      <div className="flex justify-between p-3">
        <TitleCell icon={icon} title={title} unit={unit} />
        <PctCell pct={pct} />
      </div>
      <div className="p-3 pt-1 pb-4">
        <Bar pct={pct} />
      </div>
      <div className="border-secondary flex justify-between border-t">
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
        <span className="text-accent mr-2 flex h-4 w-4 items-center">{icon}</span>
        <span className="text-mono-sm text-default normal-case!">{title}</span>
        <span className="text-mono-sm text-tertiary ml-1 normal-case!">({unit})</span>
      </div>
    </div>
  )
}

function PctCell({ pct }: { pct: number }) {
  // NaN happens when both top and bottom are 0
  if (Number.isNaN(pct)) {
    return (
      <div className="text-tertiary flex -translate-y-0.5 items-baseline">
        <div className="text-sans-2xl text-raise font-light">—</div>
        <div className="text-sans-xl">%</div>
      </div>
    )
  }

  const [wholeNumber, decimal] = splitDecimal(pct)
  return (
    <div className="flex -translate-y-0.5 items-baseline">
      <div className="text-sans-2xl text-raise font-light">{wholeNumber}</div>
      <div className="text-sans-xl text-tertiary">{decimal}%</div>
    </div>
  )
}

function Bar({ pct }: { pct: number }) {
  return (
    <div className="flex w-full gap-0.5">
      <div
        className="bg-accent-secondary border-accent-secondary h-3 rounded-l border"
        style={{ width: `${pct.toFixed(2)}%` }}
      ></div>
      <div className="bg-info-secondary border-info-secondary h-3 grow rounded-r border"></div>
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
    <div className="text-mono-sm p-3">
      <div className="text-tertiary mb-px">{label}</div>
      <div className="text-default normal-case!">
        <BigNum num={value} />
        {unit}
      </div>
    </div>
  )
}
