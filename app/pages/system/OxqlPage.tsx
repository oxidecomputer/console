/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useEffect, useMemo, useReducer, useState } from 'react'
import { useForm } from 'react-hook-form'
import * as R from 'remeda'
import { match } from 'ts-pattern'

import {
  api,
  getListQFn,
  queryClient,
  useApiMutation,
  usePrefetchedQuery,
  camelToSnake,
  type Timeseries,
  type FieldSchema,
  type FieldType,
  type OxqlTable,
  type TimeseriesQuery,
  type TimeseriesSchema,
  type TimeseriesSchemaResultsPage,
  type Values,
} from '@oxide/api'
import {
  Close16Icon,
  Monitoring16Icon,
  Monitoring24Icon,
} from '@oxide/design-system/icons/react'

import { DocsPopover } from '~/components/DocsPopover'
import { useDateTimeRangePicker } from '~/components/form/fields/DateTimeRangePicker'
import { DescriptionField } from '~/components/form/fields/DescriptionField'
import { oxqlTimestamp } from '~/components/oxql-metrics/util'
import { ChartContainer, ChartHeader, TimeSeriesChart } from '~/components/TimeSeriesChart'
import { Button } from '~/ui/lib/Button'
import { Checkbox } from '~/ui/lib/Checkbox'
import { Combobox } from '~/ui/lib/Combobox'
import { FieldLabel } from '~/ui/lib/FieldLabel'
import { Listbox } from '~/ui/lib/Listbox'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { Tabs } from '~/ui/lib/Tabs'
import { TextInput } from '~/ui/lib/TextInput'
import { ALL_ISH } from '~/util/consts'
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

const schemaList = getListQFn(api.systemTimeseriesSchemaList, {
  query: { limit: ALL_ISH },
})

export async function clientLoader() {
  // Not entirely sure this merits prefetching; might depend on whether we want to go builder-only,
  // in which case there's not much to do without the schema
  await queryClient.prefetchQuery(schemaList.optionsFn())
  return null
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

  // generated client thinks these are dates but they're actually strings
  const posixes = longestSeries.points.timestamps.map((ts) =>
    // converting to posix numbers knocks us down to millisecond precision, but uplot is going to
    // plot by second anyways
    Date.parse(ts as unknown as string)
  )

  const end = R.last(posixes)
  // aligned series may not share the same start time, but they will always have a common final
  // timestamp
  if (
    !items.every(
      ({ points }) =>
        points.timestamps.length === 0 || // or no timestamp at all!
        Date.parse(R.last(points.timestamps) as unknown as string) === end
    )
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

const timeseriesDuckChecker = (table: OxqlTable): ChartGroups | 'empty-timeseries' => {
  const { name, timeseries } = table
  if (timeseries.length === 0) return 'empty-timeseries'
  const kind:
    | Exclude<TimeseriesKind, 'aligned'>
    | { kind: 'aligned'; timestamps: number[] } =
    // we expect all values arrays to be the same length, so if the first isn't longer than 1, we
    // expect singletons across the board
    timeseries[0]?.points.values.length > 1
      ? ('joined' as Exclude<TimeseriesKind, 'aligned'>)
      : match(getAlignedTimestamps(timeseries))
          .with({ type: 'none' }, () => 'unaligned' as Exclude<TimeseriesKind, 'aligned'>)
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
          timestamps: series.points.timestamps.map((ts) =>
            Date.parse(ts as unknown as string)
          ), // again, the types are lying to you. `ts` is an iso string, NOT a date!!!!
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
          data: timeseries.map((series) => ({
            label: getFormattedFields(series),
            values: leftPad(narrowToNumbers(series.points.values[0]), timestamps.length),
          })),
        },
      ],
    }))
    .with('unaligned', (kind) => ({
      kind,
      charts: timeseries.map((series) => ({
        name,
        description: getFormattedFields(series),
        timestamps: series.points.timestamps.map((ts) =>
          Date.parse(ts as unknown as string)
        ), // yes, the date lie
        data: series.points.values[0],
      })),
    }))
    .exhaustive()
  const timestamps = chart.charts.flatMap(({ timestamps }) => timestamps)
  const min = Math.min(...timestamps)
  const max = Math.max(...timestamps)

  return {
    ...chart,
    // i figure any chart collection probably benefits from sharing their X-axis, even if they're
    // rendered in sequence
    startTime: new Date(min),
    endTime: new Date(max),
  }
}

