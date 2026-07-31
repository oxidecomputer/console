/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import * as R from 'remeda'
import { match } from 'ts-pattern'

import {
  api,
  useApiMutation,
  camelToSnake,
  type Timeseries,
  type Points,
  type OxqlTable,
  type TimeseriesQuery,
  type Values,
} from '@oxide/api'
import { Monitoring16Icon, Monitoring24Icon } from '@oxide/design-system/icons/react'

import { DocsPopover } from '~/components/DocsPopover'
import { OxqlField } from '~/components/form/fields/OxqlField'
import { ChartContainer, ChartHeader, TimeSeriesChart } from '~/components/TimeSeriesChart'
import { Button } from '~/ui/lib/Button'
import { Divider } from '~/ui/lib/Divider'
import { Message } from '~/ui/lib/Message'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { docLinks } from '~/util/links'

const queries = {
  basicTctl: `get hardware_component:amd_cpu_tctl
  | filter timestamp > @now() - 1m`,
  multiJoinedTable: `{
  {
    get sled_data_link:bytes_sent;
    get sled_data_link:errors_sent
  }
    | align mean_within(20s)
    | join;
  {
    get sled_data_link:bytes_received;
    get sled_data_link:errors_received
  }
    | align mean_within(20s)
    | join
}
  | filter kind == 'vnic'
  | filter timestamp > @now() - 10m`,
  bytesSentAndReceived: `{
  get sled_data_link:bytes_sent
    | align mean_within(5s)
    | group_by [sled_serial, link_name, kind];
  get sled_data_link:bytes_received
    | align mean_within(5s)
    | group_by [sled_serial, link_name, kind]
}
  | filter timestamp > @now() - 10m
  | filter kind == 'vnic'
  | filter link_name == 'oxControlService20'`,
}

const defaultValues: TimeseriesQuery = {
  query: queries.bytesSentAndReceived,
}

export const handle = { crumb: 'OxQL Explorer' }

const narrowToNumbers = (vs: Values): (number | null)[] =>
  match(vs.values)
    .with({ type: 'integer' }, ({ values }) => values)
    .with({ type: 'double' }, ({ values }) => values)
    .with({ type: 'boolean' }, ({ values }) =>
      values.map((b) =>
        match(b)
          .with(true, () => 1)
          .with(false, () => 0)
          .with(null, () => null)
          .exhaustive()
      )
    )
    .with({ type: 'string' }, () => []) // these don't exist in practice
    .with({ type: 'integer_distribution' }, () => []) // by only calling this on aligned/joined tables, we know this is unreachable
    .with({ type: 'double_distribution' }, () => []) // these don't exist in practice, and are also unreachable per above
    .exhaustive()

const leftPad = <T,>(items: T[], length: number): (T | null)[] =>
  items.length >= length ? items : [...Array(length - items.length).fill(null), ...items]

// The generated client types timestamps as Date, but the wire format is actually ISO strings. Oops!
// `new Date` accepts both.
type OxqlTimestamp = Points['timestamps'][number]
const parseTs = (ts: OxqlTimestamp): number => new Date(ts).getTime()
const toPosix = (timestamps: OxqlTimestamp[]): number[] => timestamps.map(parseTs)

type TimeseriesKind = 'joined' | 'aligned' | 'unaligned'

/**
 * When aligning a series, the timestamps are all on the same grid, but values at the beginning may
 * be missing (e.g. [10,20,30] in one timestamp array, and [20,30] in another). As long as we can
 * prove there's a regular grid all the way through, no big deal.
 */
