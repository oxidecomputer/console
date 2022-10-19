import { useMemo, useState } from 'react'

import { apiQueryClient, useApiQuery } from '@oxide/api'
import { Divider, Listbox, PageHeader, PageTitle, Snapshots24Icon } from '@oxide/ui'
import { bytesToGiB } from '@oxide/util'

import { SystemMetric } from 'app/components/SystemMetric'
import { DateTimeRangePicker, useDateTimeRangePickerState } from 'app/components/form'

const DEFAULT_SILO_ID = '001de000-5110-4000-8000-000000000000'
const ALL_PROJECTS = '|ALL_PROJECTS|'

SiloUtilizationPage.loader = async () => {
  await apiQueryClient.prefetchQuery('organizationList', {})
}

const toListboxItem = (x: { name: string; id: string }) => ({ label: x.name, value: x.id })

export function SiloUtilizationPage() {
  // this will come from /session/me
  const siloId = DEFAULT_SILO_ID

  const [orgId, setOrgId] = useState<string>(siloId)
  const [projectId, setProjectId] = useState<string | null>(null)
  const { data: orgs } = useApiQuery('organizationList', {})

  const orgName = orgs?.items.find((o) => orgId && o.id === orgId)?.name

  const { data: projects } = useApiQuery(
    'projectList',
    { path: { orgName: orgName! } }, // only enabled if it's there
    { enabled: !!orgName }
  )

  const initialPreset = 'lastHour'
  const {
    startTime,
    endTime,
    onChange: onTimeChange,
  } = useDateTimeRangePickerState(initialPreset)

  const orgItems = useMemo(() => {
    const items = orgs?.items.map(toListboxItem) || []
    return [{ label: 'All orgs', value: siloId }, ...items]
  }, [orgs, siloId])

  const projectItems = useMemo(() => {
    const items = projects?.items.map(toListboxItem) || []
    return [{ label: 'All projects', value: ALL_PROJECTS }, ...items]
  }, [projects])

  const filterId = projectId || orgId

  const commonProps = { startTime, endTime, filterId }

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
              <label id="org-id-label" className="flex text-sans-sm">
                Choose org
              </label>
            </div>
            <Listbox
              defaultValue={DEFAULT_SILO_ID}
              className="w-36"
              aria-labelledby="org-id-label"
              name="org-id"
              items={orgItems}
              onChange={(item) => {
                if (item) {
                  setOrgId(item.value)
                  setProjectId(null)
                }
              }}
            />
            {/* TODO: need a button to clear the silo */}
          </div>

          {orgId !== DEFAULT_SILO_ID && (
            <div className="mr-8">
              <div className="mb-2">
                {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                <label id="project-id-label" className="flex text-sans-sm">
                  Choose project
                </label>
              </div>
              <Listbox
                key={orgId}
                defaultValue={ALL_PROJECTS}
                className="w-48"
                aria-labelledby="project-id-label"
                name="project-id-id"
                items={projectItems}
                onChange={(item) => {
                  if (item) {
                    setProjectId(item.value === ALL_PROJECTS ? null : item.value)
                  }
                }}
              />
            </div>
          )}
        </div>

        <DateTimeRangePicker
          initialPreset={initialPreset}
          slideInterval={5000}
          startTime={startTime}
          endTime={endTime}
          onChange={onTimeChange}
        />
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
