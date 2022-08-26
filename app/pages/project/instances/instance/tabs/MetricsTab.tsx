import { format } from 'date-fns'
import { useMemo, useState } from 'react'
import { Area, CartesianGrid, ComposedChart, Tooltip, XAxis, YAxis } from 'recharts'
import type { TooltipProps } from 'recharts/types/component/Tooltip'

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

function getTicks(data: { timestamp: number }[], n: number): number[] {
  if (data.length === 0) return []
  if (n < 2) throw Error('n must be at least 2 because of the start and end ticks')
  const maxIdx = data.length - 1
  // if there are 4 ticks, their positions are 0/3, 1/3, 2/3, 3/3 (as fractions of maxIdx)
  const idxs = new Array(n).fill(0).map((_, i) => Math.floor((maxIdx * i) / (n - 1)))
  return idxs.map((i) => data[i].timestamp)
}

const shortDateTime = (ts: number) => format(new Date(ts), 'M/d HH:mm')
const longDateTime = (ts: number) => format(new Date(ts), 'MMM d, yyyy H:mm aa')

// TODO: pull from TW theme
const GRID_GRAY = '#1D2427'
const GREEN = '#2F8865'
const DARK_GREEN = '#112725'

function renderTooltip({ payload }: TooltipProps<number, string>) {
  if (!payload || payload.length < 1) return null
  // TODO: there has to be a better way to get these values
  const { timestamp, value } = payload[0].payload
  if (!timestamp || !value) return null
  return (
    <div className="bg-raise text-accent p-2 text-sans-md">
      <div>{longDateTime(timestamp)}</div>
      {/* TODO: value needs a label (should be easy) */}
      <div>{value}</div>
    </div>
  )
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

  const data = (metrics?.items || []).map(({ datum, timestamp }) => ({
    timestamp: new Date(timestamp).getTime(),
    // all of these metrics are cumulative ints
    value: (datum.datum as Cumulativeint64).value,
  }))

  // console.log(metrics)
  // console.log(data)

  // if (data.length > 0) {
  //   console.log('time range:', data[0].timestamp, data[data.length - 1].timestamp)
  // }

  // console.log(getTicks(data))

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
        <CartesianGrid stroke={GRID_GRAY} vertical={false} />
        <Area
          dataKey="value"
          stroke={GREEN}
          fillOpacity={1}
          fill={DARK_GREEN}
          isAnimationActive={false}
        />
        <XAxis
          domain={['auto', 'auto']}
          dataKey="timestamp"
          interval="preserveStart"
          scale="time"
          type="number"
          name="Time"
          ticks={getTicks(data, 3)}
          // TODO: decide timestamp format based on time range of chart
          tickFormatter={shortDateTime}
        />
        <YAxis orientation="right" />
        <Tooltip isAnimationActive={false} content={renderTooltip} />
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
