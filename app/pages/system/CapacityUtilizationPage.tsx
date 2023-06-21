import { getLocalTimeZone, now } from '@internationalized/date'
import { useIsFetching } from '@tanstack/react-query'
import cn from 'classnames'
import { format } from 'date-fns'
import { useEffect, useMemo, useState } from 'react'

import { FLEET_ID, apiQueryClient, useApiQuery } from '@oxide/api'
import {
  Cpu16Icon,
  Divider,
  Listbox,
  PageHeader,
  PageTitle,
  Ram16Icon,
  Snapshots24Icon,
  Ssd16Icon,
  Time16Icon,
} from '@oxide/ui'
import { type ListboxItem, Refresh16Icon, SpinnerLoader, useInterval } from '@oxide/ui'
import { bytesToGiB, bytesToTiB } from '@oxide/util'

import { CapacityMetric } from 'app/components/CapacityMetric'
import { SystemMetric } from 'app/components/SystemMetric'
import { useDateTimeRangePicker } from 'app/components/form'

CapacityUtilizationPage.loader = async () => {
  await apiQueryClient.prefetchQuery('siloList', {})
  return null
}

export function CapacityUtilizationPage() {
  const { data: silos } = useApiQuery('siloList', {})

  const siloItems = useMemo(() => {
    const items = silos?.items.map((silo) => ({ label: silo.name, value: silo.id })) || []
    return [{ label: 'All silos', value: FLEET_ID }, ...items]
  }, [silos])

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
          capacity={900}
        />
        <CapacityMetric
          icon={<Ram16Icon />}
          title="Memory capacity"
          metricName="ram_provisioned"
          valueTransform={bytesToGiB}
          capacity={28000}
        />
        <CapacityMetric
          icon={<Cpu16Icon />}
          title="CPU capacity"
          metricName="cpus_provisioned"
          capacity={2048}
        />
      </div>

      <UtilizationPage filterItems={siloItems} defaultId={FLEET_ID} />
    </>
  )
}

const refetchPresets = {
  Off: null,
  '10s': 10 * 1000,
  '1m': 60 * 1000,
  '2m': 2 * 60 * 1000,
  '5m': 5 * 60 * 1000,
}

type RefetchInterval = keyof typeof refetchPresets

const refetchIntervalItems: ListboxItem<RefetchInterval>[] = [
  { label: 'Off', value: 'Off' },
  { label: '10s', value: '10s' },
  { label: '1m', value: '1m' },
  { label: '2m', value: '2m' },
  { label: '5m', value: '5m' },
]

export const UtilizationPage = ({
  filterItems,
  defaultId,
}: {
  filterItems: ListboxItem[]
  defaultId: string
}) => {
  const [filterId, setFilterId] = useState<string>(defaultId)

  // pass refetch interval to this to keep the date up to date
  const { preset, startTime, endTime, dateTimeRangePicker, onRangeChange } =
    useDateTimeRangePicker({
      initialPreset: 'lastHour',
      maxValue: now(getLocalTimeZone()),
    })

  const commonProps = {
    startTime: startTime.toDate(getLocalTimeZone()),
    endTime: endTime.toDate(getLocalTimeZone()),
    filterId: filterId,
  }

  const [refetchInterval, setRefetchInterval] = useState<RefetchInterval>('10s')

  const isRefetching = !!useIsFetching({ queryKey: ['systemMetric'] })

  const [lastFetched, setLastFetched] = useState(new Date())
  useEffect(() => {
    if (isRefetching) setLastFetched(new Date())
  }, [isRefetching])

  const handleRefetch = () => {
    // slide the window forward if we're on a preset
    onRangeChange(preset)
    // very important to filter for active, otherwise this refetches every
    // window that has ever been active
    apiQueryClient.refetchQueries('systemMetric', undefined, { type: 'active' })
  }

  useInterval({
    fn: handleRefetch,
    delay: preset !== 'custom' ? refetchPresets[refetchInterval] : null,
    key: preset, // force a render which clears current interval
  })

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

      <div className="mb-12 flex items-center justify-between">
        <div className="hidden items-center gap-2 text-right text-mono-sm text-quaternary lg+:flex">
          <Time16Icon className="text-quinary" /> Refreshed {format(lastFetched, 'HH:mm')}
        </div>
        <div className="flex">
          <button
            className={cn(
              'flex w-10 items-center justify-center rounded-l border-l border-t border-b border-default disabled:cursor-default',
              isRefetching && 'hover:bg-hover'
            )}
            onClick={handleRefetch}
            disabled={isRefetching}
          >
            <SpinnerLoader isLoading={isRefetching}>
              <Refresh16Icon className="text-tertiary" />
            </SpinnerLoader>
          </button>
          <Listbox
            selected={refetchInterval}
            className="w-24 [&>button]:!rounded-l-none"
            aria-labelledby="silo-id-label"
            name="silo-id"
            items={refetchIntervalItems}
            onChange={setRefetchInterval}
          />
        </div>
      </div>

      <div className="mt-8 mb-12 space-y-12">
        <div className="flex flex-col gap-3">
          <SystemMetric
            {...commonProps}
            metricName="virtual_disk_space_provisioned"
            title="Disk Space"
            unit="TiB"
            valueTransform={bytesToTiB}
            capacity={900}
          />
        </div>

        <SystemMetric
          {...commonProps}
          metricName="cpus_provisioned"
          title="CPU"
          unit="count"
          capacity={2048}
        />

        <SystemMetric
          {...commonProps}
          metricName="ram_provisioned"
          title="Memory"
          unit="GiB"
          valueTransform={bytesToGiB}
          capacity={28000}
        />
      </div>
    </>
  )
}
