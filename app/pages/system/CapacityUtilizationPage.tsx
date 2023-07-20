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
import { bytesToGiB, bytesToTiB, invariant } from '@oxide/util'

import { CapacityMetric, capacityQueryParams } from 'app/components/CapacityMetric'
import { useIntervalPicker } from 'app/components/RefetchIntervalPicker'
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
  invariant(silos, 'Silos must be prefetched')

  const siloItems = useMemo(() => {
    const items = silos?.items.map((silo) => ({ label: silo.name, value: silo.id })) || []
    return [{ label: 'All silos', value: FLEET_ID }, ...items]
  }, [silos])

  const { data: sleds } = useApiQuery('sledList', {})
  invariant(sleds, 'Sleds must be prefetched')

  const capacity = totalCapacity(sleds.items)

  const [filterId, setFilterId] = useState<string>(FLEET_ID)

  // pass refetch interval to this to keep the date up to date
  const { preset, startTime, endTime, dateTimeRangePicker, onRangeChange } =
    useDateTimeRangePicker({
      initialPreset: 'lastHour',
      maxValue: now(getLocalTimeZone()),
    })

  const { intervalPicker } = useIntervalPicker({
    enabled: preset !== 'custom',
    isLoading: useIsFetching({ queryKey: ['systemMetric'] }) > 0,
    // sliding the range forward is sufficient to trigger a refetch
    fn: () => onRangeChange(preset),
  })

  const commonProps = {
    startTime,
    endTime,
    // the way we tell the API we want the fleet is by passing no filter
    silo: filterId === FLEET_ID ? undefined : filterId,
  }

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Snapshots24Icon />}>Capacity &amp; Utilization</PageTitle>
      </PageHeader>

      <div className="mb-12 flex min-w-min flex-col gap-3 lg+:flex-row">
        <CapacityMetric
          icon={<Ssd16Icon />}
          title="Disk utilization"
          metricName="virtual_disk_space_provisioned"
          valueTransform={bytesToTiB}
          capacity={capacity.disk_tib}
        />
        <CapacityMetric
          icon={<Cpu16Icon />}
          title="CPU utilization"
          metricName="cpus_provisioned"
          capacity={capacity.cpu}
        />
        <CapacityMetric
          icon={<Ram16Icon />}
          title="Memory utilization"
          metricName="ram_provisioned"
          valueTransform={bytesToGiB}
          capacity={capacity.ram_gib}
        />
      </div>

      <div className="mt-8 flex justify-between gap-3">
        <Listbox
          selected={filterId}
          className="w-48"
          aria-labelledby="filter-id-label"
          name="filter-id"
          items={siloItems}
          onChange={setFilterId}
        />

        <div className="flex items-center gap-2">{dateTimeRangePicker}</div>
      </div>

      <Divider className="my-6" />

      {intervalPicker}

      <div className="mb-12 space-y-12">
        <SystemMetric
          {...commonProps}
          metricName="virtual_disk_space_provisioned"
          title="Disk Space"
          unit="TiB"
          valueTransform={bytesToTiB}
          capacity={capacity?.disk_tib}
        />
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
