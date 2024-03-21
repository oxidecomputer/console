/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { Cpu16Icon, Ram16Icon, Ssd16Icon } from '@oxide/design-system/icons/react'

import type { VirtualResourceCounts } from '~/api'
import { classed } from '~/util/classed'
import { splitDecimal } from '~/util/math'
import { bytesToGiB, bytesToTiB } from '~/util/units'

const CapacityBarContainer = classed.div`w-full min-w-min rounded-lg border border-default`
const CapacityBarHeader = classed.div`flex p-3`
const CapacityBarIcon = classed.div`-ml-0.5 mr-1 flex h-6 w-6 items-start justify-center text-accent`

const CapacityBarLabel = ({ label, unit }: { label: string; unit: string }) => (
  <div className="flex flex-grow items-start">
    <span className="text-mono-sm text-secondary">{label}</span>
    <span className="ml-1 !normal-case text-mono-sm text-quaternary">({unit})</span>
  </div>
)

const CapacityBarHeroNumber = ({ percentUsed }: { percentUsed: number }) => {
  const [wholeNumber, decimal] = splitDecimal(percentUsed)
  return (
    <div className="flex -translate-y-0.5 items-baseline">
      <div className="font-light text-sans-2xl">{wholeNumber}</div>
      <div className="text-sans-xl text-quaternary">{decimal}%</div>
    </div>
  )
}

const CapacityBarChart = ({ percentUsed }: { percentUsed: number }) => (
  <div className="p-3 pt-1">
    <div className="flex w-full gap-0.5">
      <div
        className="h-3 rounded-l border bg-accent-secondary border-accent-secondary"
        style={{ width: `${percentUsed}%` }}
      ></div>
      <div className="h-3 grow rounded-r border bg-info-secondary border-info-secondary"></div>
    </div>
  </div>
)

const CapacityBarNumberParts = classed.div`flex justify-between border-t border-secondary`

const CapacityBarNumberPart = ({
  label,
  amount,
  unit,
}: {
  label: string
  amount: number
  unit: string
}) => {
  const includeUnit = unit !== unitOptions.cpus
  return (
    <div className="p-3 text-mono-sm">
      <div className="text-quaternary">{label}</div>
      <div className="text-secondary">
        {amount.toLocaleString()}
        <span className="normal-case">{includeUnit ? ' ' + unit : ''}</span>
      </div>
    </div>
  )
}

type CapacityBarKind = 'cpus' | 'memory' | 'storage'

const titleOptions = {
  cpus: 'CPU',
  memory: 'Memory',
  storage: 'Storage',
}

const unitOptions = {
  cpus: 'nCPUs',
  memory: 'GiB',
  storage: 'TiB',
}

const iconOptions = {
  cpus: <Cpu16Icon />,
  memory: <Ram16Icon />,
  storage: <Ssd16Icon />,
}

const getCapacityBarSubAmount = (
  kind: CapacityBarKind,
  rawCounts: VirtualResourceCounts
) => {
  if (kind === 'cpus') {
    return rawCounts.cpus
  }
  if (kind === 'memory') {
    return bytesToGiB(rawCounts.memory)
  }
  return bytesToTiB(rawCounts.storage)
}

export type CapacityBarProps = {
  kind: CapacityBarKind
  provisioned: VirtualResourceCounts
  allocated: VirtualResourceCounts
  allocatedLabel: 'Quota' | 'Quota (Total)'
}

/**
 * Shows a visual representation of the capacity and utilization of a resource.
 * "provisioned" is the amount of the resource being used at this layer of the service
 * "allocated" is the total amount of the resource available to this layer, as defined by the parent layer
 */
export const CapacityBar = ({
  kind,
  provisioned,
  allocated,
  allocatedLabel,
}: CapacityBarProps) => {
  const unit = unitOptions[kind]
  const provisionedAmount = getCapacityBarSubAmount(kind, provisioned)
  const allocatedAmount = getCapacityBarSubAmount(kind, allocated)
  const percentUsed = (provisionedAmount / allocatedAmount) * 100

  return (
    <CapacityBarContainer>
      <CapacityBarHeader>
        <CapacityBarIcon>{iconOptions[kind]}</CapacityBarIcon>
        <CapacityBarLabel label={titleOptions[kind]} unit={unit} />
        <CapacityBarHeroNumber percentUsed={percentUsed} />
      </CapacityBarHeader>
      <CapacityBarChart percentUsed={percentUsed} />
      <CapacityBarNumberParts>
        <CapacityBarNumberPart label="Provisioned" amount={provisionedAmount} unit={unit} />
        <CapacityBarNumberPart
          label={allocatedLabel}
          amount={allocatedAmount}
          unit={unit}
        />
      </CapacityBarNumberParts>
    </CapacityBarContainer>
  )
}
