/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useMemo, useState } from 'react'
import { type LoaderFunctionArgs } from 'react-router'

import { apiQueryClient, usePrefetchedApiQuery } from '@oxide/api'
import { Storage24Icon } from '@oxide/design-system/icons/react'

import { getInstanceSelector, useInstanceSelector } from '~/hooks/use-params'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { Listbox } from '~/ui/lib/Listbox'
import { TableEmptyBox } from '~/ui/lib/Table'

import { useMetricsContext } from '../MetricsTab'
import {
  getOxqlQuery,
  MetricCollection,
  MetricHeader,
  MetricRow,
  OxqlMetric,
  type OxqlDiskMetricName,
} from './OxqlMetric'

// We could figure out how to prefetch the metrics data, but it would be
// annoying because it relies on the default date range, plus there are 5 calls.
// Considering the data is going to be swapped out as soon as they change the
// date range, I'm inclined to punt.

export async function loader({ params }: LoaderFunctionArgs) {
  const { project, instance } = getInstanceSelector(params)
  await Promise.all([
    apiQueryClient.prefetchQuery('instanceDiskList', {
      path: { instance },
      query: { project },
    }),
    apiQueryClient.prefetchQuery('instanceView', {
      path: { instance },
      query: { project },
    }),
  ])
  return null
}

Component.displayName = 'DiskMetricsTab'
export function Component() {
  const { project, instance } = useInstanceSelector()
  const { data: diskData } = usePrefetchedApiQuery('instanceDiskList', {
    path: { instance },
    query: { project },
  })
  const { data: instanceData } = usePrefetchedApiQuery('instanceView', {
    path: { instance },
    query: { project },
  })
  const instanceId = instanceData?.id
  const disks = useMemo(
    () => [
      { name: 'All disks', id: 'all' },
      ...diskData.items.map(({ name, id }) => ({ name, id })),
    ],
    [diskData]
  )

  const { startTime, endTime, dateTimeRangePicker } = useMetricsContext()

  // The fallback here is kind of silly — it is only invoked when there are no
  // disks, in which case we show the fallback UI and diskName is never used. We
  // only need to do it this way because hooks cannot be called conditionally.
  const [disk, setDisk] = useState(disks[0])
  const items = disks.map(({ name, id }) => ({ label: name, value: id }))

  if (disks.length === 0) {
    return (
      <TableEmptyBox>
        <EmptyMessage
          icon={<Storage24Icon />}
          title="No metrics available"
          body="Metrics are only available if there are disks attached"
        />
      </TableEmptyBox>
    )
  }

  const getQuery = (metricName: OxqlDiskMetricName) =>
    getOxqlQuery({
      metricName,
      startTime,
      endTime,
      attachedInstanceId: instanceId,
      diskId: disk.id === 'all' ? undefined : disk.id,
      group: disk.id === 'all',
    })

  return (
    <>
      <MetricHeader>
        <Listbox
          className="w-64"
          aria-label="Choose disk"
          name="disk-name"
          selected={disk.id}
          items={items}
          onChange={(val) => {
            setDisk({
              name: disks.find((n) => n.id === val)?.name || 'All disks',
              id: val,
            })
          }}
        />
        {dateTimeRangePicker}
      </MetricHeader>
      <MetricCollection>
        {/* see the following link for the source of truth on what these mean
            https://github.com/oxidecomputer/crucible/blob/258f162b/upstairs/src/stats.rs#L9-L50 */}

        <MetricRow>
          <OxqlMetric
            title="Disk Reads"
            query={getQuery('virtual_disk:reads')}
            startTime={startTime}
            endTime={endTime}
          />
          <OxqlMetric
            title="Disk Writes"
            query={getQuery('virtual_disk:writes')}
            startTime={startTime}
            endTime={endTime}
          />
        </MetricRow>

        <MetricRow>
          <OxqlMetric
            title="Bytes Read"
            query={getQuery('virtual_disk:bytes_read')}
            startTime={startTime}
            endTime={endTime}
          />
          <OxqlMetric
            title="Bytes Written"
            query={getQuery('virtual_disk:bytes_written')}
            startTime={startTime}
            endTime={endTime}
          />
        </MetricRow>

        <MetricRow>
          <OxqlMetric
            title="Disk Flushes"
            query={getQuery('virtual_disk:flushes')}
            startTime={startTime}
            endTime={endTime}
          />
        </MetricRow>
      </MetricCollection>
    </>
  )
}