const getAlignedTimestamps = (
  items: Timeseries[]
): { type: 'some'; timestamps: number[] } | { type: 'none' } => {
  // aligned tables never have start times
  if (!items[0] || items[0].points.startTimes) return { type: 'none' }
  // similarly, aligned tables are always doubles (even if their inputs were integers!)
  if (!items[0].points.values.every(({ values }) => values.type === 'double'))
    return { type: 'none' }

  const longestSeries = R.firstBy(items, (i) => -i.points.timestamps.length)
  if (!longestSeries || longestSeries.points.timestamps.length === 0)
    return { type: 'none' }

  // converting to posix numbers knocks us down to millisecond precision, but uplot is going to
  // plot by second anyways
  const posixes = toPosix(longestSeries.points.timestamps)

  const end = R.last(posixes)
  // aligned series may not share the same start time, but they will always have a common final
  // timestamp
  if (
    !items.every(({ points }) => {
      const last = R.last(points.timestamps)
      // no timestamps at all is fine; otherwise the final one must match the shared end
      return last === undefined || parseTs(last) === end
    })
  )
    return { type: 'none' }

  if (posixes.length === 1) return { type: 'some', timestamps: posixes }

  const [start, second] = posixes

  const step = second - start
  // we'll assume all timestamp lists are aligned if every timestamp on our longest timestamp list
  // is aligned, i.e. some `step` away from the first one we look at
  if (!posixes.every((time) => (time - start) % step === 0)) return { type: 'none' }

  return {
    type: 'some',
    timestamps: posixes,
  }
}

type Chart<Data> = {
  name: string
  description?: string
  timestamps: number[]
  data: Data
}

type LabeledNumberLine = Chart<{ label: string; values: (number | null)[] }[]>

type ChartGroups = { startTime: Date; endTime: Date } & (
  | { kind: 'unaligned'; charts: Chart<Values>[] }
  | { kind: 'aligned'; charts: LabeledNumberLine[] }
  | { kind: 'joined'; charts: LabeledNumberLine[] }
)

const getFormattedFields = (t: Timeseries): string =>
  Object.entries(t.fields)
    // hello my evil friend.
    .map(([fieldName, x]) => `${camelToSnake(fieldName)}: ${x.value}`)
    .join(' \u2022 ')

const tableToGroups = (table: OxqlTable): ChartGroups | 'empty-timeseries' => {
  const { name, timeseries } = table
  if (timeseries.length === 0) return 'empty-timeseries'
  const kind:
    | Exclude<TimeseriesKind, 'aligned'>
    | { kind: 'aligned'; timestamps: number[] } =
    // we expect all values arrays to be the same length, so if the first isn't longer than 1, we
    // expect singletons across the board
    timeseries[0]?.points.values.length > 1
      ? ('joined' as const)
      : match(getAlignedTimestamps(timeseries))
          .with({ type: 'none' }, () => 'unaligned' as const)
          .with({ type: 'some' }, ({ timestamps }) => ({
            kind: 'aligned' as const,
            timestamps,
          }))
          .exhaustive()

  const chart = match(kind)
    .with('joined', (kind) => {
      // In a joined table, each Values item is a distinct metric:target and the
      // table name is those metric names comma-joined, index-aligned to the Values.
      // So the line labels come from the table name, not the (identical-per-line)
      // joined field.
      const metricNames = name.split(',').map((s) => s.trim())

      return {
        kind,
        // when joined, each timeseries is _also_ aligned, but we assume that users want to focus on
        // cross-referencing between metrics, so we join the values within a given timeseries, going
        // no further
        charts: timeseries.map((series) => ({
          name,
          description: getFormattedFields(series),
          timestamps: toPosix(series.points.timestamps),
          data: series.points.values.map((v, i) => ({
            label:
              metricNames[i] ||
              // should be unreachable
              `${getFormattedFields(series)} #${i + 1}`,
            values: narrowToNumbers(v),
          })),
        })),
      }
    })
    .with({ kind: 'aligned' }, ({ kind, timestamps }) => ({
      kind,
      charts: [
        {
          name,
          timestamps,
          data: timeseries
            .filter((s) => s.points.values.length > 0)
            .map((series) => ({
              label: getFormattedFields(series),
              values: leftPad(narrowToNumbers(series.points.values[0]), timestamps.length),
            })),
        },
      ],
    }))
    .with('unaligned', (kind) => ({
      kind,
      charts: timeseries
        .filter((s) => s.points.values.length > 0)
        .map((series) => ({
          name,
          description: getFormattedFields(series),
          timestamps: toPosix(series.points.timestamps),
          data: series.points.values[0],
        })),
    }))
    .exhaustive()
  const timestamps = chart.charts.flatMap(({ timestamps }) => timestamps)
  const min = R.firstBy(timestamps, (t) => t)
  const max = R.firstBy(timestamps, (t) => -t)

  return {
    ...chart,
    // i figure any chart collection probably benefits from sharing their X-axis, even if they're
    // rendered in sequence. when there's no data at all, min/max are undefined and the range is
    // irrelevant (the charts render their empty state) — fall back to the epoch for valid Dates
    startTime: new Date(min ?? 0),
    endTime: new Date(max ?? 0),
  }
}

