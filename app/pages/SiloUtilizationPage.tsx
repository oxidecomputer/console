/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { getLocalTimeZone, now } from '@internationalized/date'
import { useIsFetching } from '@tanstack/react-query'
import { useMemo, useState } from 'react'

import { apiQueryClient, usePrefetchedApiQuery } from '@oxide/api'
import { Metrics16Icon, Metrics24Icon } from '@oxide/design-system/icons/react'

import { CapacityBars } from '~/components/CapacityBars'
import { DocsPopover } from '~/components/DocsPopover'
import { useDateTimeRangePicker } from '~/components/form/fields/DateTimeRangePicker'
import { useIntervalPicker } from '~/components/RefetchIntervalPicker'
import { SiloMetric } from '~/components/SystemMetric'
import { useCurrentUser } from '~/layouts/AuthenticatedLayout'
import { Divider } from '~/ui/lib/Divider'
import { Listbox } from '~/ui/lib/Listbox'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { docLinks } from '~/util/links'
import { bytesToGiB, bytesToTiB } from '~/util/units'

const toListboxItem = (x: { name: string; id: string }) => ({ label: x.name, value: x.id })

SiloUtilizationPage.loader = async () => {
  await Promise.all([
    apiQueryClient.prefetchQuery('projectList', {}),
    apiQueryClient.prefetchQuery('utilizationView', {}),
  ])
  return null
}

export function SiloUtilizationPage() {
  const { me } = useCurrentUser()

  const siloId = me.siloId

  const { data: projects } = usePrefetchedApiQuery('projectList', {})
  const { data: utilization } = usePrefetchedApiQuery('utilizationView', {})

  const projectItems = useMemo(() => {
    const items = projects.items.map(toListboxItem) || []
    return [{ label: 'All projects', value: siloId }, ...items]
  }, [projects, siloId])

  const [filterId, setFilterId] = useState<string>(siloId)

  // pass refetch interval to this to keep the date up to date
  const { preset, startTime, endTime, dateTimeRangePicker, onRangeChange } =
    useDateTimeRangePicker({
      initialPreset: 'lastHour',
      maxValue: now(getLocalTimeZone()),
    })

  const { intervalPicker } = useIntervalPicker({
    enabled: preset !== 'custom',
    isLoading: useIsFetching({ queryKey: ['siloMetric'] }) > 0,
    // sliding the range forward is sufficient to trigger a refetch
    fn: () => onRangeChange(preset),
  })

  const commonProps = {
    startTime,
    endTime,
    // the way we tell the API we want the silo is by passing no filter
    project: filterId === siloId ? undefined : filterId,
  }

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Metrics24Icon />}>Capacity &amp; Utilization</PageTitle>
        <DocsPopover
          heading="Images"
          icon={<Metrics16Icon />}
          summary="System metrics allow you to monitor the allocation and utilization of your resources across silos, including CPU, memory, and storage."
          links={[docLinks.systemMetrics]}
        />
      </PageHeader>

      <CapacityBars
        provisioned={utilization.provisioned}
        allocated={utilization.capacity}
        allocatedLabel="Quota"
      />

      <Divider className="my-6" />

      <div className="mb-3 mt-8 flex justify-between gap-3">
        <Listbox
          selected={filterId}
          className="w-64"
          aria-labelledby="filter-id-label"
          name="filter-id"
          items={projectItems}
          onChange={setFilterId}
        />

        <div className="flex items-center gap-2">{dateTimeRangePicker}</div>
      </div>

      {intervalPicker}

      <div className="mb-12 space-y-12">
        <SiloMetric
          {...commonProps}
          metricName="cpus_provisioned"
          title="CPU"
          unit="count"
        />
        <SiloMetric
          {...commonProps}
          metricName="ram_provisioned"
          title="Memory"
          unit="GiB"
          valueTransform={bytesToGiB}
        />
        <SiloMetric
          {...commonProps}
          metricName="virtual_disk_space_provisioned"
          title="Storage"
          unit="TiB"
          valueTransform={bytesToTiB}
        />
      </div>
    </>
  )
}
