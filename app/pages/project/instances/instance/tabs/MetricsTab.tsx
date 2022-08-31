import type { Cumulativeint64, DiskMetricName } from '@oxide/api'
import { useApiQuery } from '@oxide/api'
import { Spinner } from '@oxide/ui'

import { TimeSeriesAreaChart } from 'app/components/TimeSeriesChart'
import { useDateTimeRangePicker } from 'app/components/form'
import { useRequiredParams } from 'app/hooks'

type DiskMetricParams = {
  title: string
  startTime: Date
  endTime: Date
  metricName: DiskMetricName
  diskParams: { orgName: string; projectName: string; diskName: string }
  // TODO: specify bytes or count
}

function DiskMetric({
  title,
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
      ...diskParams,
      metricName,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      limit: 1000,
    },
    // avoid graphs flashing blank while loading when you change the time
    { keepPreviousData: true }
  )

  const data = (metrics?.items || []).map(({ datum, timestamp }) => ({
    timestamp: new Date(timestamp).getTime(),
    // all of these metrics are cumulative ints
    value: (datum.datum as Cumulativeint64).value,
  }))

  // TODO: indicate time zone somewhere. doesn't have to be in the detail view
  // in the tooltip. could be just once on the end of the x-axis like GCP

  return (
    <div>
      <h2 className="text-mono-md text-secondary flex items-center">
        {title} {isLoading && <Spinner className="ml-2" />}
      </h2>
      <TimeSeriesAreaChart
        className="mt-4"
        data={data}
        title={title}
        width={480}
        height={240}
      />
    </div>
  )
}

export function MetricsTab() {
  const instanceParams = useRequiredParams('orgName', 'projectName', 'instanceName')
  const { orgName, projectName } = instanceParams

  const { data: disks } = useApiQuery('instanceDiskList', instanceParams)
  const diskName = disks?.items[0].name

  const { startTime, endTime, dateTimeRangePicker } = useDateTimeRangePicker('lastDay')

  if (!diskName) return <span>loading</span> // TODO: loading state

  const diskParams = { orgName, projectName, diskName }
  const commonProps = { startTime, endTime, diskParams }

  return (
    <>
      <h2 className="text-sans-xl">
        {/* TODO: need a nicer way of saying what the boot disk is */}
        Boot disk ( <code>{diskName}</code> )
      </h2>

      {dateTimeRangePicker}

      {/* TODO: separate "Reads" from "(count)" so we can
                a) style them differently in the title, and
                b) show "Reads" but not "(count)" in the Tooltip?
        */}
      <div className="flex flex-wrap gap-8 mt-8">
        {/* see the following link for the source of truth on what these mean
            https://github.com/oxidecomputer/crucible/blob/258f162b/upstairs/src/stats.rs#L9-L50 */}
        <DiskMetric {...commonProps} title="Reads (Count)" metricName="read" />
        <DiskMetric {...commonProps} title="Read (Bytes)" metricName="read_bytes" />
        <DiskMetric {...commonProps} title="Writes (Count)" metricName="write" />
        <DiskMetric {...commonProps} title="Write (Bytes)" metricName="write_bytes" />
        <DiskMetric {...commonProps} title="Flushes (Count)" metricName="flush" />
      </div>
    </>
  )
}
