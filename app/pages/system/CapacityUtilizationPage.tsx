import { getLocalTimeZone, now } from '@internationalized/date'
import cn from 'classnames'
import { format } from 'date-fns'
import { useMemo, useState } from 'react'

import { apiQueryClient, useApiQuery } from '@oxide/api'
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
import { Refresh16Icon, Spinner } from '@oxide/ui'
import { bytesToGiB, bytesToTiB } from '@oxide/util'

import { CapacityMetric } from 'app/components/CapacityMetric'
import { SystemMetric } from 'app/components/SystemMetric'
import { useDateTimeRangePicker } from 'app/components/form'

const FLEET_ID = '001de000-1334-4000-8000-000000000000'

const refetchIntervalPresets = [
  { label: 'Off', value: '-1' },
  { label: '10s', value: '10000' },
  { label: '1m', value: '60000' },
  { label: '2m', value: '120000' },
  { label: '5m', value: '300000' },
]

CapacityUtilizationPage.loader = async () => {
  await apiQueryClient.prefetchQuery('siloList', {})
  return null
}

export function CapacityUtilizationPage() {
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [siloId, setSiloId] = useState<string>(FLEET_ID)
  const { data: silos } = useApiQuery('siloList', {})

  const initialPreset = 'lastHour'
  // pass refetch interval to this to keep the date up to date
  const { startTime, endTime, dateTimeRangePicker } = useDateTimeRangePicker({
    initialPreset,
    maxValue: now(getLocalTimeZone()),
  })

  const siloItems = useMemo(() => {
    const items = silos?.items.map((silo) => ({ label: silo.name, value: silo.id })) || []
    return [{ label: 'All silos', value: FLEET_ID }, ...items]
  }, [silos])

  const commonProps = {
    startTime: startTime.toDate(getLocalTimeZone()),
    endTime: endTime.toDate(getLocalTimeZone()),
    filterId: siloId,
  }

  const [refetchInterval, setRefetchInterval] = useState(refetchIntervalPresets[1].value)
  const [refetchStatus, setRefetchStatus] = useState<
    'pending' | 'fulfilled' | 'error' | null
  >()

  const handleRefetch = async () => {
    const refetch = apiQueryClient.refetchQueries('systemMetric')
    setRefetchStatus('pending')

    refetch.then(
      () => {
        setRefetchStatus('fulfilled')
      },
      () => {
        setRefetchStatus('error')
      }
    )
  }

  const [lastUpdated, setLastUpdated] = useState(Date.now())

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

      <div className="my-8 flex justify-between gap-3">
        <Listbox
          selectedItem={siloId}
          className="w-48"
          aria-labelledby="silo-id-label"
          name="silo-id"
          items={siloItems}
          onChange={(item) => {
            if (item) {
              setSiloId(item.value)
            }
          }}
        />

        <div className="flex items-center gap-2">{dateTimeRangePicker}</div>
      </div>

      <Divider className="!mx-0 mb-6 !w-full" />

      <div className="mb-8 flex items-center justify-between">
        <div className="hidden text-right text-sans-md text-quaternary lg+:block">
          Updated {format(lastUpdated, 'hh:mm')}
        </div>
        <div className="flex">
          <button
            className={cn(
              'flex w-10 items-center justify-center rounded-l border-l border-t border-b border-default disabled:cursor-default',
              refetchStatus !== 'pending' && 'hover:bg-hover'
            )}
            onClick={handleRefetch}
            disabled={refetchStatus === 'pending'}
          >
            {refetchStatus === 'pending' ? (
              <Spinner />
            ) : (
              <Refresh16Icon className="text-tertiary" />
            )}
          </button>
          <Listbox
            selectedItem={refetchInterval}
            className="w-24 [&>button]:!rounded-l-none"
            aria-labelledby="silo-id-label"
            name="silo-id"
            items={refetchIntervalPresets}
            onChange={(item) => {
              if (item) {
                setRefetchInterval(item.value)
              }
            }}
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
            refetchInterval={Number(refetchInterval)}
            onUpdate={() => setLastUpdated(Date.now())}
          />
        </div>

        {/* TODO: figure out how to make this not show .5s in the y axis when the numbers are low */}
        <SystemMetric
          {...commonProps}
          metricName="cpus_provisioned"
          title="CPU"
          unit="count"
          capacity={2048}
          refetchInterval={Number(refetchInterval)}
          onUpdate={() => setLastUpdated(Date.now())}
        />

        <SystemMetric
          {...commonProps}
          metricName="ram_provisioned"
          title="Memory"
          unit="GiB"
          valueTransform={bytesToGiB}
          capacity={28000}
          refetchInterval={Number(refetchInterval)}
          onUpdate={() => setLastUpdated(Date.now())}
        />
      </div>
    </>
  )
}
