/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { useIsFetching } from '@tanstack/react-query'
import { createContext, useContext, type ReactNode } from 'react'

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
}>({ startTime, endTime, dateTimeRangePicker: <></>, intervalPicker: <></> })

export const useMetricsContext = () => useContext(MetricsContext)

export const MetricsTab = () => {
  const { project, instance } = useInstanceSelector()

  const { preset, onRangeChange, startTime, endTime, dateTimeRangePicker } =
    useDateTimeRangePicker({
      initialPreset: 'lastHour',
    })

  const { intervalPicker } = useIntervalPicker({
    enabled: preset !== 'custom',
    isLoading: useIsFetching({ queryKey: ['siloMetric'] }) > 0,
    // sliding the range forward is sufficient to trigger a refetch
    fn: () => onRangeChange(preset),
    isSlim: true,
  })

  // Find the relevant <Outlet> in RouteTabs
  return (
    <MetricsContext.Provider
      value={{ startTime, endTime, dateTimeRangePicker, intervalPicker }}
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