const TICK_UNITS = [
  [1e12, 't'],
  [1e9, 'b'],
  [1e6, 'm'],
  [1e3, 'k'],
] as const
const formatTick = (n: number): string => {
  const [divisor, suffix] = TICK_UNITS.find(([min]) => Math.abs(n) >= min) ?? [1, '']
  return (n / divisor).toLocaleString() + suffix
}

type Schema = Omit<TimeseriesSchema, 'timeseriesName'>

type Schemas = Record<string, Record<string, Schema>>
type ByConsoleSupport = {
  supported: Schemas
  unsupported: Schemas
}

const arrangeSchemas = (data: TimeseriesSchemaResultsPage): ByConsoleSupport =>
  data.items.reduce<ByConsoleSupport>(
    (acc, { timeseriesName, ...schema }) => {
      const [target, metric] = timeseriesName.split(':')
      match(schema.datumType)
        .with(
          // we'll just treat it as a 1/0
          'bool',
          // actual numbers
          'i8',
          'u8',
          'i16',
          'u16',
          'i32',
          'u32',
          'i64',
          'u64',
          'f32',
          'f64',
          // since we're encouraging alignment, cumulatives end up as gauges instead of deltas. nice
          // and easy
          'cumulative_i64',
          'cumulative_u64',
          'cumulative_f32',
          'cumulative_f64',
          () => {
            acc.supported[target] = acc.supported[target] || {}
            acc.supported[target][metric] = schema
          }
        )
        .with(
          // no instances currently, but i think it'd have to be a table?
          'string',
          // no instances either, this seems like a unit snuck in to the wrong club!
          'bytes',
          // you can express these with a heatmap, but we have to let people skip alignment
          'histogram_i8',
          'histogram_u8',
          'histogram_i16',
          'histogram_u16',
          'histogram_i32',
          'histogram_u32',
          'histogram_i64',
          'histogram_u64',
          'histogram_f32',
          'histogram_f64',
          () => {
            acc.unsupported[target] = acc.unsupported[target] || {}
            acc.unsupported[target][metric] = schema
          }
        )
        .exhaustive()

      return acc
    },
    { supported: {}, unsupported: {} }
  )

// Bucket sizes for `align mean_within(X)`. In practice, aligning seems much more likely to happen
// than not; it's required if you're grouping, and in our case, collecting two timeseries into the
// same chart is kind of wild without aligned times (if series A has a point every second with .00
// hanging over, and series B has a point every second with .25 hanging over, you've either got to
// fill in a bunch of nulls (which may obscure a _meaningful_ null!), or interpolate between
// missing values, which is basically the same problem.
//
// For what it's worth, though, you can avoid that by detecting whether the resulting data is
// aligned (by checking the timestamps lists) and just not collating together timeseries that aren't
// aligned!
const BUCKET_SIZES = [
  { value: '5s', label: '5 seconds' },
  { value: '10s', label: '10 seconds' },
  { value: '30s', label: '30 seconds' },
  { value: '1m', label: '1 minute' },
  { value: '5m', label: '5 minutes' },
  { value: '10m', label: '10 minutes' },
  { value: '30m', label: '30 minutes' },
  { value: '1h', label: '1 hour' },
]

const GROUP_BY_OPS = [
  { value: 'mean', label: 'mean' },
  { value: 'sum', label: 'sum' },
]

type GroupBy = { cols: string[]; op: string }

const buildQuery = (
  target: string,
  metric: string,
  startTime: Date,
  endTime: Date,
  bucket: string,
  filterClauses: string[],
  groupBy: GroupBy | null
) =>
  [
    `get ${target}:${metric}`,
    `    | filter timestamp >= @${oxqlTimestamp(startTime)}`,
    `          && timestamp < @${oxqlTimestamp(endTime)}`,
    // each user filter is its own stage; OxQL ANDs successive filters together
    ...filterClauses.map((clause) => `    | filter ${clause}`),
    `    | align mean_within(${bucket})`,
    // group_by must come after align, since it requires aligned input
    ...(groupBy ? [`    | group_by [${groupBy.cols.join(', ')}], ${groupBy.op}`] : []),
  ].join('\n')

type Filter = {
  // just a monotonically increasing number for react keys
  id: number
  field: string
  op: string
  value: string
}

