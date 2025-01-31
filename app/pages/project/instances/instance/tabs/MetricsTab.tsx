/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import React from 'react'
import { Link, Outlet } from 'react-router'

import { useInstanceSelector } from '~/hooks/use-params'
import { pb } from '~/util/path-builder'

export const MetricsTab = () => {
  const { project, instance } = useInstanceSelector()
  return (
    <div className="flex gap-8">
      <div className="flex w-[160px] flex-shrink-0 flex-col gap-2">
        <Link to={pb.instanceCpuMetrics({ project, instance })}>CPU</Link>
        <Link to={pb.instanceMetrics({ project, instance })}>Utilization</Link>
        <Link to={pb.instanceMetrics({ project, instance })}>Time</Link>
        <Link to={pb.instanceDiskMetrics({ project, instance })}>Disk</Link>
        <Link to={pb.instanceNetworkMetrics({ project, instance })}>Network</Link>
      </div>
      <div className="flex-grow">
        <Outlet />
      </div>
    </div>
  )
}
