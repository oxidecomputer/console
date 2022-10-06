import { useMemo, useState } from 'react'

import type { Cumulativeint64 } from '@oxide/api'
import { apiQueryClient, useApiQuery } from '@oxide/api'
import {
  Divider,
  Listbox,
  PageHeader,
  PageTitle,
  Snapshots24Icon,
  Spinner,
} from '@oxide/ui'

import { TimeSeriesAreaChart } from 'app/components/TimeSeriesChart'
import { useDateTimeRangePicker } from 'app/components/form'

type DiskMetricParams = {
  title: string
  startTime: Date
  endTime: Date
  metricName: DiskMetricName
  diskParams: { orgName: string; projectName: string; diskName: string }
  // TODO: specify bytes or count
}

function SystemMetric({
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
      startTime,
      endTime,
      limit: 1000,
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
    <div>
      <h2 className="flex items-center text-mono-md text-secondary">
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

CapacityUtilizationPage.loader = async () => {
  await apiQueryClient.prefetchQuery('siloList', {})
}

export function CapacityUtilizationPage() {
  const [siloId, setSiloId] = useState<string | null>(null)
  const { data: silos } = useApiQuery('siloList', {})

  const { startTime, endTime, dateTimeRangePicker } = useDateTimeRangePicker('lastDay')

  const siloItems = useMemo(
    () => silos?.items.map((silo) => ({ label: silo.name, value: silo.id })) || [],
    [silos]
  )

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Snapshots24Icon />}>Capacity &amp; Utilization</PageTitle>
      </PageHeader>

      <div className="mt-8 flex justify-between">
        <div>
          <div className="mb-2">
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label id="silo-id-label" className="flex text-sans-sm">
              Choose silo
            </label>
          </div>
          <Listbox
            placeholder="Filter by silo"
            className="w-48"
            aria-labelledby="silo-id-label"
            name="silo-id"
            items={siloItems}
            onChange={(item) => {
              if (item) {
                setSiloId(item.value)
              }
            }}
          />
          {/* TODO: need a button to clear the silo */}
        </div>

        {dateTimeRangePicker}
      </div>
      <Divider className="mb-6" />
    </>
  )
}
