import { getLocalTimeZone, now } from '@internationalized/date'
import { useIsFetching } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import invariant from 'tiny-invariant'

import type { Capacity } from '@oxide/api'
import { FLEET_ID, apiQueryClient, totalCapacity, useApiQuery } from '@oxide/api'
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
import { type ListboxItem } from '@oxide/ui'
import { bytesToGiB, bytesToTiB } from '@oxide/util'

import { CapacityMetric, capacityQueryParams } from 'app/components/CapacityMetric'
import { RefetchIntervalPicker } from 'app/components/RefetchIntervalPicker'
import { SystemMetric } from 'app/components/SystemMetric'
import { useDateTimeRangePicker } from 'app/components/form'

CapacityUtilizationPage.loader = async () => {
  await Promise.all([
    apiQueryClient.prefetchQuery('siloList', {}),
    apiQueryClient.prefetchQuery('systemMetric', {
      path: { metricName: 'cpus_provisioned' },
      query: capacityQueryParams,
    }),
    apiQueryClient.prefetchQuery('systemMetric', {
      path: { metricName: 'ram_provisioned' },
      query: capacityQueryParams,
    }),
    apiQueryClient.prefetchQuery('systemMetric', {
      path: { metricName: 'virtual_disk_space_provisioned' },
      query: capacityQueryParams,
    }),
    apiQueryClient.prefetchQuery('sledList', {}),
  ])
  return null
}

export function CapacityUtilizationPage() {
  const { data: silos } = useApiQuery('siloList', {})
  invariant(silos, 'silos should be prefetched in loader')

  const siloItems = useMemo(() => {
    const items = silos?.items.map((silo) => ({ label: silo.name, value: silo.id })) || []
    return [{ label: 'All silos', value: FLEET_ID }, ...items]
  }, [silos])

  const { data: sleds } = useApiQuery('sledList', {})
  invariant(sleds, 'sleds should be prefetched in loader')

  const capacity = totalCapacity(sleds.items)

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Snapshots24Icon />}>Capacity &amp; Utilization</PageTitle>
      </PageHeader>

      <div className="mb-12 flex min-w-min flex-col gap-3 lg+:flex-row">
        <CapacityMetric
          icon={<Ssd16Icon />}
          title="Disk capacity"
          metricName="virtual_disk_space_provisioned"
          valueTransform={bytesToTiB}
          capacity={capacity.disk_tib}
        />
        <CapacityMetric
          icon={<Cpu16Icon />}
          title="CPU capacity"
          metricName="cpus_provisioned"
          capacity={capacity.cpu}
        />
        <CapacityMetric
          icon={<Ram16Icon />}
          title="Memory capacity"
          metricName="ram_provisioned"
          valueTransform={bytesToGiB}
          capacity={capacity.ram_gib}
        />
      </div>

      <UtilizationPage filterItems={siloItems} defaultId={FLEET_ID} capacity={capacity} />
    </>
  )
}

export function UtilizationPage({
  filterItems,
  defaultId,
  capacity,
}: {
  filterItems: ListboxItem[]
  defaultId: string
  capacity?: Capacity
}) {
  const [filterId, setFilterId] = useState<string>(defaultId)

  // pass refetch interval to this to keep the date up to date
  const { preset, startTime, endTime, dateTimeRangePicker, onRangeChange } =
    useDateTimeRangePicker({
      initialPreset: 'lastHour',
      maxValue: now(getLocalTimeZone()),
    })
  const commonProps = {
    startTime,
    endTime,
    // the way we tell the API we want the parent (fleet/silo) is by passing no filter
    filterId: filterId === defaultId ? undefined : filterId,
  }

  const handleRefetch = () => {
    // slide the window forward if we're on a preset
    onRangeChange(preset)
    // very important to filter for active, otherwise this refetches every
    // window that has ever been active
    apiQueryClient.refetchQueries('systemMetric', undefined, { type: 'active' })
  }
  const isRefetching = !!useIsFetching({ queryKey: ['systemMetric'] })

  return (
    <>
      <div className="mt-16 mb-8 flex justify-between gap-3">
        <Listbox
          selected={filterId}
          className="w-48"
          aria-labelledby="filter-id-label"
          name="filter-id"
          items={filterItems}
          onChange={setFilterId}
        />

        <div className="flex items-center gap-2">{dateTimeRangePicker}</div>
      </div>

      <Divider className="!mx-0 mb-6 !w-full" />

      <RefetchIntervalPicker
        rangePreset={preset}
        isRefetching={isRefetching}
        handleRefetch={handleRefetch}
      />

      <div className="mt-8 mb-12 space-y-12">
        <div className="flex flex-col gap-3">
          <SystemMetric
            {...commonProps}
            metricName="virtual_disk_space_provisioned"
            title="Disk Space"
            unit="TiB"
            valueTransform={bytesToTiB}
            capacity={capacity?.disk_tib}
          />
        </div>

        <SystemMetric
          {...commonProps}
          metricName="cpus_provisioned"
          title="CPU"
          unit="count"
          capacity={capacity?.cpu}
        />

        <SystemMetric
          {...commonProps}
          metricName="ram_provisioned"
          title="Memory"
          unit="GiB"
          valueTransform={bytesToGiB}
          capacity={capacity?.ram_gib}
        />
      </div>
    </>
  )
}
