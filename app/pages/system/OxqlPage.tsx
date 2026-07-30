/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useWindowVirtualizer } from '@tanstack/react-virtual'
import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useSearchParams } from 'react-router'
import * as R from 'remeda'
import { match } from 'ts-pattern'

import {
  api,
  useApiMutation,
  camelToSnake,
  type Distributiondouble,
  type MetricType,
  type OxqlTable,
  type Points,
  type Timeseries,
  type TimeseriesQuery,
  type ValueArray,
} from '@oxide/api'
import { Monitoring16Icon, Monitoring24Icon } from '@oxide/design-system/icons/react'

import { DocsPopover } from '~/components/DocsPopover'
import { OxqlField } from '~/components/form/fields/OxqlField'
import { Heatmap } from '~/components/Heatmap'
import { ChartContainer, ChartHeader, TimeSeriesChart } from '~/components/TimeSeriesChart'
import { useElementSize } from '~/hooks/use-element-size'
import { Button } from '~/ui/lib/Button'
import { Divider } from '~/ui/lib/Divider'
import * as DropdownMenu from '~/ui/lib/DropdownMenu'
import { Message } from '~/ui/lib/Message'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { docLinks } from '~/util/links'

const exampleItems: { label: string; value: string }[] = [
  {
    label: 'Power shelf fan speeds',
    value: `get hardware_component:fan_speed
  | filter chassis_kind == 'power'
  | filter timestamp > @now() - 1m`,
  },
  {
    label: 'AMD CPU TCTL measurements per slot',
    value: `get hardware_component:amd_cpu_tctl
  | align mean_within(20s)
  | group_by [slot]
  | filter timestamp > @now() - 10m`,
  },
  {
    label: 'Bytes sent & received per sled',
    value: `{
  get sled_data_link:bytes_sent
    | align mean_within(30s)
    | group_by [kind, sled_id];
  get sled_data_link:bytes_received
    | align mean_within(30s)
    | group_by [kind, sled_id]
}
  | filter kind == 'physical'
  | filter timestamp > @now() - 10m
  | join`,
  },
  {
    label: 'Virtual disk write latencies',
    value: `get virtual_disk:io_latency
  | filter timestamp > @now() - 10m
  | filter io_kind == 'write'`,
  },
]

const defaultValues: TimeseriesQuery = {
  query: '',
}

export const handle = { crumb: 'OxQL Explorer' }

const narrowToNumbers = (vs: ValueArray): (number | null)[] =>
  match(vs)
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
    // by only calling this on non-distribution tables (distributions can't be
    // aligned/joined), we know this is unreachable
    .with({ type: 'integer_distribution' }, () => [])
    .with({ type: 'double_distribution' }, () => []) // these don't exist in practice, and are also unreachable per above
    .exhaustive()

const narrowToDistributions = (vs: ValueArray): (Distributiondouble | null)[] =>
  match(vs)
    .with(
      { type: 'integer_distribution' },
      { type: 'double_distribution' },
      ({ values }) => values
    )
    .otherwise(() => [])

const leftPad = <T,>(items: T[], length: number): (T | null)[] =>
  items.length >= length ? items : [...Array(length - items.length).fill(null), ...items]

// The generated client types timestamps as Date, but the wire format is actually ISO strings. Oops!
// `new Date` accepts both.
type OxqlTimestamp = Points['timestamps'][number]
const parseTs = (ts: OxqlTimestamp): number => new Date(ts).getTime()
const toPosix = (timestamps: OxqlTimestamp[]): number[] => timestamps.map(parseTs)

// Distributions always carry start_times in practice, but this isn't a
// guaranteed invariant. But start times are generally "the timestamp
// preceding the current one", so we can derive that ourselves.
const fakeStartTimes = (timestamps: number[]): number[] => {
  if (timestamps.length === 0) return []
  const interval = timestamps.length > 1 ? timestamps[1] - timestamps[0] : 0
  return [timestamps[0] - interval, ...timestamps.slice(0, -1)]
}

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

type Multiline = Chart<{ label: string; values: (number | null)[] }[]>
type Line = Chart<(number | null)[]> & { metricType: MetricType }
type Heatmap = Chart<(Distributiondouble | null)[]> & {
  metricType: MetricType
  startTimes: number[]
}

