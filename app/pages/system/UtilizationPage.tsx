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
  totalUtilization,
  usePrefetchedApiQuery,
} from '@oxide/api'
import { Metrics24Icon } from '@oxide/design-system/icons/react'

import { useDateTimeRangePicker } from '~/components/form/fields/DateTimeRangePicker'
import { Listbox } from '~/ui/lib/Listbox'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { ResourceMeter } from '~/ui/lib/ResourceMeter'
import { Table } from '~/ui/lib/Table'
import { Tabs } from '~/ui/lib/Tabs'
import { round } from '~/util/math'
import { bytesToGiB, bytesToTiB } from '~/util/units'
import { CapacityBars } from 'app/components/CapacityBars'
import { QueryParamTabs } from 'app/components/QueryParamTabs'
import { useIntervalPicker } from 'app/components/RefetchIntervalPicker'
import { SystemMetric } from 'app/components/SystemMetric'

SystemUtilizationPage.loader = async () => {
  await Promise.all([
    apiQueryClient.prefetchQuery('siloList', {}),
    apiQueryClient.prefetchQuery('siloUtilizationList', {}),
  ])
  return null
}

export function SystemUtilizationPage() {
  const { data: siloUtilizationList } = usePrefetchedApiQuery('siloUtilizationList', {})

  const { totalAllocated, totalProvisioned } = totalUtilization(siloUtilizationList.items)

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Metrics24Icon />}>Utilization</PageTitle>
      </PageHeader>

      <CapacityBars
        allocated={totalAllocated}
        provisioned={totalProvisioned}
        allocatedLabel="Quota (Total)"
      />
      <QueryParamTabs defaultValue="summary" className="full-width">
        <Tabs.List>
          <Tabs.Trigger value="summary">Summary</Tabs.Trigger>
          <Tabs.Trigger value="metrics">Metrics</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="summary">
          <UsageTab />
        </Tabs.Content>
        <Tabs.Content value="metrics">
          <MetricsTab />
        </Tabs.Content>
      </QueryParamTabs>
    </>
  )
}

const MetricsTab = () => {
  const { data: silos } = usePrefetchedApiQuery('siloList', {})

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
          className="w-64"
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
          metricName="cpus_provisioned"
          title="CPU"
          unit="count"
        />
        <SystemMetric
          {...commonProps}
          metricName="ram_provisioned"
          title="Memory"
          unit="GiB"
          valueTransform={bytesToGiB}
        />
        <SystemMetric
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

function UsageTab() {
  const { data: siloUtilizations } = usePrefetchedApiQuery('siloUtilizationList', {})
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
          <Table.HeadCell>Memory</Table.HeadCell>
          <Table.HeadCell>Storage</Table.HeadCell>
          <Table.HeadCell>CPU</Table.HeadCell>
          <Table.HeadCell>Memory</Table.HeadCell>
          <Table.HeadCell>Storage</Table.HeadCell>
        </Table.HeaderRow>
      </Table.Header>
      <Table.Body>
        {siloUtilizations.items.map((silo) => (
          <Table.Row key={silo.siloName}>
            <Table.Cell width="16%">{silo.siloName}</Table.Cell>
            <Table.Cell width="14%">
              <UsageCell
                provisioned={silo.provisioned.cpus}
                allocated={silo.allocated.cpus}
              />
            </Table.Cell>
            <Table.Cell width="14%">
              <UsageCell
                provisioned={bytesToGiB(silo.provisioned.memory)}
                allocated={bytesToGiB(silo.allocated.memory)}
                unit="GiB"
              />
            </Table.Cell>
            <Table.Cell width="14%">
              <UsageCell
                provisioned={bytesToTiB(silo.provisioned.storage)}
                allocated={bytesToTiB(silo.allocated.storage)}
                unit="TiB"
              />
            </Table.Cell>
            <Table.Cell width="14%" className="relative">
              <AvailableCell
                provisioned={silo.provisioned.cpus}
                allocated={silo.allocated.cpus}
              />
            </Table.Cell>
            <Table.Cell width="14%" className="relative">
              <AvailableCell
                provisioned={bytesToGiB(silo.provisioned.memory)}
                allocated={bytesToGiB(silo.allocated.memory)}
                unit="GiB"
              />
            </Table.Cell>
            <Table.Cell width="14%" className="relative">
              <AvailableCell
                provisioned={bytesToTiB(silo.provisioned.storage)}
                allocated={bytesToTiB(silo.allocated.storage)}
                unit="TiB"
              />
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  )
}

const UsageCell = ({
  provisioned,
  allocated,
  unit,
}: {
  provisioned: number
  allocated: number
  unit?: string
}) => (
  <div className="flex flex-col text-tertiary">
    <div>
      <span className="text-default">{provisioned}</span> /
    </div>
    <div className="text-tertiary">
      {allocated} {unit && <span className="text-quaternary">{unit}</span>}
    </div>
  </div>
)

const AvailableCell = ({
  provisioned,
  allocated,
  unit,
}: {
  provisioned: number
  allocated: number
  unit?: string
}) => {
  const usagePercent = (provisioned / allocated) * 100
  return (
    <div className="flex w-full items-center justify-between">
      <div>
        {round(allocated - provisioned, 2)}
        {unit && <span className="text-tertiary"> {unit}</span>}
      </div>
      {/* We only show the ResourceMeter if the percent crosses the warning threshold (66%) */}
      {usagePercent > 66 && (
        <div className="absolute right-3">
          <ResourceMeter value={usagePercent} />
        </div>
      )}
    </div>
  )
}
