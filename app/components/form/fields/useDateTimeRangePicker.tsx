import * as Yup from 'yup'
import { format, subDays, subHours } from 'date-fns'
import { Form, Formik } from 'formik'
import { useMemo, useRef, useState } from 'react'

import { useInterval } from '@oxide/ui'
import { Button } from '@oxide/ui'

import { ListboxField } from './ListboxField'
import { TextField } from './TextField'

const dateForInput = (d: Date) => format(d, "yyyy-MM-dd'T'HH:mm")

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

const rangeKeys = rangePresets.map((item) => item.value)

/** Validate that they're Dates and end is after start */
const dateRangeSchema = Yup.object({
  preset: Yup.string().oneOf(rangeKeys),
  startTime: Yup.date(),
  endTime: Yup.date().min(Yup.ref('startTime'), 'End time must be later than start time'),
})

// Limitations:
//   - list of presets is hard-coded
//   - no onChange, no way to control any inputs beyond initial preset
//   - initial preset can't be "custom"

type Args = {
  initialPreset: RangeKey
  /**
   * if set and range is a relative preset, update the range to have `endTime`
   * of now every X ms
   */
  slideInterval?: number
}

/**
 * Exposes `startTime` and `endTime` plus the whole set of picker UI controls as
 * a JSX element to render.
 */
export function useDateTimeRangePicker({ initialPreset, slideInterval }: Args) {
  // default endTime is now, i.e., mount time
  const now = useMemo(() => new Date(), [])

  const [startTime, setStartTime] = useState(computeStart[initialPreset](now))
  const [endTime, setEndTime] = useState(now)

  // only exists to make current preset value available to window slider
  const presetRef = useRef<RangeKeyAll>(initialPreset)

  useInterval(
    () => {
      if (presetRef.current !== 'custom') {
        const now = new Date()
        setStartTime(computeStart[presetRef.current](now))
        setEndTime(now)
      }
    },
    slideInterval && presetRef.current !== 'custom' ? slideInterval : null
  )

  // We're using Formik to manage the state of the inputs, but this is not
  // strictly necessary. It's convenient while we're using `TextField` with
  // `type=datetime-local` because we get validationSchema and error display for
  // free. Once we use a React date picker library, we can make the inputs
  // controlled and manage everything through regular state. I think that will
  // be a little cleaner.
  const dateTimeRangePicker = (
    <Formik
      initialValues={{
        // values are strings, unfortunately
        startTime: dateForInput(startTime),
        endTime: dateForInput(endTime),
        preset: initialPreset as RangeKeyAll, // indicates preset can include 'custom'
      }}
      onSubmit={({ startTime, endTime }) => {
        setStartTime(new Date(startTime))
        setEndTime(new Date(endTime))
      }}
      validationSchema={dateRangeSchema}
    >
      {({ values, setFieldValue, submitForm }) => {
        // whether the time fields have been changed from what is displayed
        const customInputsDirty =
          values.startTime !== dateForInput(startTime) ||
          values.endTime !== dateForInput(endTime)

        // on presets, inputs visible (showing current range) but disabled
        const enableInputs = values.preset === 'custom'

        function setRangeValues(startTime: Date, endTime: Date) {
          setFieldValue('startTime', dateForInput(startTime), true)
          setFieldValue('endTime', dateForInput(endTime), true)
        }

        return (
          <Form className="flex h-24 gap-4">
            <ListboxField
              className="mr-4" // in addition to gap-4
              id="preset"
              name="preset"
              label="Choose a time range"
              items={rangePresets}
              // when we select a preset, set the input values to the range
              // for that preset and submit the form to update the charts
              onChange={(item) => {
                if (item) {
                  // only done to make the value available to the range window slider interval
                  presetRef.current = item.value as RangeKeyAll

                  if (item.value !== 'custom') {
                    const now = new Date()
                    const newStartTime = computeStart[item.value as RangeKey](now)
                    setRangeValues(newStartTime, now)
                    // goofy, but I like the idea of going through the submit
                    // pathway instead of duplicating the setStates
                    submitForm()
                    // TODO: if input is invalid while on custom, e.g.,
                    // because end is before start, changing to a preset does
                    // not clear the error. changing a second time does
                  }
                }
              }}
              required
            />

            {/* TODO: real React date picker lib instead of native for consistent styling across browsers */}
            {/* TODO: the field labels look pretty stupid in this context, fix that. probably leave them 
                       there for a11y purposes but hide them for sighted users */}
            <TextField
              id="startTime"
              type="datetime-local"
              label="Start time"
              disabled={!enableInputs}
              required
            />
            <TextField
              id="endTime"
              type="datetime-local"
              label="End time"
              required
              disabled={!enableInputs}
            />
            {/* mt-6 is a hack to fake alignment with the inputs. this will change so it doesn't matter */}
            {/* TODO: fix goofy ass button text. use icons? tooltips to explain? lord */}
            {enableInputs && (
              <Button
                className="mt-6"
                disabled={!customInputsDirty}
                // reset inputs back to whatever they were
                onClick={() => setRangeValues(startTime, endTime)}
              >
                Reset
              </Button>
            )}
            {enableInputs && (
              <Button className="mt-6" type="submit" disabled={!customInputsDirty}>
                Load
              </Button>
            )}
          </Form>
        )
      }}
    </Formik>
  )

  return { startTime, endTime, dateTimeRangePicker }
}
