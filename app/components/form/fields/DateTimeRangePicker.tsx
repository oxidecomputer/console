import type { DateValue } from '@internationalized/date'
import { getLocalTimeZone, now as getNow } from '@internationalized/date'
import { useMemo, useState } from 'react'

import {
  Button,
  Checkmark12Icon,
  Close12Icon,
  DateRangePicker,
  Listbox,
  useInterval,
} from '@oxide/ui'

const rangePresets = [
  { label: 'Last hour', value: 'lastHour' as const },
  { label: 'Last 3 hours', value: 'last3Hours' as const },
  { label: 'Last day', value: 'lastDay' as const },
  { label: 'Last week', value: 'lastWeek' as const },
  { label: 'Last 30 days', value: 'last30Days' as const },
  { label: 'Custom...', value: 'custom' as const },
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
export function useDateTimeRangePicker(initialPreset: RangeKey) {
  const now = useMemo(() => getNow(getLocalTimeZone()), [])

  const start = computeStart[initialPreset](now)
  const end = now

  const [range, setRange] = useState<DateTimeRange>({ start, end })

  const props = { initialPreset, range, setRange }

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
}

export function DateTimeRangePicker({
  initialPreset,
  range,
  setRange,
}: DateTimeRangePickerProps) {
  const [preset, setPreset] = useState<RangeKeyAll>(initialPreset)

  // needs a separate pair of values because they can be edited without
  // submitting and updating the graphs
  const [inputRange, setInputRange] = useState<DateTimeRange>(range)

  const customInputsDirty =
    range.start.compare(inputRange.start) !== 0 || range.end.compare(inputRange.end) !== 0

  const enableInputs = preset === 'custom'

  // could handle this in a useEffect that looks at `preset`, but that would
  // also run on initial render, which is silly. Instead explicitly call it on
  // preset change and in useInterval.
  const onRangeChange = (preset: RangeKeyAll) => {
    if (preset !== 'custom') {
      const now = getNow(getLocalTimeZone())
      const newStartTime = computeStart[preset](now)
      setRange({ start: newStartTime, end: now })
      setInputRange({ start: newStartTime, end: now })
    }
  }

  useInterval({
    fn: () => onRangeChange(preset),
    delay: preset !== 'custom' ? SLIDE_INTERVAL : null,
    key: preset, // force a render which clears current interval
  })

  return (
    <form className="flex h-20 gap-4">
      <Listbox
        className="mr-4 w-48" // in addition to gap-4
        name="preset"
        selectedItem={preset}
        aria-label="Choose a time range preset"
        items={rangePresets}
        onChange={(value) => {
          if (value) {
            const newPreset = value as RangeKeyAll
            setPreset(newPreset)
            onRangeChange(newPreset)
          }
        }}
      />

      <div>
        <DateRangePicker
          isDisabled={!enableInputs}
          label="Choose a date range"
          value={inputRange}
          onChange={setInputRange}
        />
      </div>
      {/* TODO: fix goofy ass buttons. tooltips to explain? lord */}
      {enableInputs && (
        // reset inputs back to whatever they were
        <Button disabled={!customInputsDirty} onClick={() => setInputRange(range)}>
          <Close12Icon />
        </Button>
      )}
      {enableInputs && (
        <Button disabled={!customInputsDirty} onClick={() => setRange(inputRange)}>
          <Checkmark12Icon />
        </Button>
      )}
    </form>
  )
}
