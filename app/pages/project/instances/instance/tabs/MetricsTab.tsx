/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { createContext, useContext, type ReactNode } from 'react'

import { useDateTimeRangePicker } from '~/components/form/fields/DateTimeRangePicker'
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
}>({ startTime, endTime, dateTimeRangePicker: <></> })

export const useMetricsContext = () => useContext(MetricsContext)

export const MetricsTab = () => {
  const { project, instance } = useInstanceSelector()

  const { startTime, endTime, dateTimeRangePicker } = useDateTimeRangePicker({
    initialPreset: 'lastHour',
  })

  // Find the <Outlet> in RouteSideTabs
  return (
    <MetricsContext.Provider value={{ startTime, endTime, dateTimeRangePicker }}>
      <RouteTabs sideTabs>
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