// Comparison operators only make sense for numbers; everything else (strings,
// bools, UUIDs, IPs) gets equality only.
const NUMERIC_FIELD_TYPES = new Set<FieldType>([
  'i8',
  'u8',
  'i16',
  'u16',
  'i32',
  'u32',
  'i64',
  'u64',
])
const COMPARISON_OPS = [
  { value: '>', label: '>' },
  { value: '>=', label: '>=' },
  { value: '<', label: '<' },
  { value: '<=', label: '<=' },
]
const EQUALITY_OPS = [
  { value: '==', label: '==' },
  { value: '!=', label: '!=' },
]

const opsForType = (fieldType: FieldType | undefined) =>
  fieldType && NUMERIC_FIELD_TYPES.has(fieldType)
    ? [...EQUALITY_OPS, ...COMPARISON_OPS]
    : EQUALITY_OPS

// Rather than making people know that uuids go in double quotes and strings go in single quotes, we
// can try to be nice and wrap quotes for them. Then the preview can be their education, instead of
// the error message.
const formatFilterValue = (fieldType: FieldType | undefined, value: string) => {
  if (fieldType && (NUMERIC_FIELD_TYPES.has(fieldType) || fieldType === 'bool'))
    return value
  if (fieldType === 'uuid') return `"${value}"`
  return `'${value}'`
}

function FilterRow({
  fields,
  filter,
  onChange,
  onRemove,
}: {
  fields: FieldSchema[]
  filter: Filter
  onChange: (next: Filter) => void
  onRemove: () => void
}) {
  const fieldType = fields.find((f) => f.name === filter.field)?.fieldType

  return (
    <div className="flex items-center gap-2">
      <Listbox
        className="flex-1"
        label="Filter field"
        hideLabel
        placeholder="Field"
        selected={filter.field || null}
        items={fields.map((f) => ({ value: f.name, label: f.name }))}
        onChange={(field) => {
          const ops = opsForType(fields.find((f) => f.name === field)?.fieldType)
          const op = ops.some((o) => o.value === filter.op) ? filter.op : '=='
          onChange({ ...filter, field, op })
        }}
      />
      <Listbox
        className="w-20"
        label="Filter operator"
        hideLabel
        selected={filter.op}
        items={opsForType(fieldType)}
        onChange={(op) => onChange({ ...filter, op })}
      />
      <TextInput
        className="flex-1"
        aria-label="Filter value"
        placeholder="Value"
        value={filter.value}
        onChange={(e) => onChange({ ...filter, value: e.target.value })}
      />
      {/* Doesn't look how I'd like, but it _is_ an icon button */}
      <Button variant="secondary" size="icon" aria-label="Remove filter" onClick={onRemove}>
        <Close16Icon />
      </Button>
    </div>
  )
}

type BuilderState = {
  target: string | null
  metric: string | null
  bucket: string
  filters: Filter[]
  groupCols: string[]
  groupOp: string
  nextFilterId: number
}

const initialBuilderState: BuilderState = {
  target: null,
  metric: null,
  bucket: '5s',
  filters: [],
  groupCols: [],
  groupOp: 'mean',
  nextFilterId: 0,
}

type BuilderAction =
  | { type: 'setTarget'; target: string }
  | { type: 'setMetric'; metric: string }
  | { type: 'setBucket'; bucket: string }
  // field is resolved by the caller, which has the schema in scope
  | { type: 'addFilter'; field: string }
  | { type: 'updateFilter'; filter: Filter }
  | { type: 'removeFilter'; id: number }
  | { type: 'toggleGroupCol'; name: string }
  | { type: 'setGroupOp'; op: string }

function builderReducer(state: BuilderState, action: BuilderAction): BuilderState {
  return {
    ...state,
    ...match(action)
      .with({ type: 'setTarget' }, ({ target }) => ({
        target,
        metric: null,
        filters: [],
        groupCols: [],
      }))
      .with({ type: 'setMetric' }, ({ metric }) => ({
        metric,
        filters: [],
        groupCols: [],
      }))
      .with({ type: 'setBucket' }, ({ bucket }) => ({ bucket }))
      .with({ type: 'addFilter' }, ({ field }) => ({
        filters: [...state.filters, { id: state.nextFilterId, field, op: '==', value: '' }],
        nextFilterId: state.nextFilterId + 1,
      }))
      .with({ type: 'updateFilter' }, ({ filter }) => ({
        filters: state.filters.map((f) => (f.id === filter.id ? filter : f)),
      }))
      .with({ type: 'removeFilter' }, ({ id }) => ({
        filters: state.filters.filter((f) => f.id !== id),
      }))
      .with({ type: 'toggleGroupCol' }, ({ name }) => {
        const groupCols = state.groupCols.includes(name)
          ? state.groupCols.filter((c) => c !== name)
          : [...state.groupCols, name]
        // try to keep filters downstream of the grouping toggles
        const filters = groupCols.length
          ? state.filters.filter((f) => !f.field || groupCols.includes(f.field))
          : state.filters
        return { groupCols, filters }
      })
      .with({ type: 'setGroupOp' }, ({ op }) => ({ groupOp: op }))
      .exhaustive(),
  }
}

