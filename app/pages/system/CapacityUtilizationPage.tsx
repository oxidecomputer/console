import { useMemo, useState } from 'react'

import type { ResourceName } from '@oxide/api'
import { apiQueryClient, useApiQuery } from '@oxide/api'
import {
  Divider,
  Listbox,
  PageHeader,
  PageTitle,
  Snapshots24Icon,
  Spinner,
} from '@oxide/ui'
import { GiB } from '@oxide/util'

import { TimeSeriesAreaChart } from 'app/components/TimeSeriesChart'
import { useDateTimeRangePicker } from 'app/components/form'

const FLEET_ID = '001de000-1334-4000-8000-000000000000'
const DEFAULT_SILO_ID = '001de000-5110-4000-8000-000000000000'

type DiskMetricParams = {
  title: string
  startTime: Date
  endTime: Date
  resourceName: ResourceName
  siloId: string
  valueTransform?: (n: number) => number
}

function SystemMetric({
  title,
  siloId,
  startTime,
  endTime,
  resourceName,
  valueTransform = (x) => x,
}: DiskMetricParams) {
  // TODO: we're only pulling the first page. Should we bump the cap to 10k?
  // Fetch multiple pages if 10k is not enough? That's a bit much.
  const { data: metrics, isLoading } = useApiQuery(
    'systemMetricsList',
    { id: siloId, resourceName, startTime, endTime },
    // avoid graphs flashing blank while loading when you change the time
    { keepPreviousData: true }
  )

  const data = (metrics?.items || []).map(({ datum, timestamp }) => ({
    timestamp: timestamp.getTime(),
    // all of these metrics are cumulative ints
    value: valueTransform(datum.datum as number),
  }))

  // TODO: consider adding a fake data point for the end of the requested time range
  // so it's filled out

  // TODO: indicate time zone somewhere. doesn't have to be in the detail view
  // in the tooltip. could be just once on the end of the x-axis like GCP

  return (
    <div>
      <h2 className="flex items-center text-mono-md text-secondary">
        {title} {isLoading && <Spinner className="ml-2" />}
      </h2>
      {/* TODO: this is supposed to be full width */}
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
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [siloId, setSiloId] = useState<string>(FLEET_ID)
  const { data: silos } = useApiQuery('siloList', {})

  const { startTime, endTime, dateTimeRangePicker } = useDateTimeRangePicker('lastHour')

  const siloItems = useMemo(() => {
    const items = silos?.items.map((silo) => ({ label: silo.name, value: silo.id })) || []
    return [
      { label: 'All silos', value: FLEET_ID },
      { label: '[default silo]', value: DEFAULT_SILO_ID },
      ...items,
    ]
  }, [silos])

  const commonProps = { startTime, endTime, siloId }

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
            defaultValue={FLEET_ID}
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
      {/* TODO: this divider is supposed to go all the way across */}
      <Divider className="mb-6" />

      <div className="mt-8 space-y-8">
        {/* TODO: convert numbers to GiB PLEASE */}
        <SystemMetric
          {...commonProps}
          resourceName="physical_disk_space_provisioned"
          title="Disk Utilization (GiB)"
          valueTransform={(b) => Math.floor(b / GiB)}
        />

        <SystemMetric
          {...commonProps}
          resourceName="cpus_provisioned"
          title="CPU Utilization (CPU count)"
        />
      </div>
    </>
  )
}
