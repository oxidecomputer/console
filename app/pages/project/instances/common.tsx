/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { createContext, useContext, type ReactNode } from 'react'
import { match } from 'ts-pattern'

import { diskCan, type Disk } from '@oxide/api'

import { intersperse } from '~/util/array'
import { invariant } from '~/util/invariant'

const white = (s: string) => (
  <span key={s} className="text-raise">
    {s}
  </span>
)

export const fancifyStates = (states: string[]) =>
  intersperse(states.map(white), <>, </>, <> or </>)

/** Returns a disabled reason if the disk cannot be snapshotted, false otherwise */
export function snapshotDisabledReason(disk: Disk): ReactNode {
  if (diskCan.snapshot(disk)) return false
  if (disk.readOnly) return "Read-only disks don't support snapshots"
  return match(disk.diskType)
    .with('distributed', () => (
      <>Only disks in state {fancifyStates(diskCan.snapshot.states)} support snapshots</>
    ))
    .with('local', () => "Local disks don't support snapshots")
    .exhaustive()
}

type MetricsContextValue = {
  startTime: Date
  endTime: Date
  dateTimeRangePicker: ReactNode
  intervalPicker: ReactNode
  setIsIntervalPickerEnabled: (enabled: boolean) => void
}

/**
 * Using context lets the selected time window persist across route tab navs.
 */
export const MetricsContext = createContext<MetricsContextValue | null>(null)

// this lets us init with a null value but rule it out in the consumers
export function useMetricsContext() {
  const value = useContext(MetricsContext)
  invariant(value, 'useMetricsContext can only be called inside a MetricsContext')
  return value
}
