import { useMemo, useState } from 'react'
import { Area, CartesianGrid, ComposedChart, XAxis, YAxis } from 'recharts'

import type { Cumulativeint64, DiskMetricName } from '@oxide/api'
import { useApiQuery } from '@oxide/api'

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
  const { data: metrics } = useApiQuery('diskMetricsList', {
    ...diskParams,
    metricName,
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
    limit: 1000,
  })

  // console.log(metrics)

  const data = (metrics?.items || []).map(({ datum, timestamp }) => ({
    timestamp: new Date(timestamp).toLocaleString(),
    // all of these metrics are cumulative ints
    value: (datum.datum as Cumulativeint64).value,
  }))

  // if (data.length > 0) {
  //   console.log('time range:', data[0].timestamp, data[data.length - 1].timestamp)
  // }

  return (
    <div>
      <h2 className="text-mono-sm text-secondary">{title}</h2>
      <ComposedChart
        width={480}
        height={240}
        data={data}
        margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
        className="mt-4"
      >
        {/* TODO: pull these colors from TW config */}
        <CartesianGrid stroke="#1D2427" vertical={false} />
        <Area
          dataKey="value"
          stroke="#2F8865"
          fillOpacity={1}
          fill="#112725"
          isAnimationActive={false}
        />
        <XAxis dataKey="timestamp" />
        <YAxis orientation="right" />
      </ComposedChart>
    </div>
  )
}

export function MetricsTab() {
  const instanceParams = useRequiredParams('orgName', 'projectName', 'instanceName')
  const { orgName, projectName } = instanceParams

  const { data: instance } = useApiQuery('instanceView', instanceParams)
  const { data: disks } = useApiQuery('instanceDiskList', instanceParams)
  const diskName = disks?.items[0].name

  const [startTime] = useState(instance?.timeCreated)
  // TODO: add date picker

  // endTime is now, i.e., mount time
  const endTime = useMemo(() => new Date(), [])

  if (!startTime || !diskName) return <span>loading</span>

  const commonProps = {
    startTime,
    endTime,
    diskParams: { orgName, projectName, diskName },
  }

  return (
    <>
      <h2 className="text-sans-xl">
        {/* TODO: need a nicer way of saying what the boot disk is */}
        Boot disk ( <code>{diskName}</code> )
      </h2>
      <div className="flex flex-wrap gap-8 mt-8">
        <DiskMetric {...commonProps} title="Activations (count)" metricName="activated" />
        <DiskMetric {...commonProps} title="Reads (count)" metricName="read" />
        <DiskMetric {...commonProps} title="Read (bytes)" metricName="read_bytes" />
        <DiskMetric {...commonProps} title="Writes (count)" metricName="write" />
        <DiskMetric {...commonProps} title="Write (bytes)" metricName="write_bytes" />
        <DiskMetric {...commonProps} title="Flushes (count)" metricName="flush" />
      </div>
    </>
  )
}
