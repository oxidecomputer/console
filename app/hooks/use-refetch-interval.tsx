import { useState } from 'react'

import { Listbox } from '@oxide/ui'

type RefetchIntervalKey = 'Off' | '5s' | '10s' | '1m' | '2m' | '5m'
type RefetchInterval = false | 5_000 | 10_000 | 60_000 | 120_000 | 300_000

const intervalValues: Record<RefetchIntervalKey, RefetchInterval> = {
  Off: false,
  '5s': 5_000,
  '10s': 10_000,
  '1m': 60_000,
  '2m': 120_000,
  '5m': 300_000,
}

const intervalItems = Object.keys(intervalValues).map((k) => ({ label: k, value: k }))

export function useRefetchInterval(initialKey: RefetchIntervalKey = 'Off') {
  const [intervalKey, setIntervalKey] = useState<RefetchIntervalKey>(initialKey)
  return {
    refetchInterval: intervalValues[intervalKey],
    intervalListbox: (
      // TODO: this is actually more of a menu button in the design?
      <Listbox
        items={intervalItems}
        defaultValue={initialKey}
        onChange={(item) => {
          if (item) {
            setIntervalKey(item.value as RefetchIntervalKey)
          }
        }}
      />
    ),
  }
}
