import { useMemo, useState } from 'react'

import { apiQueryClient, useApiQuery } from '@oxide/api'
import { Divider, Listbox, PageHeader, PageTitle, Snapshots24Icon } from '@oxide/ui'
import { bytesToGiB } from '@oxide/util'

import { SystemMetric } from 'app/components/SystemMetric'
import { useDateTimeRangePicker } from 'app/components/form'

const FLEET_ID = '001de000-1334-4000-8000-000000000000'
const DEFAULT_SILO_ID = '001de000-5110-4000-8000-000000000000'

CapacityUtilizationPage.loader = async () => {
  await apiQueryClient.prefetchQuery('siloList', {})
}

export function CapacityUtilizationPage() {
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [siloId, setSiloId] = useState<string>(FLEET_ID)
  const { data: silos } = useApiQuery('siloList', {})

  const initialPreset = 'lastHour'
  const { startTime, endTime, dateTimeRangePicker } = useDateTimeRangePicker(initialPreset)

  const siloItems = useMemo(() => {
    const items = silos?.items.map((silo) => ({ label: silo.name, value: silo.id })) || []
    return [
      { label: 'All silos', value: FLEET_ID },
      { label: '[default silo]', value: DEFAULT_SILO_ID },
      ...items,
    ]
  }, [silos])

  const commonProps = { startTime, endTime, filterId: siloId }

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
          metricName="virtual_disk_space_provisioned"
          title="Disk Space (GiB)"
          valueTransform={bytesToGiB}
        />

        {/* TODO: figure out how to make this not show .5s in the y axis when the numbers are low */}
        <SystemMetric {...commonProps} metricName="cpus_provisioned" title="CPU (count)" />

        <SystemMetric
          {...commonProps}
          metricName="ram_provisioned"
          title="Memory (GiB)"
          valueTransform={bytesToGiB}
        />
      </div>
    </>
  )
}