const TICK_UNITS = [
  // TODO: this doesn't quite match the suffixes in the oxql-metrics util, but i'm leaving it
  // because i don't understand those
  [1e12, 't'],
  [1e9, 'b'],
  [1e6, 'm'],
  [1e3, 'k'],
] as const
const formatTick = (n: number): string => {
  const [divisor, suffix] = TICK_UNITS.find(([min]) => Math.abs(n) >= min) ?? [1, '']
  return (n / divisor).toLocaleString() + suffix
}

// Drops (or keeps, without copying) the first sample of a series. We trim timestamps and values at
// the same time to be confident they're in sync.
type TimeAndData = { timestamps: number[]; data: (number | null)[][] }
const firstPointDropper =
  (drop: boolean) =>
  ({ timestamps, data }: TimeAndData): TimeAndData =>
    drop
      ? { timestamps: timestamps.slice(1), data: data.map((d) => d.slice(1)) }
      : { timestamps, data }

// The first aligned point of a cumulative counter is diffed against the counter's start_time,
// collapsing all pre-window history into one giant bucket. It's not "erroneous" but it's usually
// not useful, and you'd want to hide it to get a more useful y-axis for the rest of your data.
const groupHasPointWorthDropping = (g: ChartGroups | 'empty-timeseries'): boolean =>
  match(g)
    .with('empty-timeseries', () => false)
    // Aligned/joined tables may be derived from cumulatives, so we assume it's worth offering
    .with({ kind: 'joined' }, { kind: 'aligned' }, () => true)
    // Gauges are, by definition, not cumulative, so you'll never see a giant first point
    .with({ kind: 'unaligned' }, ({ charts }) =>
      charts.some((c) => c.data.metricType !== 'gauge')
    )
    .exhaustive()

