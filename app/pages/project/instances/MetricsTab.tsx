/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { useIsFetching } from '@tanstack/react-query'
import { useState } from 'react'

import { useDateTimeRangePicker } from '~/components/form/fields/DateTimeRangePicker'
import { useIntervalPicker } from '~/components/RefetchIntervalPicker'
import { RouteTabs, Tab } from '~/components/RouteTabs'
import { useInstanceSelector } from '~/hooks/use-params'
import { pb } from '~/util/path-builder'

import { MetricsContext } from './common'

export const handle = { crumb: 'Metrics' }

export default function MetricsTab() {
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
  })

  // memoizing here would be redundant because the only things that cause a
  // render are these values, which would all be in the dep array anyway
  const context = {
    startTime,
    endTime,
    dateTimeRangePicker,
    intervalPicker,
    setIsIntervalPickerEnabled,
  }

  // Find the relevant <Outlet> in RouteTabs
  return (
    <MetricsContext.Provider value={context}>
      <RouteTabs sideTabs tabListClassName="mt-14">
        <Tab to={pb.instanceCpuMetrics({ project, instance })}>CPU</Tab>
        <Tab to={pb.instanceDiskMetrics({ project, instance })}>Disk</Tab>
        <Tab to={pb.instanceNetworkMetrics({ project, instance })}>Network</Tab>
      </RouteTabs>
    </MetricsContext.Provider>
  )
}
