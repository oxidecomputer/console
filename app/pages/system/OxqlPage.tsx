/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useQuery } from '@tanstack/react-query'
import { useWindowVirtualizer } from '@tanstack/react-virtual'
import { Fragment, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useController, useForm } from 'react-hook-form'
import { useSearchParams } from 'react-router'
import * as R from 'remeda'
import { match } from 'ts-pattern'

import {
  api,
  q,
  useApiMutation,
  camelToSnake,
  type Distributiondouble,
  type MetricType,
  type OxqlQueryResult,
  type OxqlTable,
  type Points,
  type Timeseries,
  type TimeseriesQuery,
  type ValueArray,
} from '@oxide/api'
import { Monitoring16Icon, Monitoring24Icon } from '@oxide/design-system/icons/react'
import { Badge } from '@oxide/design-system/ui'

import { DocsPopover } from '~/components/DocsPopover'
import { Heatmap } from '~/components/Heatmap'
import { MoreActionsMenu } from '~/components/MoreActionsMenu'
import { codeSegment, parseOxqlQueryError, stripCaretLine } from '~/components/oxql-error'
import { OxqlEditor } from '~/components/OxqlEditor'
import {
  ChartContainer,
  ChartHeader,
  SkeletonMetric,
  TimeSeriesChart,
} from '~/components/TimeSeriesChart'
import { useElementSize } from '~/hooks/use-element-size'
import { addToast } from '~/stores/toast'
import { Button } from '~/ui/lib/Button'
import { CardBlock } from '~/ui/lib/CardBlock'
import { Checkbox } from '~/ui/lib/Checkbox'
import { Divider } from '~/ui/lib/Divider'
import * as Dropdown from '~/ui/lib/DropdownMenu'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { ErrorInlineCode } from '~/ui/lib/InlineCode'
import { Message } from '~/ui/lib/Message'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { TextInputError } from '~/ui/lib/TextInput'
import { Tooltip } from '~/ui/lib/Tooltip'
import { Truncate, truncate } from '~/ui/lib/Truncate'
import { ALL_ISH } from '~/util/consts'
import { docLinks } from '~/util/links'
import { pluralize } from '~/util/str'

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

export const handle = { crumb: 'Metrics Explorer' }

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
  description?: ReactNode
  timestamps: number[]
  data: Data
}

type Multiline = Chart<{ label: string; values: (number | null)[] }[]>
type LineChartData = Chart<(number | null)[]> & { metricType: MetricType }
type HeatmapChartData = Chart<(Distributiondouble | null)[]> & {
  metricType: MetricType
  startTimes: number[]
}

type ChartGroup =
  | 'empty-timeseries'
  | ({ startTime: Date; endTime: Date } & (
      | { kind: 'unaligned'; charts: LineChartData[] }
      | { kind: 'distributions'; charts: HeatmapChartData[] }
      | { kind: 'aligned'; charts: Multiline[] }
      | { kind: 'joined'; charts: Multiline[] }
    ))

const getFormattedFields = (t: Timeseries): string =>
  Object.entries(t.fields)
    .map(([fieldName, x]) => `${camelToSnake(fieldName)}: ${x.value}`)
    .join(' / ')

const FIELDS_SHOWN = 5
// long enough for names/serials; a UUID (36 chars) gets middle-truncated
const FIELD_VALUE_MAX_LEN = 24

const FieldBadge = ({ fieldName, value }: { fieldName: string; value: string }) => {
  const truncated = value.length > FIELD_VALUE_MAX_LEN
  const badge = (
    <Badge color="neutral">
      <span className="opacity-60">{camelToSnake(fieldName)}</span>
      <span className="ml-1">
        {truncated ? truncate(value, FIELD_VALUE_MAX_LEN, 'middle') : value}
      </span>
    </Badge>
  )
  if (!truncated) return badge
  return (
    <Tooltip content={value} placement="top">
      {/* Badge doesn't take a ref, so the tooltip needs a host element target */}
      <span className="inline-flex">{badge}</span>
    </Tooltip>
  )
}

