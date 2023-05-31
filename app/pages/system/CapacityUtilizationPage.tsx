import { getLocalTimeZone } from '@internationalized/date'
import { useMemo, useState } from 'react'

import { apiQueryClient, useApiQuery } from '@oxide/api'
import {
  Cpu16Icon,
  Divider,
  Listbox,
  PageHeader,
  PageTitle,
  Ram16Icon,
  Snapshots24Icon,
  Ssd16Icon,
} from '@oxide/ui'
import { bytesToGiB, bytesToTiB } from '@oxide/util'

import { CapacityMetric } from 'app/components/CapacityMetric'
import { SystemMetric } from 'app/components/SystemMetric'
import { useDateTimeRangePicker } from 'app/components/form'

const FLEET_ID = '001de000-1334-4000-8000-000000000000'

CapacityUtilizationPage.loader = async () => {
  await apiQueryClient.prefetchQuery('siloList', {})
  return null
}

export function CapacityUtilizationPage() {
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [siloId, setSiloId] = useState<string>(FLEET_ID)
  const { data: silos } = useApiQuery('siloList', {})

  const initialPreset = 'lastHour'
  const { startTime, endTime, dateTimeRangePicker } = useDateTimeRangePicker(initialPreset)

  const siloItems = useMemo(() => {
    const items = silos?.items.map((silo) => ({ label: silo.name, value: silo.id })) || []
    return [{ label: 'All silos', value: FLEET_ID }, ...items]
  }, [silos])

  const commonProps = {
    startTime: startTime.toDate(getLocalTimeZone()),
    endTime: endTime.toDate(getLocalTimeZone()),
    filterId: siloId,
  }

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Snapshots24Icon />}>Capacity &amp; Utilization</PageTitle>
      </PageHeader>

      <div className="mb-12 flex min-w-min gap-3">
        <CapacityMetric
          icon={<Ssd16Icon />}
          title="Disk capacity"
          metricName="virtual_disk_space_provisioned"
          valueTransform={bytesToTiB}
          capacity={900}
        />
        <CapacityMetric
          icon={<Ram16Icon />}
          title="Memory capacity"
          metricName="ram_provisioned"
          valueTransform={bytesToGiB}
          capacity={28000}
        />
        <CapacityMetric
          icon={<Cpu16Icon />}
          title="CPU capacity"
          metricName="cpus_provisioned"
          capacity={2048}
        />
      </div>

      <div className="my-8 flex justify-between">
        <Listbox
          selectedItem={siloId}
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

        {dateTimeRangePicker}
      </div>

      <Divider className="!mx-0 mb-6 !w-full" />

      <div className="mt-8 mb-12 space-y-12">
        <div className="flex flex-col gap-3">
          <SystemMetric
            {...commonProps}
            metricName="virtual_disk_space_provisioned"
            title="Disk Space"
            unit="TiB"
            valueTransform={bytesToTiB}
            capacity={900}
          />
        </div>

        {/* TODO: figure out how to make this not show .5s in the y axis when the numbers are low */}
        <SystemMetric
          {...commonProps}
          metricName="cpus_provisioned"
          title="CPU"
          unit="count"
          capacity={2048}
        />

        <SystemMetric
          {...commonProps}
          metricName="ram_provisioned"
          title="Memory"
          unit="GiB"
          valueTransform={bytesToGiB}
          capacity={28000}
        />
      </div>
    </>
  )
}
