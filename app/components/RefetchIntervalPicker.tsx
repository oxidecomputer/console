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

const refetchPresets = {
  Off: undefined,
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
  enabled: boolean
  isLoading: boolean
  fn: () => void
}

export function useIntervalPicker({ enabled, isLoading, fn }: Props) {
  const [refetchInterval, setRefetchInterval] = useState<RefetchInterval>('10s')

  const [lastFetched, setLastFetched] = useState(new Date())
  useEffect(() => {
    if (isLoading) setLastFetched(new Date())
  }, [isLoading])

  const delay = enabled ? refetchPresets[refetchInterval] : null
  useInterval({ fn, delay })

  return {
    refetchInterval: (enabled && refetchPresets[refetchInterval]) || undefined,
    intervalPicker: (
      <div className="mb-12 flex items-center justify-between">
        <div className="hidden items-center gap-2 text-right text-mono-sm text-quaternary lg+:flex">
          <Time16Icon className="text-quinary" /> Refreshed {format(lastFetched, 'HH:mm')}
        </div>
        <div className="flex">
          <button
            className={cn(
              'flex w-10 items-center justify-center rounded-l border-l border-t border-b border-default disabled:cursor-default',
              isLoading && 'hover:bg-hover'
            )}
            onClick={fn}
            disabled={isLoading}
          >
            <SpinnerLoader isLoading={isLoading}>
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
    ),
  }
}