// JSX version of getFormattedFields for chart descriptions: each field is a
// badge, capped at FIELDS_SHOWN with a +N tooltip listing the rest
const FieldsList = ({ timeseries }: { timeseries: Timeseries }) => {
  const fields = Object.entries(timeseries.fields)
  const overflow = fields.slice(FIELDS_SHOWN)
  return (
    <div className="mt-3 flex flex-wrap items-center gap-1">
      {fields.slice(0, FIELDS_SHOWN).map(([fieldName, x]) => (
        <FieldBadge key={fieldName} fieldName={fieldName} value={String(x.value)} />
      ))}
      {overflow.length > 0 && (
        <Tooltip
          placement="bottom"
          content={
            <div className="-mx-2 grid grid-cols-[auto_minmax(0,1fr)] gap-y-1 *:first:border-0 *:first:pt-0 *:nth-[2]:border-0 *:nth-[2]:pt-0">
              {overflow.map(([fieldName, x]) => (
                <Fragment key={fieldName}>
                  <span className="text-mono-sm text-tertiary border-default flex items-center border-t pt-1 pr-6 pl-2">
                    {camelToSnake(fieldName)}
                  </span>
                  <Truncate
                    text={String(x.value)}
                    position="middle"
                    className="border-default border-t pt-1 pr-4"
                  />
                </Fragment>
              ))}
            </div>
          }
        >
          <div className="text-mono-sm target-4">+{overflow.length}</div>
        </Tooltip>
      )}
    </div>
  )
}

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
          description: <FieldsList timeseries={series} />,
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
          charts: seriesList.map((series): HeatmapChartData => {
            const timestamps = toPosix(series.points.timestamps)
            return {
              name,
              description: <FieldsList timeseries={series} />,
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
            (series): LineChartData => ({
              name,
              description: <FieldsList timeseries={series} />,
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

// A render-ready representation of a single chart. Keep the data arrays memoized: uplot-react
// deep-compares the whole dataset whenever their identity changes (see TimeSeriesChart.spec.tsx)
type ChartDisplay = { key: string; showDivider: boolean } & (
  | { kind: 'empty' }
  | {
      kind: 'chart'
      startTime: Date
      endTime: Date
      name: string
      description?: ReactNode
      timestamps: number[]
      data: (number | null)[][]
      /** only set for multi-series charts, where it enables the legend */
      seriesLabels?: string[]
    }
  | {
      kind: 'heatmap'
      name: string
      description?: ReactNode
      timestamps: number[]
      startTimes: number[]
      data: (Distributiondouble | null)[]
    }
)

// Virtualization relies on a list of near-same-size items, so we flatten out all the groups
const toDisplays = (groups: ChartGroup[], trim: boolean): ChartDisplay[] =>
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
            name: chart.name,
            description: chart.description,
            ...trimHeatmap(trim, {
              timestamps: chart.timestamps,
              startTimes: chart.startTimes,
              data: chart.data,
            }),
          })
        )
      )
      .with({ kind: 'unaligned' }, ({ charts }) =>
        charts.map(
          (chart, i): ChartDisplay => ({
            kind: 'chart',
            key: `t${t}.${i}`,
            showDivider: i === 0,
            startTime,
            endTime,
            name: chart.name,
            description: chart.description,
            ...trimSeries(trim, {
              timestamps: chart.timestamps,
              data: [chart.data],
            }),
          })
        )
      )
      .with({ kind: 'joined' }, { kind: 'aligned' }, ({ charts }) =>
        charts.map(
          (chart, i): ChartDisplay => ({
            kind: 'chart',
            key: `t${t}.${i}`,
            showDivider: i === 0,
            startTime,
            endTime,
            name: chart.name,
            description: chart.description,
            seriesLabels: chart.data.map((l) => l.label),
            ...trimSeries(trim, {
              timestamps: chart.timestamps,
              data: chart.data.map((d) => d.values),
            }),
          })
        )
      )
      .exhaustive()
  })

function ChartCard({ display }: { display: Extract<ChartDisplay, { kind: 'chart' }> }) {
  return (
    <ChartContainer>
      <ChartHeader title={display.name} label="" description={display.description} />
      <TimeSeriesChart
        timestamps={display.timestamps}
        data={display.data}
        seriesLabels={display.seriesLabels}
        title={display.name}
        interpolation="linear"
        startTime={display.startTime}
        endTime={display.endTime}
        unit={undefined}
        loading={false}
        yAxisTickFormatter={formatTick}
      />
    </ChartContainer>
  )
}

function HeatmapCard({ display }: { display: Extract<ChartDisplay, { kind: 'heatmap' }> }) {
  return (
    <ChartContainer>
      <ChartHeader title={display.name} label="" description={display.description} />
      <Heatmap
        title={display.name}
        timestamps={display.timestamps}
        startTimes={display.startTimes}
        distributions={display.data}
        yAxisTickFormatter={formatTick}
      />
    </ChartContainer>
  )
}

