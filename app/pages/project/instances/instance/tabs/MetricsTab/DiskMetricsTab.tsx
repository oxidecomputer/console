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

import { useDateTimeRangePicker } from '~/components/form/fields/DateTimeRangePicker'
import { getInstanceSelector, useInstanceSelector } from '~/hooks/use-params'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { Listbox } from '~/ui/lib/Listbox'
import { TableEmptyBox } from '~/ui/lib/Table'

import { MetricCollection, MetricHeader, MetricRow, OxqlMetric } from './OxqlMetric'

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
  const { data } = usePrefetchedApiQuery('instanceDiskList', {
    path: { instance },
    query: { project },
  })
  const { data: instanceData } = usePrefetchedApiQuery('instanceView', {
    path: { instance },
    query: { project },
  })
  const instanceId = instanceData?.id
  const disks = useMemo(() => data?.items || [], [data])

  const { startTime, endTime, dateTimeRangePicker } = useDateTimeRangePicker({
    initialPreset: 'lastHour',
  })

  // The fallback here is kind of silly — it is only invoked when there are no
  // disks, in which case we show the fallback UI and diskName is never used. We
  // only need to do it this way because hooks cannot be called conditionally.
  const [diskId, setDiskId] = useState<string>('all')
  const diskItems = [
    { label: 'All', value: 'all' },
    ...disks.map(({ name, id }) => ({ label: name, value: id })),
  ]

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

  const commonProps = {
    startTime,
    endTime,
    attachedInstanceId: instanceId,
    // does this need instanceId as well?
    // Would think so, as these are instance metrics,
    // but maybe the key is the attachedInstanceId
    diskId: diskId === 'all' ? undefined : diskId,
    group: diskId === 'all',
  }

  return (
    <>
      <MetricHeader>
        <Listbox
          className="w-64"
          aria-label="Choose disk"
          name="disk-name"
          selected={diskId}
          items={diskItems}
          onChange={(val) => {
            setDiskId(val)
          }}
        />
        {dateTimeRangePicker}
      </MetricHeader>
      <MetricCollection>
        {/* see the following link for the source of truth on what these mean
            https://github.com/oxidecomputer/crucible/blob/258f162b/upstairs/src/stats.rs#L9-L50 */}

        <MetricRow>
          <OxqlMetric
            {...commonProps}
            title="Disk Reads"
            unit="Count"
            metricName="virtual_disk:reads"
          />
          <OxqlMetric
            {...commonProps}
            title="Disk Writes"
            unit="Count"
            metricName="virtual_disk:writes"
          />
        </MetricRow>

        <MetricRow>
          <OxqlMetric
            {...commonProps}
            title="Bytes Read"
            unit="Bytes"
            metricName="virtual_disk:bytes_read"
          />
          <OxqlMetric
            {...commonProps}
            title="Bytes Written"
            unit="Bytes"
            metricName="virtual_disk:bytes_written"
          />
        </MetricRow>

        <MetricRow>
          <OxqlMetric
            {...commonProps}
            title="Disk Flushes"
            unit="Count"
            metricName="virtual_disk:flushes"
          />
        </MetricRow>
      </MetricCollection>
    </>
  )
}
