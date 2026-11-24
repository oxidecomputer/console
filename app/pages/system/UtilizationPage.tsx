/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { getLocalTimeZone, now } from '@internationalized/date'
import { useIsFetching } from '@tanstack/react-query'
import { getCoreRowModel } from '@tanstack/react-table'
import { useCallback, useMemo, useState } from 'react'

import {
  api,
  FLEET_ID,
  getListQFn,
  queryClient,
  totalUtilization,
  usePrefetchedQuery,
  type SiloUtilization,
} from '@oxide/api'
import { Metrics16Icon, Metrics24Icon } from '@oxide/design-system/icons/react'

import { CapacityBars } from '~/components/CapacityBars'
import { DocsPopover } from '~/components/DocsPopover'
import { useDateTimeRangePicker } from '~/components/form/fields/DateTimeRangePicker'
import { QueryParamTabs } from '~/components/QueryParamTabs'
import { useIntervalPicker } from '~/components/RefetchIntervalPicker'
import { SystemMetric } from '~/components/SystemMetric'
import { EditQuotasSideModalForm } from '~/forms/silo-quotas-edit'
import { LinkCell } from '~/table/cells/LinkCell'
import { createColumnHelper } from '~/table/column-helper'
import { useColsWithActions } from '~/table/columns/action-col'
import { ColWidth } from '~/table/columns/common'
import { Table } from '~/table/Table'
import { useTable } from '~/table/use-table'
import { Listbox } from '~/ui/lib/Listbox'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { ResourceMeter } from '~/ui/lib/ResourceMeter'
import { Tabs } from '~/ui/lib/Tabs'
import { ALL_ISH } from '~/util/consts'
import { docLinks } from '~/util/links'
import { round } from '~/util/math'
import { pb } from '~/util/path-builder'
import { bytesToGiB, bytesToTiB } from '~/util/units'

const siloList = getListQFn(api.siloList, {
  query: { limit: ALL_ISH },
})
const siloUtilList = getListQFn(api.siloUtilizationList, {
  query: { limit: ALL_ISH },
})

export async function clientLoader() {
  await Promise.all([
    queryClient.prefetchQuery(siloList.optionsFn()),
    queryClient.prefetchQuery(siloUtilList.optionsFn()),
  ])
  return null
}

export const handle = { crumb: 'Utilization' }

export default function SystemUtilizationPage() {
  const { data: siloUtilizationList } = usePrefetchedQuery(siloUtilList.optionsFn())

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
      <QueryParamTabs defaultValue="summary" className="full-width mt-8">
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
  const { data: silos } = usePrefetchedQuery(siloList.optionsFn())

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
      <div className="max-1000:flex-col mt-8 mb-3 flex flex-wrap justify-between gap-3">
        <div className="max-1000:w-full max-1000:flex-col flex gap-2">
          {intervalPicker}

          <Listbox
            selected={filterId}
            className="max-1000:w-full w-52"
            label="Filter by silo"
            hideLabel
            name="filter-id"
            items={siloItems}
            onChange={setFilterId}
          />
        </div>
        <div className="max-1000:w-full flex items-center gap-2">{dateTimeRangePicker}</div>
      </div>
      <div className="mb-4 space-y-4">
        <SystemMetric
          {...commonProps}
          metricName="cpus_provisioned"
          title="CPU"
          unit="Count"
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

// `id` so the row actions get a Copy ID item
type SiloUtilRow = SiloUtilization & { id: string }

const colHelper = createColumnHelper<SiloUtilRow>()

const usageCols = [
  colHelper.accessor('siloName', {
    header: 'Silo',
    meta: { width: 'flex' },
    cell: (info) => (
      <LinkCell to={pb.silo({ silo: info.getValue() })}>{info.getValue()}</LinkCell>
    ),
  }),
  colHelper.group({
    id: 'provisioned',
    header: 'Provisioned / Quota',
    columns: [
      colHelper.display({
        id: 'provisionedCpu',
        header: 'CPU',
        meta: { width: ColWidth.md },
        cell: ({ row: { original: s } }) => (
          <UsageCell provisioned={s.provisioned.cpus} allocated={s.allocated.cpus} />
        ),
      }),
      colHelper.display({
        id: 'provisionedMemory',
        header: 'Memory',
        meta: { width: ColWidth.md },
        cell: ({ row: { original: s } }) => (
          <UsageCell
            provisioned={bytesToGiB(s.provisioned.memory)}
            allocated={bytesToGiB(s.allocated.memory)}
            unit="GiB"
          />
        ),
      }),
      colHelper.display({
        id: 'provisionedStorage',
        header: 'Storage',
        meta: { width: ColWidth.md },
        cell: ({ row: { original: s } }) => (
          <UsageCell
            provisioned={bytesToTiB(s.provisioned.storage)}
            allocated={bytesToTiB(s.allocated.storage)}
            unit="TiB"
          />
        ),
      }),
    ],
  }),
  colHelper.group({
    id: 'available',
    header: 'Available',
    columns: [
      colHelper.display({
        id: 'availableCpu',
        header: 'CPU',
        meta: { width: ColWidth.lg, tdClassName: 'relative' },
        cell: ({ row: { original: s } }) => (
          <AvailableCell provisioned={s.provisioned.cpus} allocated={s.allocated.cpus} />
        ),
      }),
      colHelper.display({
        id: 'availableMemory',
        header: 'Memory',
        meta: { width: ColWidth.lg, tdClassName: 'relative' },
        cell: ({ row: { original: s } }) => (
          <AvailableCell
            provisioned={bytesToGiB(s.provisioned.memory)}
            allocated={bytesToGiB(s.allocated.memory)}
            unit="GiB"
          />
        ),
      }),
      colHelper.display({
        id: 'availableStorage',
        header: 'Storage',
        meta: { width: ColWidth.lg, tdClassName: 'relative' },
        cell: ({ row: { original: s } }) => (
          <AvailableCell
            provisioned={bytesToTiB(s.provisioned.storage)}
            allocated={bytesToTiB(s.allocated.storage)}
            unit="TiB"
          />
        ),
      }),
    ],
  }),
]

function UsageTab() {
  const { data: siloUtilizations } = usePrefetchedQuery(siloUtilList.optionsFn())

  // silo whose quotas are being edited, if any
  const [editingSilo, setEditingSilo] = useState<SiloUtilization | null>(null)

  const rows = useMemo(
    () => siloUtilizations.items.map((silo) => ({ ...silo, id: silo.siloId })),
    [siloUtilizations]
  )
  const columns = useColsWithActions(
    usageCols,
    useCallback(
      (silo: SiloUtilRow) => [
        { label: 'Edit quotas', onActivate: () => setEditingSilo(silo) },
      ],
      []
    ),
    'Copy silo ID'
  )
  const table = useTable({
    id: 'silo-utilization',
    columns,
    data: rows,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <>
      <Table table={table} rowHeight="large" />
      {editingSilo && (
        <EditQuotasSideModalForm
          silo={editingSilo.siloName}
          quotas={editingSilo.allocated}
          provisioned={editingSilo.provisioned}
          onDismiss={() => setEditingSilo(null)}
        />
      )}
    </>
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
  <div className="text-secondary flex flex-col tabular-nums">
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
