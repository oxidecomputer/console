import { addHours } from 'date-fns'
import { Area, CartesianGrid, ComposedChart, XAxis, YAxis } from 'recharts'

import { datumToValue, useApiQuery } from '@oxide/api'

import { useRequiredParams } from 'app/hooks'

export function MetricsTab() {
  const instanceParams = useRequiredParams('orgName', 'projectName', 'instanceName')
  const { orgName, projectName } = instanceParams

  const { data: disks } = useApiQuery('instanceDiskList', instanceParams)
  const diskName = disks?.items[0].name
  const startTime = new Date(2022, 7, 18, 0)
  const endTime = addHours(startTime, 24)
  const { data: metrics } = useApiQuery(
    'diskMetricsList',
    {
      orgName,
      projectName,
      diskName: diskName!, // force it because this only runs when diskName is there
      metricName: 'read',
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      limit: 1000,
    },
    { enabled: !!diskName }
  )
  console.log(metrics)

  const data = (metrics?.items || []).map(({ datum, timestamp }) => ({
    timestamp: new Date(timestamp).toLocaleString(),
    value: datumToValue(datum),
  }))
  return (
    <ComposedChart
      width={600}
      height={300}
      data={data}
      margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
      className="mt-16"
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
  )
}
