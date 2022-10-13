// import * as Yup from 'yup'
import { format, subDays, subHours } from 'date-fns'
import { useMemo, useState } from 'react'

import { Listbox, useInterval } from '@oxide/ui'
import { Button, TextInput } from '@oxide/ui'

export const dateForInput = (d: Date) => format(d, "yyyy-MM-dd'T'HH:mm")

const rangePresets = [
  { label: 'Last hour', value: 'lastHour' as const },
  { label: 'Last 3 hours', value: 'last3Hours' as const },
  { label: 'Last day', value: 'lastDay' as const },
  { label: 'Last week', value: 'lastWeek' as const },
  { label: 'Last 30 days', value: 'last30Days' as const },
  { label: 'Custom...', value: 'custom' as const },
]

// custom doesn't have an associated range
type RangeKeyAll = typeof rangePresets[number]['value']
export type RangeKey = Exclude<RangeKeyAll, 'custom'>

// Record ensures we have an entry for every preset
const computeStart: Record<RangeKey, (now: Date) => Date> = {
  lastHour: (now) => subHours(now, 1),
  last3Hours: (now) => subHours(now, 3),
  lastDay: (now) => subDays(now, 1),
  lastWeek: (now) => subDays(now, 7),
  last30Days: (now) => subDays(now, 30),
}

// const rangeKeys = rangePresets.map((item) => item.value)

/** Validate that they're Dates and end is after start */
// const dateRangeSchema = Yup.object({
//   preset: Yup.string().oneOf(rangeKeys),
//   startTime: Yup.date(),
//   endTime: Yup.date().min(Yup.ref('startTime'), 'End time must be later than start time'),
// })

// Limitations:
//   - list of presets is hard-coded
//   - no onChange, no way to control any inputs beyond initial preset
//   - initial preset can't be "custom"

type Props = {
  initialPreset: RangeKey
  /**
   * if set and range is a relative preset, update the range to have `endTime`
   * of now every X ms
   */
  slideInterval?: number
  startTime: Date
  endTime: Date
  onChange: (startTime: Date, endTime: Date) => void
}

export function useDateTimeRangePickerState(initialPreset: RangeKey) {
  // default endTime is now, i.e., mount time
  const now = useMemo(() => new Date(), [])

  const [startTime, setStartTime] = useState(computeStart[initialPreset](now))
  const [endTime, setEndTime] = useState(now)

  function onChange(newStart: Date, newEnd: Date) {
    setStartTime(newStart)
    setEndTime(newEnd)
  }

  return { startTime, endTime, onChange }
}

/**
 * Exposes `startTime` and `endTime` plus the whole set of picker UI controls as
 * a JSX element to render.
 */
export function DateTimeRangePicker({
  initialPreset,
  slideInterval,
  startTime,
  endTime,
  onChange,
}: Props) {
  const [preset, setPreset] = useState<RangeKeyAll>(initialPreset)

  // needs a separate pair of values because they can be edited without
  // submitting and updating the graphs
  const [startTimeInput, setStartTimeInput] = useState(startTime)
  const [endTimeInput, setEndTimeInput] = useState(endTime)

  // TODO: validate inputs on change and display error someplace

  const customInputsDirty = startTime !== startTimeInput || endTime !== endTimeInput

  const enableInputs = preset === 'custom'

  /** Set the input values and call the passed-on onChange with the new times */
  function setTimesForPreset(newPreset: RangeKey) {
    const now = new Date()
    const newStartTime = computeStart[newPreset](now)
    onChange(newStartTime, now)
    setStartTimeInput(newStartTime)
    setEndTimeInput(now)
  }

  useInterval(
    () => {
      if (preset !== 'custom') setTimesForPreset(preset)
    },
    slideInterval && preset !== 'custom' ? slideInterval : null
  )

  return (
    <form className="flex h-24 gap-4">
      <Listbox
        className="mr-4 w-48" // in addition to gap-4
        name="preset"
        defaultValue={initialPreset}
        aria-label="Choose a time range"
        items={rangePresets}
        onChange={(item) => {
          if (item) {
            setPreset(item.value as RangeKeyAll)
            if (item.value !== 'custom') setTimesForPreset(item.value as RangeKey)
          }
        }}
      />

      {/* TODO: real React date picker lib instead of native for consistent styling across browsers */}
      <TextInput
        id="startTime"
        type="datetime-local"
        className="h-10"
        // TODO: figure out error
        error={false}
        aria-label="Start time"
        disabled={!enableInputs}
        required
        value={dateForInput(startTimeInput)}
        onChange={(e) => setStartTimeInput(new Date(e.target.value))}
      />
      <TextInput
        id="endTime"
        type="datetime-local"
        className="h-10"
        // TODO: figure out error
        error={false}
        aria-label="End time"
        disabled={!enableInputs}
        required
        value={dateForInput(endTime)}
        onChange={(e) => setEndTimeInput(new Date(e.target.value))}
      />
      {/* TODO: fix goofy ass button text. use icons? tooltips to explain? lord */}
      {enableInputs && (
        <Button
          disabled={!customInputsDirty}
          // reset inputs back to whatever they were
          onClick={() => {
            setStartTimeInput(startTime)
            setEndTimeInput(endTime)
          }}
        >
          Reset
        </Button>
      )}
      {enableInputs && (
        <Button
          disabled={!customInputsDirty}
          onClick={() => onChange(startTimeInput, endTimeInput)}
        >
          Load
        </Button>
      )}
    </form>
  )
}
