/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { useIsFetching } from '@tanstack/react-query'
import { createContext, useContext, useState, type ReactNode } from 'react'

import { useDateTimeRangePicker } from '~/components/form/fields/DateTimeRangePicker'
import { useIntervalPicker } from '~/components/RefetchIntervalPicker'
import { RouteTabs, Tab } from '~/components/RouteTabs'
import { useInstanceSelector } from '~/hooks/use-params'
import { pb } from '~/util/path-builder'

// useContext will need default values for startTime and endTime
const oneHourAgo = new Date()
oneHourAgo.setHours(oneHourAgo.getHours() - 1)
const startTime = oneHourAgo
const endTime = new Date()

const MetricsContext = createContext<{
  startTime: Date
  endTime: Date
  dateTimeRangePicker: ReactNode
  intervalPicker: ReactNode
  setIsIntervalPickerEnabled: (enabled: boolean) => void
}>({
  startTime,
  endTime,
  dateTimeRangePicker: <></>,
  intervalPicker: <></>,
  setIsIntervalPickerEnabled: () => {},
})

export const useMetricsContext = () => useContext(MetricsContext)

export const MetricsTab = () => {
  const { project, instance } = useInstanceSelector()
  // this ensures the interval picker (which defaults to reloading every 10s) only kicks in
  // once some initial data have loaded, to prevent requests from stacking up
  const [isIntervalPickerEnabled, setIsIntervalPickerEnabled] = useState(false)

  const { preset, onRangeChange, startTime, endTime, dateTimeRangePicker } =
    useDateTimeRangePicker({
      items: [
        { label: 'Last hour', value: 'lastHour' },
        { label: 'Last 3 hours', value: 'last3Hours' },
        { label: 'Last 24 hours', value: 'lastDay' },
        { label: 'Custom', value: 'custom' },
      ],
      initialPreset: 'lastHour',
    })

  const { intervalPicker } = useIntervalPicker({
    enabled: isIntervalPickerEnabled && preset !== 'custom',
    isLoading: useIsFetching({ queryKey: ['systemTimeseriesQuery'] }) > 0,
    // sliding the range forward is sufficient to trigger a refetch
    fn: () => onRangeChange(preset),
    isSlim: true,
  })

  // Find the relevant <Outlet> in RouteTabs
  return (
    <MetricsContext.Provider
      value={{
        startTime,
        endTime,
        dateTimeRangePicker,
        intervalPicker,
        setIsIntervalPickerEnabled,
      }}
    >
      <RouteTabs sideTabs tabListClassName="mt-24">
        <Tab to={pb.instanceCpuMetrics({ project, instance })} sideTab>
          CPU
        </Tab>
        <Tab to={pb.instanceDiskMetrics({ project, instance })} sideTab>
          Disk
        </Tab>
        <Tab to={pb.instanceNetworkMetrics({ project, instance })} sideTab>
          Network
        </Tab>
      </RouteTabs>
    </MetricsContext.Provider>
  )
}
