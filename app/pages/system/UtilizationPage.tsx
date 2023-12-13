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

import {
  apiQueryClient,
  FLEET_ID,
  totalCapacity,
  useApiQueries,
  usePrefetchedApiQuery,
  type SiloResultsPage,
} from '@oxide/api'
import {
  Cpu16Icon,
  Listbox,
  Metrics24Icon,
  PageHeader,
  PageTitle,
  Ram16Icon,
  ResourceMeter,
  Spinner,
  Ssd16Icon,
  Table,
  Tabs,
} from '@oxide/ui'
import { bytesToGiB, bytesToTiB } from '@oxide/util'

import { CapacityBar, capacityQueryParams } from 'app/components/CapacityBar'
import { useDateTimeRangePicker } from 'app/components/form'
import { QueryParamTabs } from 'app/components/QueryParamTabs'
import { useIntervalPicker } from 'app/components/RefetchIntervalPicker'
import { SystemMetric } from 'app/components/SystemMetric'

import { tabularizeSiloMetrics } from './metrics-util'

SystemUtilizationPage.loader = async () => {
  await Promise.all([
    apiQueryClient.prefetchQuery('siloList', {}),
    apiQueryClient.prefetchQuery('systemMetric', {
      path: { metricName: 'cpus_provisioned' },
      query: capacityQueryParams,
    }),
    apiQueryClient.prefetchQuery('systemMetric', {
      path: { metricName: 'cpus_quota' },
      query: capacityQueryParams,
    }),
    apiQueryClient.prefetchQuery('systemMetric', {
      path: { metricName: 'ram_provisioned' },
      query: capacityQueryParams,
    }),
    apiQueryClient.prefetchQuery('systemMetric', {
      path: { metricName: 'ram_quota' },
      query: capacityQueryParams,
    }),
    apiQueryClient.prefetchQuery('systemMetric', {
      path: { metricName: 'virtual_disk_space_provisioned' },
      query: capacityQueryParams,
    }),
    apiQueryClient.prefetchQuery('systemMetric', {
      path: { metricName: 'virtual_disk_space_quota' },
      query: capacityQueryParams,
    }),
    apiQueryClient.prefetchQuery('sledList', {}),
  ])
  return null
}

export function SystemUtilizationPage() {
  const { data: sleds } = usePrefetchedApiQuery('sledList', {})
  const { data: silos } = usePrefetchedApiQuery('siloList', {})

  const capacity = totalCapacity(sleds.items)

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Metrics24Icon />}>Utilization</PageTitle>
      </PageHeader>

      <h2 className="flex items-center gap-1.5 p-3 text-mono-sm text-secondary ">
        Capacity available
      </h2>
      <div className="mb-12 flex min-w-min flex-col gap-3 lg+:flex-row">
        <CapacityBar
          icon={<Cpu16Icon />}
          title="CPU"
          unit="nCPUs"
          metricName="cpus_provisioned"
          provisioned={57}
          quota={80}
          capacity={capacity.cpu}
        />
        <CapacityBar
          icon={<Ssd16Icon />}
          title="Disk"
          unit="TiB"
          metricName="virtual_disk_space_provisioned"
          valueTransform={bytesToTiB}
          provisioned={2}
          quota={15}
          capacity={capacity.disk_tib}
        />
        <CapacityBar
          icon={<Ram16Icon />}
          title="Memory"
          unit="GiB"
          metricName="ram_provisioned"
          valueTransform={bytesToGiB}
          provisioned={391}
          quota={500}
          capacity={capacity.ram_gib}
        />
      </div>
      <QueryParamTabs defaultValue="summary" className="full-width">
        <Tabs.List>
          <Tabs.Trigger value="summary">Summary</Tabs.Trigger>
          <Tabs.Trigger value="metrics">Metrics</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="summary">
          <UsageTab silos={silos} />
        </Tabs.Content>
        <Tabs.Content value="metrics">
          <MetricsTab capacity={capacity} silos={silos} />
        </Tabs.Content>
      </QueryParamTabs>
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

function UsageTab({ silos }: { silos: SiloResultsPage }) {
  const results = useApiQueries(
    'systemMetric',
    silos.items.flatMap((silo) => {
      const query = { ...capacityQueryParams, silo: silo.name }
      return [
        { path: { metricName: 'virtual_disk_space_provisioned' as const }, query },
        { path: { metricName: 'virtual_disk_space_quota' as const }, query },
        { path: { metricName: 'ram_provisioned' as const }, query },
        { path: { metricName: 'ram_quota' as const }, query },
        { path: { metricName: 'cpus_provisioned' as const }, query },
        { path: { metricName: 'cpus_quota' as const }, query },
      ]
    })
  )

  if (results.some((result) => result.isPending))
    return <Spinner className="ml-6" size="lg" />

  const mergedResults = tabularizeSiloMetrics(results)

  return (
    <Table className="w-full">
      <Table.Header>
        <Table.HeaderRow>
          <Table.HeadCell>Silo</Table.HeadCell>
          {/* data-test-ignore makes the row asserts work in the e2e tests */}
          <Table.HeadCell colSpan={3} data-test-ignore>
            Provisioned / Quota
          </Table.HeadCell>
          <Table.HeadCell colSpan={3} data-test-ignore>
            Available
          </Table.HeadCell>
        </Table.HeaderRow>
        <Table.HeaderRow>
          <Table.HeadCell data-test-ignore></Table.HeadCell>
          <Table.HeadCell>CPU</Table.HeadCell>
          <Table.HeadCell>Disk</Table.HeadCell>
          <Table.HeadCell>Memory</Table.HeadCell>
          <Table.HeadCell>CPU</Table.HeadCell>
          <Table.HeadCell>Disk</Table.HeadCell>
          <Table.HeadCell>Memory</Table.HeadCell>
        </Table.HeaderRow>
      </Table.Header>
      <Table.Body>
        {mergedResults.map((result) => (
          <Table.Row key={result.siloName}>
            <Table.Cell width="16%">{result.siloName}</Table.Cell>
            <Table.Cell width="14%">
              <div className="flex flex-col">
                <div>{result.metrics.cpus_provisioned} /</div>
                {/* dummy data for now */}
                <div className="text-quaternary">{result.metrics.cpus_provisioned}</div>
              </div>
            </Table.Cell>
            <Table.Cell width="14%">
              <div className="flex flex-col">
                <div>{bytesToTiB(result.metrics.virtual_disk_space_provisioned)} /</div>
                <div className="inline-block text-quaternary">
                  {bytesToTiB(result.metrics.virtual_disk_space_provisioned)} TiB
                </div>
              </div>
            </Table.Cell>
            <Table.Cell width="14%">
              <div className="flex flex-col">
                <div>{bytesToGiB(result.metrics.ram_provisioned)} /</div>
                <div className="inline-block text-quaternary">
                  {bytesToGiB(result.metrics.ram_provisioned)} GiB
                </div>
              </div>
            </Table.Cell>
            <Table.Cell width="14%">
              <div className="flex w-full items-center justify-between">
                {/* dummy data for now */}
                <div>8</div>
                <ResourceMeter value={60} />
              </div>
            </Table.Cell>
            <Table.Cell width="14%">
              <div className="flex w-full items-center justify-between">
                <div>100</div>
                <ResourceMeter value={40} />
              </div>
            </Table.Cell>
            <Table.Cell width="14%">
              <div className="flex w-full items-center justify-between">
                <div>552</div>
                <ResourceMeter value={80} />
              </div>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  )
}