type ChartGroup =
  | 'empty-timeseries'
  | ({ startTime: Date; endTime: Date } & (
      | { kind: 'unaligned'; charts: Line[] }
      | { kind: 'distributions'; charts: Heatmap[] }
      | { kind: 'aligned'; charts: Multiline[] }
      | { kind: 'joined'; charts: Multiline[] }
    ))

const getFormattedFields = (t: Timeseries): string =>
  Object.entries(t.fields)
    // hello my evil friend.
    .map(([fieldName, x]) => `${camelToSnake(fieldName)}: ${x.value}`)
    .join(' \u2022 ')

const tableToGroup = (table: OxqlTable): ChartGroup => {
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
            values: narrowToNumbers(v.values),
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
              values: leftPad(
                narrowToNumbers(series.points.values[0].values),
                timestamps.length
              ),
            })),
        },
      ],
    }))
    .with('unaligned', () => {
      const seriesList = timeseries.filter((s) => s.points.values.length > 0)
      // all schemas in a table are the same, so we can just check the first
      // https://github.com/oxidecomputer/omicron/blob/3de7e909b196c07811025bbf41aaa8a35e6fa3cf/oximeter/oxql-types/src/table.rs#L280
      const valueType = seriesList[0]?.points.values[0]?.values.type
      // if no series had any values, there's nothing to chart
      if (valueType === undefined) return { kind: 'unaligned' as const, charts: [] }

      return match(valueType)
        .with('integer_distribution', 'double_distribution', () => ({
          kind: 'distributions' as const,
          charts: seriesList.map((series): Heatmap => {
            const timestamps = toPosix(series.points.timestamps)
            return {
              name,
              description: getFormattedFields(series),
              timestamps,
              metricType: series.points.values[0].metricType,
              startTimes:
                series.points.startTimes?.map(parseTs) ?? fakeStartTimes(timestamps),
              data: narrowToDistributions(series.points.values[0].values),
            }
          }),
        }))
        .with('integer', 'double', 'boolean', 'string', () => ({
          kind: 'unaligned' as const,
          charts: seriesList.map(
            (series): Line => ({
              name,
              description: getFormattedFields(series),
              timestamps: toPosix(series.points.timestamps),
              metricType: series.points.values[0].metricType,
              data: narrowToNumbers(series.points.values[0].values),
            })
          ),
        }))
        .exhaustive()
    })
    .exhaustive()
  const timestamps = chart.charts.flatMap(({ timestamps }) => timestamps)
  const min = R.firstBy(timestamps, (t) => t)
  const max = R.firstBy(timestamps, (t) => -t)

  return {
    ...chart,
    // i figure any chart collection probably benefits from sharing their X-axis, even if they're
    // rendered in sequence
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

// Drops (or keeps, without copying) the first sample of a series.
const dropFirst =
  (drop: boolean) =>
  <T,>(xs: T[]): T[] =>
    drop ? xs.slice(1) : xs

// We trim timestamps and data at the same time to be confident they're in sync.
const trimSeries = <T,>(
  trim: boolean,
  { timestamps, data }: { timestamps: number[]; data: T[][] }
) => {
  const d = dropFirst(trim)
  return { timestamps: d(timestamps), data: data.map(d) }
}
const trimHeatmap = <T,>(
  trim: boolean,
  {
    timestamps,
    startTimes,
    data,
  }: { timestamps: number[]; startTimes: number[]; data: T[] }
) => {
  const d = dropFirst(trim)
  return { timestamps: d(timestamps), startTimes: d(startTimes), data: d(data) }
}

// The first aligned point of a cumulative counter is diffed against the counter's start_time,
// collapsing all pre-window history into one giant bucket. It's not "erroneous" but it's usually
// not useful, and you'd want to hide it to get a more useful y-axis for the rest of your data.
const groupHasPointWorthDropping = (g: ChartGroup): boolean =>
  match(g)
    .with('empty-timeseries', () => false)
    // Aligned/joined tables may be derived from cumulatives, so we assume it's worth offering
    .with({ kind: 'joined' }, { kind: 'aligned' }, () => true)
    // Gauges are, by definition, not cumulative, so you'll never see a giant first point
    .with({ kind: 'unaligned' }, { kind: 'distributions' }, ({ charts }) =>
      charts.some((c) => c.metricType !== 'gauge')
    )
    .exhaustive()

// A flattened representation of a single chart.
type ChartDisplay = { key: string; showDivider: boolean } & (
  | { kind: 'empty' }
  | { kind: 'multiline'; startTime: Date; endTime: Date; chart: Multiline }
  | { kind: 'line'; startTime: Date; endTime: Date; chart: Line }
  | { kind: 'heatmap'; chart: Heatmap }
)

// Virtualization relies on a list of near-same-size items, so we flatten out all the groups
const toDisplays = (groups: ChartGroup[]): ChartDisplay[] =>
  groups.flatMap((g, t): ChartDisplay[] => {
    if (g === 'empty-timeseries')
      return [{ kind: 'empty', key: `t${t}`, showDivider: true }]
    const { startTime, endTime } = g
    return match(g)
      .with({ kind: 'distributions' }, ({ charts }) =>
        charts.map(
          (chart, i): ChartDisplay => ({
            kind: 'heatmap',
            key: `t${t}.${i}`,
            showDivider: i === 0,
            chart,
          })
        )
      )
      .with({ kind: 'unaligned' }, ({ charts }) =>
        charts.map(
          (chart, i): ChartDisplay => ({
            kind: 'line',
            key: `t${t}.${i}`,
            showDivider: i === 0,
            startTime,
            endTime,
            chart,
          })
        )
      )
      .with({ kind: 'joined' }, { kind: 'aligned' }, ({ charts }) =>
        charts.map(
          (chart, i): ChartDisplay => ({
            kind: 'multiline',
            key: `t${t}.${i}`,
            showDivider: i === 0,
            startTime,
            endTime,
            chart,
          })
        )
      )
      .exhaustive()
  })

function MultilineChart({
  display,
  trim,
}: {
  display: Extract<ChartDisplay, { kind: 'multiline' }>
  trim: boolean
}) {
  const { chart, startTime, endTime } = display
  const trimmed = trimSeries(trim, {
    timestamps: chart.timestamps,
    data: chart.data.map((d) => d.values),
  })
  const seriesLabels = chart.data.map((l) => l.label)
  return (
    <ChartContainer>
      <ChartHeader title={chart.name} label="" description={chart.description} />
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
}

function LineChart({
  display,
  trim,
}: {
  display: Extract<ChartDisplay, { kind: 'line' }>
  trim: boolean
}) {
  const { chart, startTime, endTime } = display
  const trimmed = trimSeries(trim, { data: [chart.data], timestamps: chart.timestamps })
  return (
    <ChartContainer>
      <ChartHeader title={chart.name} label="" description={chart.description} />
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
}

function HeatmapChart({
  display,
  trim,
}: {
  display: Extract<ChartDisplay, { kind: 'heatmap' }>
  trim: boolean
}) {
  const { chart } = display
  const trimmed = trimHeatmap(trim, {
    timestamps: chart.timestamps,
    startTimes: chart.startTimes,
    data: chart.data,
  })
  return (
    <ChartContainer>
      <ChartHeader title={chart.name} label="" description={chart.description} />
      <Heatmap
        title={chart.name}
        timestamps={trimmed.timestamps}
        startTimes={trimmed.startTimes}
        distributions={trimmed.data}
        yAxisTickFormatter={formatTick}
      />
    </ChartContainer>
  )
}

function ChartEntry({ display, trim }: { display: ChartDisplay; trim: boolean }) {
  return (
    <>
      {display.showDivider ? (
        // Use padding for spacing so the virtualizer can measure the bounding box properly
        <div className="py-8">
          <Divider className="mx-16" />
        </div>
      ) : (
        <div className="pt-8" />
      )}
      {match(display)
        .with({ kind: 'empty' }, () => <p className="text-secondary">No results</p>)
        .with({ kind: 'multiline' }, (r) => <MultilineChart display={r} trim={trim} />)
        .with({ kind: 'line' }, (r) => <LineChart display={r} trim={trim} />)
        .with({ kind: 'heatmap' }, (r) => <HeatmapChart display={r} trim={trim} />)
        .exhaustive()}
    </>
  )
}

const getTextareaHeightForQuery = (q: string): number => Math.max(q.split('\n').length, 4)

export default function OxqlPage() {
  const query = useApiMutation(api.systemTimeseriesQuery)

  const [searchParams, setSearchParams] = useSearchParams()

  const defaultQuery = searchParams.get('query') ?? defaultValues.query

  const [textareaRowCount, setTextareaRowCount] = useState(
    getTextareaHeightForQuery(defaultQuery)
  )

  const form = useForm({
    defaultValues: { query: defaultQuery },
  })
  const control = form.control

  const [dropFirstPoint, setDropFirstPoint] = useState(true)

  const onSubmit = (body: TimeseriesQuery) => {
    query.mutate(
      { body },
      {
        onSuccess: () => {
          setSearchParams(
            (params) => {
              params.set('query', body.query)
              return params
            },
            { replace: true, preventScrollReset: true, state: { skipLoadingBar: true } }
          )
        },
      }
    )
  }

  const chartGroups: ChartGroup[] | null = useMemo(
    () => (query.data ? query.data.tables.map(tableToGroup) : null),
    [query.data]
  )

  const hasTrimmableCharts = chartGroups?.some(groupHasPointWorthDropping) ?? false
  const trim = dropFirstPoint && hasTrimmableCharts

  const charts = useMemo(() => (chartGroups ? toDisplays(chartGroups) : []), [chartGroups])

  // Since the whole window is the scroll container, the virtualizer needs to
  // know the offset from the top. By reacting to height changes in everything
  // prior to the virtualized area, we can keep the list's offset height in sync.
  const [preChartsSize, preChartsRef] = useElementSize()
  const chartsRef = useRef<HTMLDivElement>(null)
  const [scrollMargin, setScrollMargin] = useState(0)
  useLayoutEffect(() => {
    if (chartsRef.current) {
      setScrollMargin(chartsRef.current.getBoundingClientRect().top + window.scrollY)
    }
  }, [preChartsSize?.height, charts.length])

  const virtualizer = useWindowVirtualizer({
    count: charts.length,
    estimateSize: () => 500,
    overscan: 4,
    scrollMargin,
    getItemKey: (i) => charts[i].key,
  })

  return (
    <>
      <div ref={preChartsRef}>
        <PageHeader>
          <PageTitle icon={<Monitoring24Icon />}>OxQL Explorer</PageTitle>
          <DocsPopover
            heading="OxQL"
            icon={<Monitoring16Icon />}
            summary="The Oximeter Query Language is a domain-specific language for interrogating telemetry data from software and hardware components across the rack."
            links={[docLinks.oxql, docLinks.oxqlSchemas]}
          />
        </PageHeader>
        <form className="max-w-lg space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex justify-end">
            <DropdownMenu.Root>
              <DropdownMenu.Trigger
                render={
                  <Button variant="secondary" size="sm">
                    Try an example
                  </Button>
                }
              />
              <DropdownMenu.Content anchor="bottom end" gap={8}>
                {exampleItems.map(({ label, value }) => (
                  <DropdownMenu.Item
                    key={label}
                    label={label}
                    onSelect={() => {
                      setTextareaRowCount(getTextareaHeightForQuery(value))
                      form.setValue('query', value)
                    }}
                  />
                ))}
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </div>
          <OxqlField rows={textareaRowCount} name="query" required control={control} />
          <Button type="submit" disabled={query.status === 'pending'}>
            Run query
          </Button>
        </form>
        {match(query)
          .with(
            { status: 'success' },
            () =>
              hasTrimmableCharts && (
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
              )
          )
          .otherwise(() => '')}
      </div>

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
          <div
            ref={chartsRef}
            className="relative"
            style={{ height: virtualizer.getTotalSize() }}
          >
            {virtualizer.getVirtualItems().map((item) => (
              <div
                key={item.key}
                data-index={item.index}
                ref={virtualizer.measureElement}
                className="absolute top-0 left-0 w-full"
                style={{ transform: `translateY(${item.start - scrollMargin}px)` }}
              >
                <ChartEntry display={charts[item.index]} trim={trim} />
              </div>
            ))}
          </div>
        ))
        .exhaustive()}
    </>
  )
}
