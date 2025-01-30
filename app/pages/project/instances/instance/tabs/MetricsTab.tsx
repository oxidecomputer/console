/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import React, { useMemo, useState } from 'react'
import { Link, type LoaderFunctionArgs } from 'react-router'

import { apiQueryClient, usePrefetchedApiQuery } from '@oxide/api'
import { Storage24Icon } from '@oxide/design-system/icons/react'

import { useDateTimeRangePicker } from '~/components/form/fields/DateTimeRangePicker'
import { getInstanceSelector, useInstanceSelector } from '~/hooks/use-params'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { Listbox } from '~/ui/lib/Listbox'
import { TableEmptyBox } from '~/ui/lib/Table'
import { pb } from '~/util/path-builder'

import { OxqlMetric } from './MetricsTab/OxqlMetric'

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

Component.displayName = 'MetricsTab'
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
  const disks = useMemo(() => data?.items || [], [data])

  const { startTime, endTime, dateTimeRangePicker } = useDateTimeRangePicker({
    initialPreset: 'lastDay',
  })

  // The fallback here is kind of silly — it is only invoked when there are no
  // disks, in which case we show the fallback UI and diskName is never used. We
  // only need to do it this way because hooks cannot be called conditionally.
  const [diskName, setDiskName] = useState<string>(disks[0]?.name || '')
  const [diskId, setDiskId] = useState<string>(disks[0]?.id || '')
  const diskItems = disks.map(({ name }) => ({ label: name, value: name }))

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
    diskId,
  }

  return (
    <div className="flex gap-8">
      <div className="flex w-[160px] flex-shrink-0 flex-col gap-2">
        <Link to={pb.instanceMetrics({ project, instance })}>CPU</Link>
        <Link to={pb.instanceMetrics({ project, instance })}>Utilization</Link>
        <Link to={pb.instanceMetrics({ project, instance })}>Time</Link>
        <Link to={pb.instanceMetrics({ project, instance })}>Disk</Link>
        <Link to={pb.instanceMetrics({ project, instance })}>Network</Link>
      </div>
      <div className="flex-grow">
        <div className="mb-4 flex justify-between">
          <Listbox
            className="w-64"
            aria-label="Choose disk"
            name="disk-name"
            selected={diskName}
            items={diskItems}
            onChange={(val) => {
              if (val) {
                setDiskName(val)
                setDiskId(disks.find((d) => d.name === val)?.id || '')
              }
            }}
          />
          {dateTimeRangePicker}
        </div>
        <div className="mt-8 space-y-12">
          {/* see the following link for the source of truth on what these mean
            https://github.com/oxidecomputer/crucible/blob/258f162b/upstairs/src/stats.rs#L9-L50 */}

          <div className="flex w-full space-x-4">
            <OxqlMetric
              {...commonProps}
              title="Reads"
              unit="Count"
              metricName="virtual_disk:reads"
            />
            <OxqlMetric
              {...commonProps}
              title="Read"
              unit="Bytes"
              metricName="virtual_disk:bytes_read"
            />
          </div>

          <div className="flex w-full space-x-4">
            <OxqlMetric
              {...commonProps}
              title="Writes"
              unit="Count"
              metricName="virtual_disk:writes"
            />
            <OxqlMetric
              {...commonProps}
              title="Write"
              unit="Bytes"
              metricName="virtual_disk:bytes_written"
            />
          </div>

          <div className="flex w-full space-x-4">
            <OxqlMetric
              {...commonProps}
              title="Flushes"
              unit="Count"
              metricName="virtual_disk:flushes"
            />
          </div>

          <div className="flex w-full space-x-4">
            <OxqlMetric
              startTime={startTime}
              endTime={endTime}
              title="CPU Utilization: Running"
              unit="%"
              metricName="virtual_machine:vcpu_usage"
              state="run"
              instanceId={instanceData.id}
              join
            />
            <OxqlMetric
              startTime={startTime}
              endTime={endTime}
              title="CPU Utilization: Idling"
              unit="%"
              metricName="virtual_machine:vcpu_usage"
              state="idle"
              instanceId={instanceData.id}
              join
            />
          </div>

          <div className="flex w-full space-x-4">
            <OxqlMetric
              startTime={startTime}
              endTime={endTime}
              title="CPU Utilization: Waiting"
              unit="%"
              metricName="virtual_machine:vcpu_usage"
              state="waiting"
              instanceId={instanceData.id}
              join
            />
            <OxqlMetric
              startTime={startTime}
              endTime={endTime}
              title="CPU Utilization: Emulation"
              unit="%"
              metricName="virtual_machine:vcpu_usage"
              state="emulation"
              instanceId={instanceData.id}
              join
            />
          </div>
          <div className="flex w-full space-x-4">
            <OxqlMetric
              startTime={startTime}
              endTime={endTime}
              title="CPU Utilization"
              unit="%"
              metricName="virtual_machine:vcpu_usage"
              instanceId={instanceData.id}
              join
            />
          </div>
        </div>
      </div>
    </div>
  )
}