export default function OxqlPage() {
  const query = useApiMutation(api.systemTimeseriesQuery)

  const form = useForm({ defaultValues })
  const control = form.control

  const [dropFirstPoint, setDropFirstPoint] = useState(true)

  const onSubmit = (body: TimeseriesQuery) => {
    query.mutate({ body })
  }

  const chartGroups: (ChartGroups | 'empty-timeseries')[] | null = useMemo(
    () => (query.data ? query.data.tables.map(tableToGroups) : null),
    [query.data]
  )

  const hasTrimmableCharts = chartGroups?.some(groupHasPointWorthDropping) ?? false
  const trim = firstPointDropper(dropFirstPoint && hasTrimmableCharts)

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Monitoring24Icon />}>OxQL Explorer</PageTitle>
        <DocsPopover
          heading="OxQL"
          icon={<Monitoring16Icon />}
          summary="The Oximeter Query Language is a domain-specific language for interrogating telemetry data from software and hardware components across the rack."
          links={[docLinks.oxql, docLinks.oxqlSchemas]}
        />
      </PageHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-wrap gap-2">
          {Object.entries(queries).map(([key, text]) => (
            <Button
              key={key}
              size="sm"
              variant="secondary"
              onClick={() => form.setValue('query', text)}
            >
              {key.replace(/([A-Z])/g, ' $1')}
            </Button>
          ))}
        </div>
        <div className="mt-2">
          <OxqlField
            rows={defaultValues.query.split('\n').length || 4}
            name="query"
            required
            control={control}
          />
        </div>
        <Button className="mt-4" type="submit" disabled={query.status === 'pending'}>
          Run query
        </Button>
      </form>

      {match(query)
        .with({ status: 'idle' }, () => null)
        .with({ status: 'pending' }, () => (
          <ChartContainer className="mt-8">
            <TimeSeriesChart
              loading
              title=""
              data={undefined}
              timestamps={undefined}
              startTime={new Date(0)}
              endTime={new Date(0)}
            />
          </ChartContainer>
        ))
        .with({ status: 'error' }, (q) => (
          <Message
            className="mt-8"
            variant="error"
            title="Query failed"
            content={<span className="font-mono">{q.error.message}</span>}
          />
        ))
        .with({ status: 'success' }, () => (
          <>
            {hasTrimmableCharts && (
              <div className="mt-8 mb-2">
                <label className="text-secondary flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={dropFirstPoint}
                    onChange={(e) => setDropFirstPoint(e.target.checked)}
                  />
                  Drop first point
                </label>
              </div>
            )}
            {chartGroups &&
              chartGroups.map((s, tableNumber) => (
                <div key={tableNumber}>
                  <Divider className="mx-16 my-8" />
                  {match(s)
                    .with('empty-timeseries', () => 'No results')
                    .with(
                      { kind: 'joined' },
                      { kind: 'aligned' },
                      ({ charts, startTime, endTime }) => (
                        <div className="flex flex-col gap-4">
                          {charts.map((chart, chartNumber) => {
                            const trimmed = trim({
                              timestamps: chart.timestamps,
                              data: chart.data.map((d) => d.values),
                            })
                            const seriesLabels = chart.data.map((l) => l.label)
                            return (
                              <ChartContainer key={`${tableNumber}.${chartNumber}`}>
                                <ChartHeader
                                  title={chart.name}
                                  label=""
                                  description={chart.description}
                                />
                                <TimeSeriesChart
                                  timestamps={trimmed.timestamps}
                                  data={trimmed.data}
                                  seriesLabels={seriesLabels}
                                  title={chart.name}
                                  interpolation="linear"
                                  startTime={startTime}
                                  endTime={endTime}
                                  unit={undefined}
                                  loading={false}
                                  yAxisTickFormatter={formatTick}
                                />
                              </ChartContainer>
                            )
                          })}
                        </div>
                      )
                    )
                    .with({ kind: 'unaligned' }, ({ charts, startTime, endTime }) =>
                      charts.map((chart, chartNumber) => {
                        const data = match(chart.data.values)
                          .with({ type: 'integer' }, ({ values }) => values)
                          .with({ type: 'double' }, ({ values }) => values)
                          .with({ type: 'boolean' }, ({ values }) =>
                            values.map((b) =>
                              match(b)
                                .with(true, () => 1)
                                .with(false, () => 0)
                                .with(null, () => null)
                                .exhaustive()
                            )
                          )
                          .with({ type: 'string' }, () => []) // these don't exist in practice
                          .with(
                            { type: 'integer_distribution' },
                            { type: 'double_distribution' },
                            () => []
                          ) // heatmaps!
                          .exhaustive()
                        const trimmed = trim({ data: [data], timestamps: chart.timestamps })
                        return (
                          <ChartContainer key={`${tableNumber}.${chartNumber}`}>
                            <ChartHeader
                              title={chart.name}
                              label=""
                              description={chart.description}
                            />
                            <TimeSeriesChart
                              data={trimmed.data}
                              timestamps={trimmed.timestamps}
                              title={chart.name}
                              interpolation="linear"
                              startTime={startTime}
                              endTime={endTime}
                              unit={undefined}
                              loading={false}
                              yAxisTickFormatter={formatTick}
                            />
                          </ChartContainer>
                        )
                      })
                    )
                    .exhaustive()}
                </div>
              ))}
          </>
        ))
        .exhaustive()}
    </>
  )
}
