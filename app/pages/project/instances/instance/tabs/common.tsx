/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { createContext, ReactNode, useContext } from 'react'

import { intersperse } from '~/util/array'
import { invariant } from '~/util/invariant'

const white = (s: string) => (
  <span key={s} className="text-raise">
    {s}
  </span>
)

export const fancifyStates = (states: string[]) =>
  intersperse(states.map(white), <>, </>, <> or </>)

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
