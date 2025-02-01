/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { RouteTabs, Tab } from '~/components/RouteTabs'
import { useInstanceSelector } from '~/hooks/use-params'
import { pb } from '~/util/path-builder'

export const MetricsTab = () => {
  const { project, instance } = useInstanceSelector()
  // Find the <Outlet> in RouteSideTabs
  return (
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
  )
}
