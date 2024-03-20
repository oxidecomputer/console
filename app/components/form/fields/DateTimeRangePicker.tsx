/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { getLocalTimeZone, now as getNow, type DateValue } from '@internationalized/date'
import { useMemo, useState } from 'react'

import { DateRangePicker } from '~/ui/lib/DateRangePicker'
import { Listbox } from '~/ui/lib/Listbox'

const rangePresets = [
  { label: 'Last hour', value: 'lastHour' as const },
  { label: 'Last 3 hours', value: 'last3Hours' as const },
  { label: 'Last day', value: 'lastDay' as const },
  { label: 'Last week', value: 'lastWeek' as const },
  { label: 'Last 30 days', value: 'last30Days' as const },
  { label: 'Custom', value: 'custom' as const },
]

// custom doesn't have an associated range
export type RangeKeyAll = (typeof rangePresets)[number]['value']
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

  const [preset, setPreset] = useState<RangeKeyAll>(initialPreset)
  const [range, setRange] = useState<DateTimeRange>({ start, end })

  const onRangeChange = (newPreset: RangeKeyAll) => {
    if (newPreset !== 'custom') {
      const now = getNow(getLocalTimeZone())
      const newStartTime = computeStart[newPreset](now)
      setRange({ start: newStartTime, end: now })
    }
  }

  const props = { preset, setPreset, range, setRange, minValue, maxValue, onRangeChange }

  return {
    startTime: range.start.toDate(getLocalTimeZone()),
    endTime: range.end.toDate(getLocalTimeZone()),
    preset: preset,
    onRangeChange: onRangeChange,
    dateTimeRangePicker: <DateTimeRangePicker {...props} />,
  }
}

type DateTimeRange = { start: DateValue; end: DateValue }

type DateTimeRangePickerProps = {
  range: DateTimeRange
  setRange: (v: DateTimeRange) => void
  preset: RangeKeyAll
  setPreset: (v: RangeKeyAll) => void
  onRangeChange?: (preset: RangeKeyAll) => void
  minValue?: DateValue | undefined
  maxValue?: DateValue | undefined
}

export function DateTimeRangePicker({
  preset,
  setPreset,
  range,
  setRange,
  minValue,
  maxValue,
  onRangeChange,
}: DateTimeRangePickerProps) {
  return (
    <form className="flex md-:w-full">
      <Listbox
        className="w-[10rem] border-r border-r-default md-:flex-grow [&>button]:!rounded-r-none [&>button]:!border-r-0"
        name="preset"
        selected={preset}
        aria-label="Choose a time range preset"
        items={rangePresets}
        onChange={(value) => {
          setPreset(value)
          onRangeChange?.(value)
        }}
      />

      <div>
        <DateRangePicker
          label="Choose a date range"
          value={range}
          onChange={(range) => {
            setRange(range)
            setPreset('custom')
          }}
          minValue={minValue}
          maxValue={maxValue}
          hideTimeZone
          className="[&_.rounded-l]:!rounded-l-none [&_button]:!border-l-0"
        />
      </div>
    </form>
  )
}
