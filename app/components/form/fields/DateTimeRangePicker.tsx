import type { DateValue } from '@internationalized/date'
import { getLocalTimeZone, now as getNow } from '@internationalized/date'
import { format } from 'date-fns'
import { useMemo, useState } from 'react'

import { DateRangePicker, Listbox, useInterval } from '@oxide/ui'

const rangePresets = [
  { label: 'Last hour', value: 'lastHour' as const },
  { label: 'Last 3 hours', value: 'last3Hours' as const },
  { label: 'Last day', value: 'lastDay' as const },
  { label: 'Last week', value: 'lastWeek' as const },
  { label: 'Last 30 days', value: 'last30Days' as const },
  { label: 'Custom', value: 'custom' as const },
]

// custom doesn't have an associated range
type RangeKeyAll = (typeof rangePresets)[number]['value']
export type RangeKey = Exclude<RangeKeyAll, 'custom'>

// Record ensures we have an entry for every preset
const computeStart: Record<RangeKey, (now: DateValue) => DateValue> = {
  lastHour: (now) => now.subtract({ hours: 1 }),
  last3Hours: (now) => now.subtract({ hours: 3 }),
  lastDay: (now) => now.subtract({ days: 1 }),
  lastWeek: (now) => now.subtract({ days: 7 }),
  last30Days: (now) => now.subtract({ days: 30 }),
}

// Limitations:
//   - list of presets is hard-coded
//   - initial preset can't be "custom"

/**
 * Exposes `startTime` and `endTime` plus the whole set of picker UI controls as
 * a JSX element to render. When we're using a relative preset like last N
 * hours, automatically slide the window forward live by updating the range to
 * have `endTime` of _now_ every `SLIDE_INTERVAL` ms.
 */
export function useDateTimeRangePicker({
  initialPreset,
  minValue,
  maxValue,
}: {
  initialPreset: RangeKey
  minValue?: DateValue | undefined
  maxValue?: DateValue | undefined
}) {
  const now = useMemo(() => getNow(getLocalTimeZone()), [])

  const start = computeStart[initialPreset](now)
  const end = now

  const [range, setRange] = useState<DateTimeRange>({ start, end })

  const props = { initialPreset, range, setRange, minValue, maxValue }

  return {
    startTime: range.start,
    endTime: range.end,
    dateTimeRangePicker: <DateTimeRangePicker {...props} />,
  }
}

/** Interval for sliding range forward when using a relative time preset */
const SLIDE_INTERVAL = 10_000

type DateTimeRange = { start: DateValue; end: DateValue }

type DateTimeRangePickerProps = {
  initialPreset: RangeKey
  range: DateTimeRange
  setRange: (v: DateTimeRange) => void
  minValue?: DateValue | undefined
  maxValue?: DateValue | undefined
}

export function DateTimeRangePicker({
  initialPreset,
  range,
  setRange,
  minValue,
  maxValue,
}: DateTimeRangePickerProps) {
  const [preset, setPreset] = useState<RangeKeyAll>(initialPreset)
  const [lastUpdated, setLastUpdated] = useState(Date.now())

  // const customInputsDirty =
  //   range.start.compare(inputRange.start) !== 0 || range.end.compare(inputRange.end) !== 0

  // const enableInputs = preset === 'custom'
  const enableInputs = true

  // could handle this in a useEffect that looks at `preset`, but that would
  // also run on initial render, which is silly. Instead explicitly call it on
  // preset change and in useInterval.
  const onRangeChange = (preset: RangeKeyAll) => {
    if (preset !== 'custom') {
      const now = getNow(getLocalTimeZone())
      const newStartTime = computeStart[preset](now)
      setRange({ start: newStartTime, end: now })
      setLastUpdated(Date.now())
    }
  }

  useInterval({
    fn: () => onRangeChange(preset),
    delay: preset !== 'custom' ? SLIDE_INTERVAL : null,
    key: preset, // force a render which clears current interval
  })

  return (
    <form className="flex items-center gap-2">
      <div className="text-sans-md text-quaternary">
        Updated {format(lastUpdated, 'hh:mm')}
      </div>
      <div className="flex">
        <Listbox
          className="z-10 w-[10rem] [&>button]:!rounded-r-none [&>button]:!border-r-0" // in addition to gap-4
          name="preset"
          selectedItem={preset}
          aria-label="Choose a time range preset"
          items={rangePresets}
          onChange={(item) => {
            if (item) {
              const newPreset = item.value as RangeKeyAll
              setPreset(newPreset)
              onRangeChange(newPreset)
            }
          }}
        />
        <DateRangePicker
          isDisabled={!enableInputs}
          label="Choose a date range"
          value={range}
          onChange={(range) => {
            setRange(range)
            setPreset('custom')
          }}
          minValue={minValue}
          maxValue={maxValue}
          hideTimeZone
          className="[&_.rounded-l]:!rounded-l-none"
        />
      </div>
    </form>
  )
}
