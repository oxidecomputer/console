import cn from 'classnames'
import { format } from 'date-fns'
import { useEffect, useState } from 'react'

import {
  Listbox,
  type ListboxItem,
  Refresh16Icon,
  SpinnerLoader,
  Time16Icon,
  useInterval,
} from '@oxide/ui'

import type { RangeKeyAll } from './form'

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

type Props = {
  rangePreset: RangeKeyAll // TODO: convert to boring `enabled` prop, figure out how to do `key` part
  isRefetching: boolean
  handleRefetch: () => void
}

export function RefetchIntervalPicker({ rangePreset, isRefetching, handleRefetch }: Props) {
  const [refetchInterval, setRefetchInterval] = useState<RefetchInterval>('10s')

  const [lastFetched, setLastFetched] = useState(new Date())
  useEffect(() => {
    if (isRefetching) setLastFetched(new Date())
  }, [isRefetching])

  useInterval({
    fn: handleRefetch,
    delay: rangePreset !== 'custom' ? refetchPresets[refetchInterval] : null,
    key: rangePreset, // force a render which clears current interval
  })

  return (
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
  )
}
