import * as Yup from 'yup'
import cn from 'classnames'
import { format, subDays, subHours } from 'date-fns'
import { Form, Formik } from 'formik'
import { useMemo, useState } from 'react'
import { Area, CartesianGrid, ComposedChart, Tooltip, XAxis, YAxis } from 'recharts'
import type { TooltipProps } from 'recharts/types/component/Tooltip'

import type { Cumulativeint64, DiskMetricName } from '@oxide/api'
import { useApiQuery } from '@oxide/api'
import { Button } from '@oxide/ui'

import { ListboxField, TextField } from 'app/components/form'
import { useRequiredParams } from 'app/hooks'

type DiskMetricParams = {
  title: string
  startTime: Date
  endTime: Date
  metricName: DiskMetricName
  diskParams: { orgName: string; projectName: string; diskName: string }
  // TODO: specify bytes or count
}

// Recharts's built-in ticks behavior is useless and probably broken
/**
 * Split the data into n evenly spaced ticks, with one at the left end and one a
 * little bit in from the right end, and the rest evenly spaced in between.
 */
function getTicks(data: { timestamp: number }[], n: number): number[] {
  if (data.length === 0) return []
  if (n < 2) throw Error('n must be at least 2 because of the start and end ticks')
  // bring the last tick in a bit from the end
  const maxIdx = data.length > 10 ? Math.floor((data.length - 1) * 0.9) : data.length - 1
  // if there are 4 ticks, their positions are 0/3, 1/3, 2/3, 3/3 (as fractions of maxIdx)
  const idxs = new Array(n).fill(0).map((_, i) => Math.floor((maxIdx * i) / (n - 1)))
  return idxs.map((i) => data[i].timestamp)
}

const shortDateTime = (ts: number) => format(new Date(ts), 'M/d HH:mm')
const longDateTime = (ts: number) => format(new Date(ts), 'MMM d, yyyy H:mm:ss aa')
const dateForInput = (d: Date) => format(d, "yyyy-MM-dd'T'HH:mm")

// TODO: change these to named colors so they work in light mode
const LIGHT_GRAY = 'var(--base-grey-600)'
const GRID_GRAY = 'var(--base-grey-1000)'
const GREEN = 'var(--base-green-600)'
const DARK_GREEN = 'var(--base-green-900)'

// TODO: figure out how to do this with TW classes instead. As far as I can tell
// ticks only take direct styling
const textMonoMd = {
  fontSize: '0.75rem',
  fontFamily: '"GT America Mono", monospace',
}

function renderTooltip(props: TooltipProps<number, string>) {
  const { payload } = props
  if (!payload || payload.length < 1) return null
  // TODO: there has to be a better way to get these values
  const {
    name,
    payload: { timestamp, value },
  } = payload[0]
  if (!timestamp || !value) return null
  return (
    <div className="bg-raise text-secondary text-sans-sm border border-secondary">
      <div className="py-2 px-3 border-b border-secondary">{longDateTime(timestamp)}</div>
      <div className="py-2 px-3">
        <div className="text-default">{name}</div>
        <div>{value}</div>
        {/* TODO: unit on value if relevant */}
      </div>
    </div>
  )
}

function DiskMetric({
  title,
  startTime,
  endTime,
  metricName,
  diskParams,
}: DiskMetricParams) {
  // TODO: we're only pulling the first page. Should we bump the cap to 10k?
  // Fetch multiple pages if 10k is not enough? That's a bit much.
  const { data: metrics } = useApiQuery('diskMetricsList', {
    ...diskParams,
    metricName,
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
    limit: 1000,
  })

  const data = (metrics?.items || []).map(({ datum, timestamp }) => ({
    timestamp: new Date(timestamp).getTime(),
    // all of these metrics are cumulative ints
    value: (datum.datum as Cumulativeint64).value,
  }))

  // TODO: indicate time zone somewhere. doesn't have to be in the detail view
  // in the tooltip. could be just once on the end of the x-axis like GCP

  return (
    <div>
      <h2 className="text-mono-md text-secondary">{title}</h2>
      <ComposedChart
        width={480}
        height={240}
        data={data}
        margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
        className="mt-4"
      >
        <CartesianGrid stroke={GRID_GRAY} vertical={false} />
        <Area
          dataKey="value"
          name={title}
          stroke={GREEN}
          fillOpacity={1}
          fill={DARK_GREEN}
          isAnimationActive={false}
          activeDot={{
            fill: LIGHT_GRAY,
            r: 4,
            strokeWidth: 0,
          }}
        />
        <XAxis
          domain={['auto', 'auto']}
          dataKey="timestamp"
          interval="preserveStart"
          scale="time"
          // we're doing the x axis as timestamp ms instead of Date primarily to make type=number work
          // TODO: use Date directly as x-axis values
          type="number"
          name="Time"
          ticks={getTicks(data, 3)}
          // TODO: decide timestamp format based on time range of chart
          tickFormatter={shortDateTime}
          tick={textMonoMd}
          tickMargin={4}
        />
        <YAxis orientation="right" tick={textMonoMd} tickSize={0} tickMargin={8} />
        {/* TODO: stop tooltip being focused by default on pageload if nothing else has been clicked */}
        <Tooltip
          isAnimationActive={false}
          content={renderTooltip}
          cursor={{ stroke: LIGHT_GRAY }}
        />
      </ComposedChart>
    </div>
  )
}