function ChartEntry({ display }: { display: ChartDisplay }) {
  return (
    <>
      {match(display)
        .with({ kind: 'empty' }, () => (
          <ChartContainer>
            <SkeletonMetric>
              {/* gradient uses the surface-default token so it works in both themes */}
              <div
                className="absolute bottom-0 z-0 h-full w-full"
                style={{
                  background:
                    'linear-gradient(90deg, transparent 0%, var(--surface-default) 33%, var(--surface-default) 66%, transparent 100%)',
                }}
              />
              <div className="z-10">
                <EmptyMessage
                  title="No results"
                  body="Query returned no data. Try adjusting the query or expanding the time range"
                />
              </div>
            </SkeletonMetric>
          </ChartContainer>
        ))
        .with({ kind: 'chart' }, (r) => <ChartCard display={r} />)
        .with({ kind: 'heatmap' }, (r) => <HeatmapCard display={r} />)
        .exhaustive()}
    </>
  )
}

// covers the header strings plus every member of ValueArray['values']
type CsvValue = string | number | boolean | object | null | undefined

const csvCell = (v: CsvValue): string => {
  const s =
    v === null || v === undefined
      ? ''
      : typeof v === 'object'
        ? JSON.stringify(v)
        : String(v)
  return /[",\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s
}

const tablesToCsv = (tables: OxqlTable[]): string => {
  const rows: CsvValue[][] = [['table', 'fields', 'metric', 'timestamp', 'value']]
  for (const table of tables) {
    // like the chart labels, joined tables get their per-line metric names
    // from the comma-joined table name
    const metricNames = table.name.split(',').map((s) => s.trim())
    for (const series of table.timeseries) {
      const fields = getFormattedFields(series)
      series.points.values.forEach((v, i) => {
        const metric = metricNames[i] ?? table.name
        series.points.timestamps.forEach((ts, j) => {
          rows.push([
            table.name,
            fields,
            metric,
            new Date(ts).toISOString(),
            v.values.values[j],
          ])
        })
      })
    }
  }
  return rows.map((row) => row.map(csvCell).join(',')).join('\n')
}

const copyText = (text: string, toastMessage: string) => {
  window.navigator.clipboard.writeText(text).then(() => addToast(toastMessage))
}

function ResultsMenu({ data }: { data?: OxqlQueryResult }) {
  // the menu is always visible so the header doesn't jump around, but the
  // actions only make sense once a query has succeeded
  const noResults = data === undefined ? 'Run a query first' : undefined
  return (
    <MoreActionsMenu label="Results actions">
      <Dropdown.Item
        disabled={noResults}
        onSelect={() =>
          data && copyText(JSON.stringify(data, null, 2), 'Results copied as JSON')
        }
        label="Copy as JSON"
      />
      <Dropdown.Item
        disabled={noResults}
        onSelect={() => data && copyText(tablesToCsv(data.tables), 'Results copied as CSV')}
        label="Copy as CSV"
      />
    </MoreActionsMenu>
  )
}

function ResultsSummary({ tables }: { tables: OxqlTable[] }) {
  const timeseries = tables.flatMap((t) => t.timeseries)
  const nPoints = R.sumBy(timeseries, (t) => t.points.timestamps.length)
  return (
    <div className="text-mono-xs text-quaternary px-2">
      <span className="text-tertiary">{timeseries.length} timeseries</span> /{' '}
      <span className="text-tertiary">
        {nPoints.toLocaleString()} {pluralize('point', nPoints)}
      </span>
    </div>
  )
}

// Server-side query errors render below the editor in the same Message box we
// use for API errors elsewhere (e.g., side modal forms). role=alert announces
// the failure to screen readers on arrival; mono + pre-wrap preserve the parse
// errors' caret alignment.
// The code-ish parts of an error message get inline code styling via
// codeSegment (see oxql-error.ts). The `..` excerpt markers stay outside the
// chip, reading as ellipses.
const ErrorMessage = ({ message }: { message: string }) => (
  <span className="whitespace-pre-wrap">
    {message.split(codeSegment).map((part, i) => {
      if (i % 2 === 0) return part
      // the chip delimits the code, so drop the markers/quotes around it
      const code = part.startsWith('.. ') ? part.slice(3, -3) : part.slice(1, -1)
      // an empty chip is just visual noise; show the raw text instead
      if (!code) return part
      return (
        <span key={i}>
          {part.startsWith('.. ') && '.. '}
          <ErrorInlineCode>{code}</ErrorInlineCode>
          {part.startsWith('.. ') && ' ..'}
        </span>
      )
    })}
  </span>
)

const QueryError = ({ message }: { message: string }) => (
  <div role="alert" className="mt-2">
    <Message
      variant="error"
      title="Query failed"
      content={<ErrorMessage message={stripCaretLine(message)} />}
    />
  </div>
)

// Rendered in every query state so the layout doesn't shift when results arrive
const ResultsSection = ({ children }: { children: ReactNode }) => (
  <>
    <Divider className="my-8" />
    {children}
  </>
)

export default function OxqlPage() {
  const query = useApiMutation(api.systemTimeseriesQuery)

  // powers editor autocomplete. no loading state needed: completions are a
  // progressive enhancement and simply appear once this resolves
  const schemas = useQuery(q(api.systemTimeseriesSchemaList, { query: { limit: ALL_ISH } }))

  const [searchParams, setSearchParams] = useSearchParams()

  const defaultQuery = searchParams.get('query') ?? defaultValues.query

  const form = useForm({
    defaultValues: { query: defaultQuery },
  })
  const { field, fieldState } = useController({
    name: 'query',
    control: form.control,
    rules: {
      validate: (value) => (value.trim() ? undefined : 'Enter a query'),
    },
  })

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

  // Parse errors carry a line:column position we can point at in the editor.
  // Only show the diagnostic while the editor still holds the exact query that
  // failed; as soon as the user edits, the position no longer applies.
  const oxqlError = query.error ? parseOxqlQueryError(query.error.message) : null
  const diagnostic =
    oxqlError && field.value === query.variables?.body.query ? oxqlError : undefined

  const chartGroups: ChartGroup[] | null = useMemo(
    () => (query.data ? query.data.tables.map(tableToGroup) : null),
    [query.data]
  )

  const hasTrimmableCharts = chartGroups?.some(groupHasPointWorthDropping) ?? false
  const trim = dropFirstPoint && hasTrimmableCharts

  const charts = useMemo(
    () => (chartGroups ? toDisplays(chartGroups, trim) : []),
    [chartGroups, trim]
  )

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
          <PageTitle icon={<Monitoring24Icon />}>Metrics Explorer</PageTitle>
          <DocsPopover
            heading="OxQL"
            icon={<Monitoring16Icon />}
            summary="The Oximeter Query Language is a domain-specific language for interrogating telemetry data from software and hardware components across the rack."
            links={[docLinks.oxql, docLinks.oxqlSchemas]}
          />
        </PageHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardBlock>
            <CardBlock.Header title="Query">
              <div className="flex items-center gap-2">
                {query.status === 'success' && (
                  <>
                    <ResultsSummary tables={query.data.tables} />
                  </>
                )}
                <Button type="submit" size="sm" loading={query.status === 'pending'}>
                  Run query
                </Button>
                <ResultsMenu data={query.data} />
              </div>
            </CardBlock.Header>
            <CardBlock.Body>
              <div>
                <OxqlEditor
                  aria-label="OxQL query"
                  error={!!fieldState.error || query.status === 'error'}
                  diagnostic={diagnostic}
                  value={field.value}
                  onChange={field.onChange}
                  onSubmit={() => form.handleSubmit(onSubmit)()}
                  schemas={schemas.data?.items}
                />
                {fieldState.error?.message ? (
                  <TextInputError>{fieldState.error.message}</TextInputError>
                ) : query.error ? (
                  <QueryError message={query.error.message} />
                ) : null}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-mono-sm text-tertiary mr-1">Examples</span>
                {exampleItems.map(({ label, value }) => (
                  <button
                    key={label}
                    type="button"
                    className="text-mono-xs border-default text-secondary hover:bg-hover rounded border px-2 py-1"
                    onClick={() => {
                      form.setValue('query', value, { shouldValidate: true })
                      form.handleSubmit(onSubmit)()
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </CardBlock.Body>
          </CardBlock>
        </form>
      </div>

      {match(query)
        // on error the message renders below the editor, so the results
        // section just shows the same empty chart as the idle state
        .with({ status: 'idle' }, { status: 'error' }, () => (
          <ResultsSection>
            <ChartContainer>
              {/* the loading skeleton, minus the shimmer and bouncing indicator */}
              <SkeletonMetric>{null}</SkeletonMetric>
            </ChartContainer>
          </ResultsSection>
        ))
        .with({ status: 'pending' }, () => (
          <ResultsSection>
            <ChartContainer>
              <TimeSeriesChart
                loading
                title=""
                data={undefined}
                timestamps={undefined}
                startTime={new Date(0)}
                endTime={new Date(0)}
              />
            </ChartContainer>
          </ResultsSection>
        ))
        .with({ status: 'success' }, () => (
          <ResultsSection>
            {hasTrimmableCharts && (
              <div className="mb-2">
                <Checkbox
                  checked={dropFirstPoint}
                  onChange={(e) => setDropFirstPoint(e.target.checked)}
                >
                  Drop first point
                </Checkbox>
              </div>
            )}
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
                  className="absolute top-0 left-0 w-full pb-4"
                  style={{ transform: `translateY(${item.start - scrollMargin}px)` }}
                >
                  <ChartEntry display={charts[item.index]} />
                </div>
              ))}
            </div>
          </ResultsSection>
        ))
        .exhaustive()}
    </>
  )
}