function QueryBuilder({
  schemas,
  onRun,
}: {
  schemas: Schemas
  onRun: (query: string) => void
}) {
  const [state, dispatch] = useReducer(builderReducer, initialBuilderState)
  const { target, metric, bucket, filters, groupCols, groupOp } = state
  const { startTime, endTime, dateTimeRangePicker } = useDateTimeRangePicker({
    initialPreset: 'lastHour',
  })

  const targetItems = Object.keys(schemas)
    .sort()
    .map((t) => ({ value: t, label: t, selectedLabel: t }))
  const metricItems = (target ? Object.keys(schemas[target]) : [])
    .sort()
    .map((m) => ({ value: m, label: m, selectedLabel: m }))

  const fields = target && metric ? schemas[target][metric].fieldSchema : []
  const fieldTypes = new Map(fields.map((f) => [f.name, f.fieldType]))

  const isGrouping = groupCols.length > 0
  // You can only filter by fields that are grouped (unless you're not grouping at all)
  const filterableFields = isGrouping
    ? fields.filter((f) => groupCols.includes(f.name))
    : fields

  const filterClauses = filters
    .filter((f) => f.field && f.value.trim() !== '')
    .map((f) => `${f.field} ${f.op} ${formatFilterValue(fieldTypes.get(f.field), f.value)}`)

  const query =
    target && metric
      ? buildQuery(
          target,
          metric,
          startTime,
          endTime,
          bucket,
          filterClauses,
          isGrouping ? { cols: groupCols, op: groupOp } : null
        )
      : null

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <Combobox
        label="Target"
        placeholder="Select a target"
        items={targetItems}
        selectedItemValue={target ?? ''}
        onChange={(value) => dispatch({ type: 'setTarget', target: value })}
        required
      />
      <Combobox
        label="Metric"
        placeholder="Select a metric"
        items={metricItems}
        selectedItemValue={metric ?? ''}
        onChange={(value) => dispatch({ type: 'setMetric', metric: value })}
        disabled={!target}
        required
      />
      <div className="flex flex-col gap-2">
        <FieldLabel id="time-range-label" as="span">
          Time range
        </FieldLabel>
        {dateTimeRangePicker}
      </div>
      <Listbox
        label="Bucket size"
        description="Aligns points onto a grid with mean_within"
        items={BUCKET_SIZES}
        selected={bucket}
        onChange={(value) => dispatch({ type: 'setBucket', bucket: value })}
        required
      />
      <div className="flex flex-col gap-2">
        <FieldLabel id="group-by-label" as="span">
          Group by
        </FieldLabel>
        {metric ? (
          <>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {fields.map((f) => (
                <Checkbox
                  key={f.name}
                  checked={groupCols.includes(f.name)}
                  onChange={() => dispatch({ type: 'toggleGroupCol', name: f.name })}
                >
                  {f.name}
                </Checkbox>
              ))}
            </div>
            {isGrouping && (
              <Listbox
                className="w-48"
                label="Reducer"
                selected={groupOp}
                items={GROUP_BY_OPS}
                onChange={(value) => dispatch({ type: 'setGroupOp', op: value })}
              />
            )}
          </>
        ) : (
          <span className="text-sans-md text-secondary">Select a metric first</span>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <FieldLabel id="filters-label" as="span">
          Filters
        </FieldLabel>
        {filters.map((filter) => (
          <FilterRow
            key={filter.id}
            fields={filterableFields}
            filter={filter}
            onChange={(next) => dispatch({ type: 'updateFilter', filter: next })}
            onRemove={() => dispatch({ type: 'removeFilter', id: filter.id })}
          />
        ))}
        <div>
          <Button
            variant="secondary"
            size="sm"
            // field is resolved here where the schema is in scope, not in the reducer
            onClick={() =>
              dispatch({ type: 'addFilter', field: filterableFields[0]?.name ?? '' })
            }
            disabled={!metric}
            disabledReason="Select a metric first"
          >
            Add filter
          </Button>
        </div>
      </div>
      {query && (
        <pre className="text-mono-sm text-secondary bg-raise border-secondary rounded-lg border p-3">
          {query}
        </pre>
      )}
      <Button disabled={!query} onClick={() => query && onRun(query)}>
        Run query
      </Button>
    </div>
  )
}

export default function OxqlPage() {
  const query = useApiMutation(api.systemTimeseriesQuery)

  const schemas = arrangeSchemas(usePrefetchedQuery(schemaList.optionsFn()).data)
  useEffect(() => {
    const unsupported = Object.entries(schemas.unsupported)
      .flatMap(([target, metricSchema]) =>
        Object.entries(metricSchema).map(
          ([metric, schema]) =>
            `\u2022 ${target}:${metric} has type \`${schema.datumType}\``
        )
      )
      .join('\n')
    console.info(`The following metrics aren't supported in the console due to their type:

${unsupported}`)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const form = useForm({ defaultValues })
  const control = form.control

  // The first aligned point of a cumulative counter is diffed against the counter's start_time,
  // collapsing all pre-window history into one giant bucket. It's not "erroneous" but it's usually
  // not useful, and you'd want to hide it to get a more useful y-axis for the rest of your data.
  const [dropFirstPoint, setDropFirstPoint] = useState(true)

  const onSubmit = (body: TimeseriesQuery) => {
    query.mutate({ body })
  }

  const stuff: (ChartGroups | 'empty-timeseries')[] | null = useMemo(
    () => (query.data ? query.data.tables.map(timeseriesDuckChecker) : null),
    [query.data]
  )

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Monitoring24Icon />}>OxQL Explorer</PageTitle>
        <DocsPopover
          heading="OxQL Explorer"
          icon={<Monitoring16Icon />}
          summary="OxQL is so nice."
          links={[docLinks.oxql]}
        />
      </PageHeader>
      <Tabs.Root defaultValue="raw" className="mt-4">
        <Tabs.List>
          <Tabs.Trigger value="raw">Raw query</Tabs.Trigger>
          <Tabs.Trigger value="builder">Builder</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="raw" className="pt-4">
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DescriptionField name="query" required control={control} />
            <div className="mt-2 flex flex-wrap gap-2">
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
            <input type="submit" />
          </form>
        </Tabs.Content>
        <Tabs.Content value="builder" className="pt-4">
          <QueryBuilder
            schemas={schemas.supported}
            onRun={(built) => query.mutate({ body: { query: built } })}
          />
        </Tabs.Content>
      </Tabs.Root>

      {match(query)
        .with({ status: 'pending' }, () => 'Loading...')
        .with({ status: 'idle' }, () => '')
        .with({ status: 'error' }, (q) => q.error.message)
        .with({ status: 'success' }, () => (
          <>
            <div className="text-sans-md mt-4 mb-2 flex items-center gap-3">
              <label className="text-secondary flex items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={dropFirstPoint}
                  onChange={(e) => setDropFirstPoint(e.target.checked)}
                />
                Drop first point
              </label>
            </div>
            {stuff &&
              stuff.map((s) =>
                match(s)
                  .with('empty-timeseries', () => 'No results')
                  .with(
                    { kind: 'joined' },
                    { kind: 'aligned' },
                    ({ charts, startTime, endTime }) =>
                      charts.map((chart, i) => {
                        const lineData = chart.data.map((l) =>
                          dropFirstPoint ? l.values.slice(1) : l.values
                        )
                        const seriesLabels = chart.data.map((l) => l.label)
                        return (
                          <ChartContainer key={i}>
                            <ChartHeader
                              title={chart.name}
                              label=""
                              description={chart.description}
                            />
                            <TimeSeriesChart
                              timestamps={chart.timestamps}
                              data={lineData}
                              seriesLabels={seriesLabels}
                              title={query.data?.tables[0].name || ''}
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
                  .with({ kind: 'unaligned' }, ({ charts, startTime, endTime }) =>
                    charts.map((chart, i) => {
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
                      const lineData = dropFirstPoint ? data.slice(1) : data
                      console.info({ timestamps: chart.timestamps, lineData })
                      return (
                        <ChartContainer key={i}>
                          <ChartHeader
                            title={chart.name}
                            label=""
                            description={chart.description}
                          />
                          <TimeSeriesChart
                            data={[lineData]}
                            timestamps={chart.timestamps}
                            title={query.data?.tables[0].name || ''}
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
                  .exhaustive()
              )}
          </>
        ))
        .exhaustive()}
    </>
  )
}
