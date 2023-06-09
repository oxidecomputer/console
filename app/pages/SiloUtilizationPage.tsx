import { getLocalTimeZone } from '@internationalized/date'
import { useMemo, useState } from 'react'

import { apiQueryClient, useApiQuery } from '@oxide/api'
import { Divider, Listbox, PageHeader, PageTitle, Snapshots24Icon } from '@oxide/ui'
import { bytesToGiB } from '@oxide/util'

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

  const { startTime, endTime, dateTimeRangePicker } = useDateTimeRangePicker('lastHour')

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

      <div className="mt-8 flex justify-between">
        <div className="flex">
          <div className="mr-8">
            <div className="mb-2">
              {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
              <label id="project-id-label" className="flex text-sans-sm">
                Choose project
              </label>
            </div>
            <Listbox
              selectedItem={filterId}
              className="w-36"
              aria-labelledby="project-id-label"
              name="project-id"
              items={projectItems}
              onChange={(val) => {
                val && setFilterId(val)
              }}
            />
            {/* TODO: need a button to clear the silo */}
          </div>
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
