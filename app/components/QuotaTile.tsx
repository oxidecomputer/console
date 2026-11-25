/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import type { ReactNode } from 'react'

import type { VirtualResourceCounts } from '@oxide/api'
import { Cpu16Icon, Ram16Icon, Ssd16Icon } from '@oxide/design-system/icons/react'

import { BigNum } from '~/ui/lib/BigNum'
import { percentage, round, splitDecimal } from '~/util/math'
import { formatBytes, GiB, TiB } from '~/util/units'

type Resource = {
  icon: ReactNode
  title: string
  unit: 'vCPUs' | 'GiB' | 'TiB'
  provisioned: number
  quota: number
}

function getResources(
  provisioned: VirtualResourceCounts,
  allocated: VirtualResourceCounts,
  storageUnit: 'GiB' | 'TiB'
): Resource[] {
  return [
    {
      icon: <Cpu16Icon />,
      title: 'CPU',
      unit: 'vCPUs',
      provisioned: provisioned.cpus,
      quota: allocated.cpus,
    },
    {
      icon: <Ram16Icon />,
      title: 'Memory',
      unit: 'GiB',
      provisioned: provisioned.memory,
      quota: allocated.memory,
    },
    {
      icon: <Ssd16Icon />,
      title: 'Storage',
      unit: storageUnit,
      provisioned: provisioned.storage,
      quota: allocated.storage,
    },
  ]
}

const IconBox = ({ children }: { children: ReactNode }) => (
  <div className="text-accent light:text-accent-tertiary bg-accent flex size-8 shrink-0 items-center justify-center rounded-md">
    {children}
  </div>
)

function Pct({ pct, decimalClass }: { pct: number; decimalClass: string }) {
  // NaN when provisioned and quota are both 0, Infinity when only quota is 0
  if (!Number.isFinite(pct)) {
    return (
      <span className="text-tertiary">
        <span className="text-raise">—</span>%
      </span>
    )
  }
  const [wholeNumber, decimal] = splitDecimal(pct)
  return (
    <span>
      <span className="text-raise">{wholeNumber}</span>
      <span className={`text-tertiary ${decimalClass}`}>{decimal}%</span>
    </span>
  )
}

function Bar({ pct }: { pct: number }) {
  // provisioned can exceed the quota if the quota was lowered below current usage
  const width = Number.isNaN(pct) ? 0 : Math.min(pct, 100)
  return (
    <div className="flex w-full gap-0.5">
      <div
        className="bg-accent-secondary border-accent-secondary h-3 rounded-l-md border"
        style={{ width: `${width.toFixed(2)}%` }}
      />
      <div className="bg-info-secondary border-info-secondary h-3 grow rounded-r-md border" />
    </div>
  )
}

const unitSize = { vCPUs: 1, GiB, TiB }

function QuotaAmount({
  value,
  unit,
  unitClassName,
}: {
  value: number
  /** Leave out for a plain count shown without a unit */
  unit?: Resource['unit']
  unitClassName?: string
}) {
  const size = unit ? unitSize[unit] : 1
  // Only byte units have a size over 1. Two decimals lose too much below 1 of
  // the tile's unit, so use a smaller one.
  const small = size > 1 && value > 0 && value < size ? formatBytes(value) : undefined
  return (
    <>
      <BigNum num={small ? Number(small.value) : round(value / size, 2)} />
      {unit && <span className={unitClassName}> {small?.unit ?? unit}</span>}
    </>
  )
}

type QuotaTileProps = Resource & {
  showBar?: boolean
}

function QuotaTile({ icon, title, unit, provisioned, quota, showBar }: QuotaTileProps) {
  const available = quota - provisioned
  const pct = percentage(provisioned, quota)
  // byte amounts can be in a smaller unit than the quota, but a count can't
  const amountUnit = unit === 'vCPUs' ? undefined : unit
  return (
    <section
      aria-label={title}
      className="border-default bg-default w-full min-w-min rounded-lg border"
    >
      <div className="flex items-end justify-between gap-3 p-4">
        <div className="flex items-center gap-3">
          <IconBox>{icon}</IconBox>
          <div>
            <div className="text-mono-sm text-secondary">{title}</div>
            <span className="text-sans-xl text-raise -mt-0.5">
              <QuotaAmount
                value={quota}
                unit={unit}
                unitClassName="text-sans-md text-tertiary"
              />
            </span>
          </div>
        </div>
        <div className="text-sans-2xl font-light">
          <Pct pct={pct} decimalClass="text-sans-xl" />
        </div>
      </div>
      {showBar && (
        <div className="px-4 pb-4">
          <Bar pct={pct} />
        </div>
      )}
      <div className="border-secondary text-mono-sm flex justify-between border-t p-4">
        <div>
          <div className="text-tertiary">Provisioned</div>
          <div className="text-default normal-case!">
            <QuotaAmount value={provisioned} unit={amountUnit} />
          </div>
        </div>
        {available < 0 ? (
          <div className="text-right">
            <div className="text-error">Over quota</div>
            <div className="text-error normal-case!">
              <QuotaAmount value={-available} unit={amountUnit} />
            </div>
          </div>
        ) : (
          <div className="text-right">
            <div className="text-tertiary">Available</div>
            <div className="text-default normal-case!">
              <QuotaAmount value={available} unit={amountUnit} />
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

type QuotaTilesProps = {
  provisioned: VirtualResourceCounts
  allocated: VirtualResourceCounts
  storageUnit: 'GiB' | 'TiB'
  showBar?: boolean
}

export const QuotaTiles = ({
  provisioned,
  allocated,
  storageUnit,
  showBar,
}: QuotaTilesProps) => (
  <div className="1000:grid-cols-3 grid grid-cols-1 gap-3">
    {getResources(provisioned, allocated, storageUnit).map((r) => (
      <QuotaTile key={r.title} {...r} showBar={showBar} />
    ))}
  </div>
)

/** Compact percent-of-quota tiles, used in the edit quotas side modal */
export const QuotaUsageChips = ({
  provisioned,
  allocated,
}: {
  provisioned: VirtualResourceCounts
  allocated: VirtualResourceCounts
}) => (
  <div className="grid grid-cols-3 gap-2">
    {getResources(provisioned, allocated, 'GiB').map(
      ({ icon, title, provisioned, quota }) => (
        <section
          key={title}
          aria-label={title}
          className="border-default flex items-center gap-3 rounded-lg border p-3"
        >
          <IconBox>{icon}</IconBox>
          <div>
            <div className="text-mono-sm text-secondary">{title}</div>
            <div className="text-sans-xl">
              <Pct pct={percentage(provisioned, quota)} decimalClass="text-sans-md" />
            </div>
          </div>
        </section>
      )
    )}
  </div>
)
