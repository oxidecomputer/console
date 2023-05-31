import { getLocalTimeZone, now } from '@internationalized/date'
import { useMemo, useState } from 'react'

import { apiQueryClient, useApiQuery } from '@oxide/api'
import { Divider, Listbox, PageHeader, PageTitle, Snapshots24Icon } from '@oxide/ui'
import { bytesToGiB, bytesToTiB } from '@oxide/util'

import { SystemMetric } from 'app/components/SystemMetric'
import { useDateTimeRangePicker } from 'app/components/form'

const DEFAULT_SILO_ID = '001de000-5110-4000-8000-000000000000'

const toListboxItem = (x: { name: string; id: string }) => ({ label: x.name, value: x.id })

SiloUtilizationPage.loader = async () => {
  await apiQueryClient.prefetchQuery('projectList', {})
  return null
}

export function SiloUtilizationPage() {
  // this will come from /session/me
  const siloId = DEFAULT_SILO_ID

  // silo ID or project ID
  const [filterId, setFilterId] = useState<string>(siloId)

  const { data: projects } = useApiQuery('projectList', {})

  const initialPreset = 'lastHour'
  const { startTime, endTime, dateTimeRangePicker } = useDateTimeRangePicker({
    initialPreset,
    maxValue: now(getLocalTimeZone()),
  })

  const projectItems = useMemo(() => {
    const items = projects?.items.map(toListboxItem) || []
    return [{ label: 'All projects', value: siloId }, ...items]
  }, [projects, siloId])

  const commonProps = {
    startTime: startTime.toDate(getLocalTimeZone()),
    endTime: endTime.toDate(getLocalTimeZone()),
    filterId,
  }

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Snapshots24Icon />}>Capacity &amp; Utilization</PageTitle>
      </PageHeader>

      <div className="my-8 flex justify-between">
        <Listbox
          selectedItem={filterId}
          className="w-48"
          aria-labelledby="silo-id-label"
          name="silo-id"
          items={projectItems}
          onChange={(item) => {
            if (item) {
              setFilterId(item.value)
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
