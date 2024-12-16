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
  type SiloUtilization,
} from '@oxide/api'
import { Metrics16Icon, Metrics24Icon } from '@oxide/design-system/icons/react'

import { CapacityBars } from '~/components/CapacityBars'
import { DocsPopover } from '~/components/DocsPopover'
import { useDateTimeRangePicker } from '~/components/form/fields/DateTimeRangePicker'
import { QueryParamTabs } from '~/components/QueryParamTabs'
import { useIntervalPicker } from '~/components/RefetchIntervalPicker'
import { SystemMetric } from '~/components/SystemMetric'
import { LinkCell } from '~/table/cells/LinkCell'
import { RowActions } from '~/table/columns/action-col'
import { Listbox } from '~/ui/lib/Listbox'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { ResourceMeter } from '~/ui/lib/ResourceMeter'
import { Table } from '~/ui/lib/Table'
import { Tabs } from '~/ui/lib/Tabs'
import { docLinks } from '~/util/links'
import { round } from '~/util/math'
import { pb } from '~/util/path-builder'
import {
  bytesToGiB,
  bytesToTiB,
  formatBytesAs,
  getUnit,
  type BinaryUnit,
} from '~/util/units'

export async function loader() {
  await Promise.all([
    apiQueryClient.prefetchQuery('siloList', {}),
    apiQueryClient.prefetchQuery('siloUtilizationList', {}),
  ])
  return null
}

Component.displayName = 'SystemUtilizationPage'
export function Component() {
  const { data: siloUtilizationList } = usePrefetchedApiQuery('siloUtilizationList', {})

  const { totalAllocated, totalProvisioned } = totalUtilization(siloUtilizationList.items)

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Metrics24Icon />}>Utilization</PageTitle>
        <DocsPopover
          heading="utilization"
          icon={<Metrics16Icon />}
          summary="System metrics let you monitor utilization of CPU, memory, and storage against silo-level quotas."
          links={[docLinks.systemMetrics]}
        />
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
          <Table.HeadCell data-test-ignore></Table.HeadCell>
        </Table.HeaderRow>
        <Table.HeaderRow>
          <Table.HeadCell data-test-ignore></Table.HeadCell>
          <Table.HeadCell>CPU</Table.HeadCell>
          <Table.HeadCell>Memory</Table.HeadCell>
          <Table.HeadCell>Storage</Table.HeadCell>
          <Table.HeadCell>CPU</Table.HeadCell>
          <Table.HeadCell>Memory</Table.HeadCell>
          <Table.HeadCell>Storage</Table.HeadCell>
          <Table.HeadCell data-test-ignore></Table.HeadCell>
        </Table.HeaderRow>
      </Table.Header>
      <Table.Body>
        {siloUtilizations.items.map((silo) => (
          <Table.Row key={silo.siloName}>
            <Table.Cell width="16%" height="large">
              <LinkCell to={pb.silo({ silo: silo.siloName })}>{silo.siloName}</LinkCell>
            </Table.Cell>
            <Table.Cell width="14%" height="large">
              <UsageCell
                provisioned={silo.provisioned.cpus}
                allocated={silo.allocated.cpus}
              />
            </Table.Cell>
            <Table.Cell width="14%" height="large">
              <SiloCell cellType="usage" silo={silo} resource="memory" />
            </Table.Cell>
            <Table.Cell width="14%" height="large">
              <SiloCell cellType="usage" silo={silo} resource="storage" />
            </Table.Cell>
            <Table.Cell width="14%" className="relative" height="large">
              <AvailableCell
                provisioned={silo.provisioned.cpus}
                allocated={silo.allocated.cpus}
                usagePercent={(silo.provisioned.cpus / silo.allocated.cpus) * 100}
              />
            </Table.Cell>
            <Table.Cell width="14%" className="relative" height="large">
              <SiloCell cellType="available" silo={silo} resource="memory" />
            </Table.Cell>
            <Table.Cell width="14%" className="relative" height="large">
              <SiloCell cellType="available" silo={silo} resource="storage" />
            </Table.Cell>
            <Table.Cell className="action-col w-10 children:p-0" height="large">
              <RowActions id={silo.siloId} copyIdLabel="Copy silo ID" />
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  )
}

type CellProps = { provisioned: number; allocated: number; unit?: BinaryUnit }

const UsageCell = ({ provisioned, allocated, unit }: CellProps) => (
  <div className="flex flex-col text-secondary">
    <div>
      <span className="text-raise">{provisioned}</span> /
    </div>
    <div className="text-secondary">
      {allocated} {unit && <span className="text-tertiary">{unit}</span>}
    </div>
  </div>
)

const AvailableCell = ({
  provisioned,
  allocated,
  unit,
  usagePercent,
}: CellProps & { usagePercent: number }) => {
  return (
    <div className="flex w-full items-center justify-between">
      <div>
        {round(allocated - provisioned, 2)}
        {unit && <span className="text-secondary"> {unit}</span>}
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

type SiloCellProps = {
  silo: SiloUtilization
  // CPUs have simpler data representations, so we don't use SiloCell for them
  resource: 'memory' | 'storage'
  cellType: 'usage' | 'available'
}

/** A wrapper around the UsageCell and AvailableCell components,
    for rendering the silo's memory and storage resources */
const SiloCell = ({ silo, resource, cellType }: SiloCellProps) => {
  // Get the raw values from the silo object
  const provisionedRaw = silo.provisioned[resource]
  const allocatedRaw = silo.allocated[resource]
  // Use those to get the standardized unit
  const unit = getUnit(Math.max(provisionedRaw, allocatedRaw))
  const provisioned = formatBytesAs(provisionedRaw, unit)
  const allocated = formatBytesAs(allocatedRaw, unit)
  if (cellType === 'usage')
    return <UsageCell provisioned={provisioned} allocated={allocated} unit={unit} />

  // Use the original values to calculate the usage percentage
  const usagePercent = (provisionedRaw / allocatedRaw) * 100
  return (
    <AvailableCell
      provisioned={provisioned}
      allocated={allocated}
      unit={unit}
      usagePercent={usagePercent}
    />
  )
}
