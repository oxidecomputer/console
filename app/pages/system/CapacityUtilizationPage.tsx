/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { getLocalTimeZone, now } from '@internationalized/date'
import { useIsFetching } from '@tanstack/react-query'
import { memo, useMemo, useState } from 'react'

import type { SiloResultsPage } from '@oxide/api'
import {
  FLEET_ID,
  apiQueryClient,
  totalCapacity,
  useApiQueries,
  usePrefetchedApiQuery,
} from '@oxide/api'
import {
  Cpu16Icon,
  Listbox,
  Metrics24Icon,
  PageHeader,
  PageTitle,
  Ram16Icon,
  Ssd16Icon,
  Table,
  Tabs,
} from '@oxide/ui'
import { bytesToGiB, bytesToTiB, camelCase } from '@oxide/util'

import { CapacityMetric, capacityQueryParams } from 'app/components/CapacityMetric'
import { useIntervalPicker } from 'app/components/RefetchIntervalPicker'
import { SystemMetric } from 'app/components/SystemMetric'
import { useDateTimeRangePicker } from 'app/components/form'

import type { SiloMetric } from './metrics-util'
import { mergeSiloMetrics } from './metrics-util'

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
  const { data: sleds } = usePrefetchedApiQuery('sledList', {})
  const { data: silos } = usePrefetchedApiQuery('siloList', {})

  const capacity = totalCapacity(sleds.items)

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Metrics24Icon />}>Capacity &amp; Utilization</PageTitle>
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
      <Tabs.Root defaultValue="metrics" className="full-width">
        <Tabs.List>
          <Tabs.Trigger value="metrics">Metrics</Tabs.Trigger>
          <Tabs.Trigger value="usage">Usage</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="metrics">
          <MetricsTab capacity={capacity} silos={silos} />
        </Tabs.Content>
        <Tabs.Content value="usage">
          <UsageTab silos={silos} />
        </Tabs.Content>
      </Tabs.Root>
    </>
  )
}

const MetricsTab = ({
  capacity,
  silos,
}: {
  capacity: ReturnType<typeof totalCapacity>
  silos: SiloResultsPage
}) => {
  const siloItems = useMemo(() => {
    const items = silos?.items.map((silo) => ({ label: silo.name, value: silo.id })) || []
    return [{ label: 'All silos', value: FLEET_ID }, ...items]
  }, [silos])

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
      <div className="mb-3 mt-8 flex justify-between gap-3">
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

const usageTableParams = {
  startTime: new Date(0),
  endTime: capacityQueryParams.endTime,
  limit: 1,
  order: 'descending' as const,
}

const UsageTab = memo(({ silos }: { silos: SiloResultsPage }) => {
  const siloList = silos?.items.map((silo) => ({ name: silo.name, id: silo.id })) || []

  const results = useApiQueries('systemMetric', [
    ...siloList.map((silo) => ({
      path: { metricName: 'virtual_disk_space_provisioned' as const },
      query: { ...usageTableParams, silo: silo.name },
    })),
    ...siloList.map((silo) => ({
      path: { metricName: 'ram_provisioned' as const },
      query: { ...usageTableParams, silo: silo.name },
    })),
    ...siloList.map((silo) => ({
      path: { metricName: 'cpus_provisioned' as const },
      query: { ...usageTableParams, silo: silo.name },
    })),
  ])

  // TODO: loading state, this could take some time
  if (results.some((result) => result.isPending)) return null

  const siloResults = results
    .map((result) => {
      if (result.data && result.data.params) {
        const params = result.data.params

        if (!params.query) {
          return undefined
        }

        return {
          siloName: params.query.silo,
          metrics: {
            [camelCase(params.path.metricName)]: result.data.items[0].datum.datum,
          },
        } as SiloMetric
      }
    })
    .filter((item): item is SiloMetric => Boolean(item))

  const mergedResults = mergeSiloMetrics(siloResults)

  return (
    <Table className="w-full">
      <Table.Header>
        <Table.HeaderRow>
          <Table.HeadCell>Silo</Table.HeadCell>
          <Table.HeadCell colSpan={3}>Provisioned</Table.HeadCell>
        </Table.HeaderRow>
        <Table.HeaderRow>
          <Table.HeadCell></Table.HeadCell>
          <Table.HeadCell>CPU</Table.HeadCell>
          <Table.HeadCell>Disk</Table.HeadCell>
          <Table.HeadCell>Memory</Table.HeadCell>
        </Table.HeaderRow>
      </Table.Header>
      <Table.Body>
        {mergedResults.map((result) => (
          <Table.Row key={result.siloName}>
            <Table.Cell width="25%">{result.siloName}</Table.Cell>
            <Table.Cell width="25%">{result.metrics.cpusProvisioned}</Table.Cell>
            <Table.Cell width="25%">
              {bytesToTiB(result.metrics.virtualDiskSpaceProvisioned)}
              <span className="ml-1 inline-block text-quaternary">TiB</span>
            </Table.Cell>
            <Table.Cell width="25%">
              {bytesToGiB(result.metrics.ramProvisioned)}
              <span className="ml-1 inline-block text-quaternary">GiB</span>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  )
})
