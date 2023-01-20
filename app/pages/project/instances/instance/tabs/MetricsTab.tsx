import { useState } from 'react'
import invariant from 'tiny-invariant'

import type { Cumulativeint64, Disk, DiskMetricName } from '@oxide/api'
import { useApiQuery } from '@oxide/api'
import { Listbox, Spinner } from '@oxide/ui'

import { TimeSeriesLineChart } from 'app/components/TimeSeriesChart'
import { useDateTimeRangePicker } from 'app/components/form'
import { useRequiredParams } from 'app/hooks'

type DiskMetricParams = {
  title: string
  unit?: string
  startTime: Date
  endTime: Date
  metricName: DiskMetricName
  diskParams: { orgName: string; projectName: string; diskName: string }
  // TODO: specify bytes or count
}

function DiskMetric({
  title,
  unit,
  startTime,
  endTime,
  metricName,
  diskParams,
}: DiskMetricParams) {
  // TODO: we're only pulling the first page. Should we bump the cap to 10k?
  // Fetch multiple pages if 10k is not enough? That's a bit much.
  const { data: metrics, isLoading } = useApiQuery(
    'diskMetricsList',
    {
      path: { ...diskParams, metricName },
      query: { startTime, endTime, limit: 1000 },
    },
    // avoid graphs flashing blank while loading when you change the time
    { keepPreviousData: true }
  )

  const data = (metrics?.items || []).map(({ datum, timestamp }) => ({
    timestamp: timestamp.getTime(),
    // all of these metrics are cumulative ints
    value: (datum.datum as Cumulativeint64).value,
  }))

  // TODO: indicate time zone somewhere. doesn't have to be in the detail view
  // in the tooltip. could be just once on the end of the x-axis like GCP

  return (
    <div className="flex w-1/2 flex-grow flex-col">
      <h2 className="ml-3 flex items-center text-mono-xs text-secondary">
        {title} {unit && <div className="ml-1 text-quaternary">{unit}</div>}
        {isLoading && <Spinner className="ml-2" />}
      </h2>
      <TimeSeriesLineChart
        className="mt-3"
        data={data}
        title={title}
        width={480}
        height={240}
        startTime={startTime}
        endTime={endTime}
      />
    </div>
  )
}

// The only reason this needs to be its own component instead of inlined into
// MetricsTab is so we can wait to render _after_ we have the disks response,
// which means we can easily set the default selected disk to the first one
function DiskMetrics({ disks }: { disks: Disk[] }) {
  const { orgName, projectName } = useRequiredParams('orgName', 'projectName')

  const { startTime, endTime, dateTimeRangePicker } = useDateTimeRangePicker('lastDay')

  invariant(disks.length > 0, 'DiskMetrics should not be rendered with zero disks')
  const [diskName, setDiskName] = useState<string>(disks[0].name)
  const diskItems = disks.map(({ name }) => ({ label: name, value: name }))

  const diskParams = { orgName, projectName, diskName }
  const commonProps = { startTime, endTime, diskParams }

  return (
    <>
      <div className="mb-4 flex justify-between">
        <Listbox
          className="w-48"
          aria-label="Choose disk"
          name="disk-name"
          items={diskItems}
          onChange={(item) => {
            if (item) {
              setDiskName(item.value)
            }
          }}
          defaultValue={diskName}
        />
        {dateTimeRangePicker}
      </div>

      <div className="mt-8 space-y-12">
        {/* see the following link for the source of truth on what these mean
            https://github.com/oxidecomputer/crucible/blob/258f162b/upstairs/src/stats.rs#L9-L50 */}
        <div className="flex w-full space-x-4">
          <DiskMetric {...commonProps} title="Reads" unit="(Count)" metricName="read" />
          <DiskMetric
            {...commonProps}
            title="Read"
            unit="(Bytes)"
            metricName="read_bytes"
          />
        </div>

        <div className="flex w-full space-x-4">
          <DiskMetric {...commonProps} title="Writes" unit="(Count)" metricName="write" />
          <DiskMetric
            {...commonProps}
            title="Write"
            unit="(Bytes)"
            metricName="write_bytes"
          />
        </div>

        <div className="flex w-full space-x-4">
          <DiskMetric {...commonProps} title="Flushes" unit="(Count)" metricName="flush" />
        </div>
      </div>
    </>
  )
}

// spinner should be temporary. wrapping div is to get left alignment
const Loading = () => (
  <div>
    <Spinner className="mt-8 ml-8 h-8 w-8" />
  </div>
)

export default function MetricsTab() {
  const instanceParams = useRequiredParams('orgName', 'projectName', 'instanceName')
  const { data: disks } = useApiQuery('instanceDiskList', { path: instanceParams })

  return (
    <>
      <h2 className="text-sans-xl">Disk metrics</h2>
      {disks && disks.items.length > 0 ? <DiskMetrics disks={disks.items} /> : <Loading />}
    </>
  )
}