const rangePresets = [
  { label: 'Last hour', value: 'lastHour' as const },
  { label: 'Last day', value: 'lastDay' as const },
  { label: 'Last week', value: 'lastWeek' as const },
  { label: 'Custom', value: 'custom' as const },
]

// custom doesn't have an associated range
type RangeKey = Exclude<typeof rangePresets[number]['value'], 'custom'>

// Record ensures we have an entry for every preset
const computeStart: Record<RangeKey, (now: Date) => Date> = {
  lastHour: (now) => subHours(now, 1),
  lastDay: (now) => subDays(now, 1),
  lastWeek: (now) => subDays(now, 7),
}

const rangeKeys = rangePresets.map((item) => item.value)

/** Validate that they're Dates and end is after start */
const dateRangeSchema = Yup.object({
  preset: Yup.string().oneOf(rangeKeys),
  // TODO: only validate these when oneOf is custom?
  startTime: Yup.date(),
  endTime: Yup.date().min(Yup.ref('startTime'), 'End time must be later than start time'),
})

export function MetricsTab() {
  const instanceParams = useRequiredParams('orgName', 'projectName', 'instanceName')
  const { orgName, projectName } = instanceParams

  const { data: disks } = useApiQuery('instanceDiskList', instanceParams)
  const diskName = disks?.items[0].name

  // default endTime is now, i.e., mount time
  const now = useMemo(() => new Date(), [])

  const [startTime, setStartTime] = useState(subDays(now, 1))
  const [endTime, setEndTime] = useState(now)

  // TODO: add a dropdown with last hour, last 3 hours, etc. and a final option
  // "Custom". Only on Custom are the date pickers shown.

  if (!diskName) return <span>loading</span> // TODO: loading state

  const commonProps = {
    startTime,
    endTime,
    diskParams: { orgName, projectName, diskName },
  }

  return (
    <>
      <h2 className="text-sans-xl">
        {/* TODO: need a nicer way of saying what the boot disk is */}
        Boot disk ( <code>{diskName}</code> )
      </h2>

      <Formik
        initialValues={{
          // values are strings, unfortunately
          startTime: dateForInput(startTime),
          endTime: dateForInput(endTime),
          preset: 'lastDay', // satisfies RangeKey (TS 4.9),
        }}
        onSubmit={({ startTime, endTime }) => {
          setStartTime(new Date(startTime))
          setEndTime(new Date(endTime))
        }}
        validationSchema={dateRangeSchema}
      >
        {({ values, setFieldValue }) => (
          <Form className="mt-8">
            <div className="flex gap-8 items-end">
              {/* TODO: make this radio buttons instead of a listbox */}
              <ListboxField
                id="preset"
                name="preset"
                label="Choose a time range"
                items={rangePresets}
                onChange={(item) => {
                  // `item.value in computeStart` is overkill but whatever
                  if (item && item.value in computeStart && item.value !== 'custom') {
                    const now = new Date()
                    const startTime = computeStart[item.value as RangeKey](now)
                    setFieldValue('startTime', dateForInput(startTime))
                    setFieldValue('endTime', dateForInput(now))
                    // changing the listbox doesn't update the graphs, it only
                    // updates the start and end time fields. you still have to
                    // submit the form to update the graphs
                  }
                }}
              />
              <Button
                className="mt-6"
                type="submit"
                // disable submit when the displayed dates are already the same as
                // what is in the inputs
                disabled={
                  values.startTime === dateForInput(startTime) &&
                  values.endTime === dateForInput(endTime)
                }
              >
                Update
              </Button>
            </div>
            <div
              className={cn('mt-4 mb-4 flex gap-8 items-start h-24', {
                hidden: values.preset !== 'custom',
              })}
            >
              {/* TODO: real React date picker lib instead of native for consistent styling across browsers */}
              {/* TODO: for the presets, selecting a preset can automatically trigger a fetch and render. but
                  when you change dates there should probably be a submit step. that means we need to show whether
                  or not the current date range has been submitted and the graphs already reflect it */}
              <TextField id="startTime" type="datetime-local" label="Start time" required />
              <TextField id="endTime" type="datetime-local" label="End time" required />
              {/* mt-6 is a hack to fake alignment with the inputs. this will change so it doesn't matter */}
            </div>
          </Form>
        )}
      </Formik>

      {/* TODO: separate "Activations" from "(count)" so we can
                a) style them differently in the title, and
                b) show "Activations" but not "(count)" in the Tooltip?
        */}
      <div className="flex flex-wrap gap-8 mt-8">
        {/* see the following link for the source of truth on what these mean
            https://github.com/oxidecomputer/crucible/blob/258f162b/upstairs/src/stats.rs#L9-L50 */}
        <DiskMetric {...commonProps} title="Activations (Count)" metricName="activated" />
        <DiskMetric {...commonProps} title="Reads (Count)" metricName="read" />
        <DiskMetric {...commonProps} title="Read (Bytes)" metricName="read_bytes" />
        <DiskMetric {...commonProps} title="Writes (Count)" metricName="write" />
        <DiskMetric {...commonProps} title="Write (Bytes)" metricName="write_bytes" />
        <DiskMetric {...commonProps} title="Flushes (Count)" metricName="flush" />
      </div>
    </>
  )
}
