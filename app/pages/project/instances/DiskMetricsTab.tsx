/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { useMemo, useState } from 'react'
import { type LoaderFunctionArgs } from 'react-router'

import {
  api,
  apiq,
  queryClient,
  usePrefetchedQuery,
  type Disk,
  type Instance,
} from '@oxide/api'
import { Storage24Icon } from '@oxide/design-system/icons/react'

import {
  MetricCollection,
  MetricHeader,
  MetricRow,
  OxqlMetric,
} from '~/components/oxql-metrics/OxqlMetric'
import type { OxqlQuery } from '~/components/oxql-metrics/util'
import { getInstanceSelector, useInstanceSelector } from '~/hooks/use-params'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { Listbox } from '~/ui/lib/Listbox'
import { TableEmptyBox } from '~/ui/lib/Table'

import { useMetricsContext } from './common'

export async function clientLoader({ params }: LoaderFunctionArgs) {
  const { project, instance } = getInstanceSelector(params)
  await queryClient.prefetchQuery(
    apiq(api.methods.instanceDiskList, { path: { instance }, query: { project } })
  )
  return null
}

// out here so we don't have to memoize it
const groupByAttachedInstanceId = { cols: ['attached_instance_id'], op: 'sum' } as const

export default function DiskMetricsTab() {
  const { project, instance } = useInstanceSelector()
  const { data: disks } = usePrefetchedQuery(
    apiq(api.methods.instanceDiskList, { path: { instance }, query: { project } })
  )

  const { data: instanceData } = usePrefetchedQuery(
    apiq(api.methods.instanceView, { path: { instance }, query: { project } })
  )
  if (disks.items.length === 0) {
    return (
      <TableEmptyBox border={false}>
        <EmptyMessage
          icon={<Storage24Icon />}
          title="No disk metrics available"
          body="Disk metrics are only available if there are disks attached"
        />
      </TableEmptyBox>
    )
  }

  return <DiskMetrics disks={disks.items} instance={instanceData} />
}

/** Only rendered if there is at least one disk in the list */
function DiskMetrics({ disks, instance }: { disks: Disk[]; instance: Instance }) {
  const { startTime, endTime, dateTimeRangePicker } = useMetricsContext()

  const diskItems = useMemo(
    () => [
      { label: 'All disks', value: 'all' },
      ...disks.map(({ name, id }) => ({ label: name, value: id })),
    ],
    [disks]
  )

  const [selectedDisk, setSelectedDisk] = useState(diskItems.at(0)!.value)

  const queryBase: Omit<OxqlQuery, 'metricName'> = {
    startTime,
    endTime,
    eqFilters: useMemo(
      () => ({
        attached_instance_id: instance.id,
        disk_id: selectedDisk === 'all' ? undefined : selectedDisk,
      }),
      [instance.id, selectedDisk]
    ),
    groupBy: selectedDisk === 'all' ? groupByAttachedInstanceId : undefined,
  }

  return (
    <>
      <MetricHeader>
        <div className="flex gap-2">
          <Listbox
            className="w-52"
            aria-label="Choose disk"
            name="disk-name"
            selected={selectedDisk}
            items={diskItems}
            onChange={(value) => setSelectedDisk(value)}
          />
        </div>
        {dateTimeRangePicker}
      </MetricHeader>
      <MetricCollection>
        {/* see the following link for the source of truth on what these mean
            https://github.com/oxidecomputer/crucible/blob/258f162b/upstairs/src/stats.rs#L9-L50 */}

        {/* TODO: Add virtual_disk:io_latency once you can render histograms */}

        <MetricRow>
          <OxqlMetric
            title="Disk Reads"
            metricName="virtual_disk:reads"
            unit="Count"
            {...queryBase}
          />
          <OxqlMetric
            title="Disk Writes"
            metricName="virtual_disk:writes"
            unit="Count"
            {...queryBase}
          />
        </MetricRow>

        <MetricRow>
          <OxqlMetric
            title="Bytes Read"
            metricName="virtual_disk:bytes_read"
            unit="Bytes"
            {...queryBase}
          />
          <OxqlMetric
            title="Bytes Written"
            metricName="virtual_disk:bytes_written"
            unit="Bytes"
            {...queryBase}
          />
        </MetricRow>

        <MetricRow>
          <OxqlMetric
            title="Disk Flushes"
            metricName="virtual_disk:flushes"
            unit="Count"
            {...queryBase}
          />
        </MetricRow>
      </MetricCollection>
    </>
  )
}
