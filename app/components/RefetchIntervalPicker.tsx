/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import cn from 'classnames'
import { useEffect, useState } from 'react'

import { Refresh16Icon, Time16Icon } from '@oxide/design-system/icons/react'

import { Listbox, type ListboxItem } from '~/ui/lib/Listbox'
import { SpinnerLoader } from '~/ui/lib/Spinner'
import { useInterval } from '~/ui/lib/use-interval'
import { toLocaleTimeString } from '~/util/date'

const intervalPresets = {
  Off: undefined,
  '10s': 10 * 1000,
  '1m': 60 * 1000,
  '2m': 2 * 60 * 1000,
  '5m': 5 * 60 * 1000,
}

type IntervalPreset = keyof typeof intervalPresets

const intervalItems: ListboxItem<IntervalPreset>[] = [
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
  const [intervalPreset, setIntervalPreset] = useState<IntervalPreset>('10s')

  const [lastFetched, setLastFetched] = useState(new Date())
  useEffect(() => {
    if (isLoading) setLastFetched(new Date())
  }, [isLoading])

  const delay = enabled ? intervalPresets[intervalPreset] : null
  useInterval({ fn, delay })

  return {
    intervalMs: (enabled && intervalPresets[intervalPreset]) || undefined,
    intervalPicker: (
      <div className="mb-12 flex items-center justify-between">
        <div className="hidden items-center gap-2 text-right text-mono-sm text-tertiary lg+:flex">
          <Time16Icon className="text-quaternary" /> Refreshed{' '}
          {toLocaleTimeString(lastFetched)}
        </div>
        <div className="flex">
          <button
            type="button"
            className={cn(
              'flex w-10 items-center justify-center rounded-l border-b border-l border-t border-default disabled:cursor-default',
              isLoading && 'hover:bg-hover',
              !enabled && 'cursor-not-allowed bg-disabled'
            )}
            onClick={fn}
            disabled={isLoading || !enabled}
          >
            <SpinnerLoader isLoading={isLoading}>
              <Refresh16Icon className="text-secondary" />
            </SpinnerLoader>
          </button>
          <Listbox
            selected={enabled ? intervalPreset : 'Off'}
            className="w-24 [&>button]:!rounded-l-none"
            items={intervalItems}
            onChange={setIntervalPreset}
            disabled={!enabled}
          />
        </div>
      </div>
    ),
  }
}
