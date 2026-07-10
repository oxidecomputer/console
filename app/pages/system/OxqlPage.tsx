/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useLayoutEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import * as R from 'remeda'
import { match } from 'ts-pattern'

import {
  api,
  useApiMutation,
  // type Timeseries,
  type OxqlTable,
  type Points,
  type ChartDatum,
  type TimeseriesQuery,
  type Values,
  type OxqlQueryResult,
} from '@oxide/api'
import { Monitoring16Icon, Monitoring24Icon } from '@oxide/design-system/icons/react'

import { ChartContainer, ChartHeader, TimeSeriesChart } from '~/components/CoolChart'
import { DocsPopover } from '~/components/DocsPopover'
import { DescriptionField } from '~/components/form/fields/DescriptionField'
import { UplotChart } from '~/components/UplotChart'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { docLinks } from '~/util/links'

const queries = {
  tctl: `get hardware_component:amd_cpu_tctl
    | filter timestamp > @now() - 1m `,
  multiJoinedTable: `{
    { get sled_data_link:bytes_sent; get sled_data_link:bytes_received }
        | align mean_within(20s)
        | join;
    { get sled_data_link:errors_sent; get sled_data_link:errors_received }
        | align mean_within(20s)
        | join
}
    | filter timestamp > @now() - 1m`,
  maybeRobertsQuery: `{
  get sled_data_link:bytes_sent | align mean_within(20s) | group_by [sled_serial, link_name];
  get sled_data_link:bytes_received | align mean_within(20s) | group_by [sled_serial, link_name]
}
    | filter timestamp > @now() - 10m
    | filter link_name == 'oxControlService22'
    | align mean_within(20s)`
}

const defaultValues: TimeseriesQuery = {
  query: queries.maybeRobertsQuery,
}

export const handle = { crumb: 'OxQL Explorer' }

type MultiChartStuff = {
  data: NonEmptyArray<ChartDatum[]>
  name: string
  startTime: Date
  endTime: Date
}

const valuesToChartData = (posixes: number[], v: Values): ChartDatum[] => {
  const valueArray = v.values
  const values: (number | null)[] = // TODO joe: learn why can these be null
    match(valueArray)
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
      .with({ type: 'string' }, () => []) // i think this would simply have to be a table!
      .with({ type: 'integer_distribution' }, () => []) // these are a little more interesting... i'll need to see a real example
      .with({ type: 'double_distribution' }, () => [])
      .exhaustive()

  return R.zip(posixes, values).map(([t, v]) => ({
    timestamp: t,
    value: v,
  }))
}

const pointsToChartData = (points: Points): ChartDatum[][] | null => {
  const posixes = points.timestamps.map((t) => new Date(t).getTime())

  if (points.values.length === 0) return null // i don't think this is in practice reachable

  return points.values.map((v) => valuesToChartData(posixes, v))
}

type BunchOfCharts = {
  charts: MultiChartStuff[]
  name: string
}

type ChartAndJoinedField = {
  joinedField: string
  chartData: ChartDatum[][]
}

const getSomeCharts = (table: OxqlTable): BunchOfCharts | null => {
  const chartDataByTimeSeries: ChartAndJoinedField[] = table.timeseries
    .map((t) => {
      const chartData = pointsToChartData(t.points)
      return (
        chartData && {
          joinedField: Object.values(t.fields)
            .map((x) => String(x.value))
            .join('//'),
          chartData,
        }
      )
    })
    .filter((c) => c !== null) // TODO joe: lazy?

  const joinHeight = R.firstBy(chartDataByTimeSeries, (c) => c.chartData.length)?.chartData
    .length
  console.info({ joinHeight })
  if (!joinHeight) return null

  const mode: 'joined' | 'unjoined' = joinHeight > 1 ? 'joined' : 'unjoined'

  const charts: ChartAndJoinedField[] = match(mode)
    .with('joined', () => chartDataByTimeSeries)
    // .with('unjoined', () => chartDataByTimeSeries) // leave it be
    // .with('unjoined', () => { // transpose (fun! but... is it useful?)
    //   const justData = chartDataByTimeSeries.map(({ chartData }) => chartData)
    //   return justData[0].map((_, i) => ({
    //     joinedField: table.name,
    //     chartData: justData.map((row) => row[i]),
    //   }))
    // })
    .with('unjoined', () => { // collapse all into a single chart
      const justData = chartDataByTimeSeries.flatMap(({ chartData }) => chartData)
      return [({
        joinedField: '',
        chartData: justData
      })]
    })
    .exhaustive()

  return {
    name: table.name,
    charts: charts.map((lines) => {
      const timestamps = lines.chartData.flatMap((line) =>
        line.map(({ timestamp }) => timestamp)
      )
      const startTime = Math.min(...timestamps)
      const endTime = Math.max(...timestamps)
      return {
        data: lines.chartData as unknown as NonEmptyArray<ChartDatum[]>,
        name: lines.joinedField,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
      }
    }),
  }
}

type Renderer = 'recharts' | 'uplot'
const RENDERERS: readonly Renderer[] = ['recharts', 'uplot']

export default function OxqlPage() {
  const query = useApiMutation(api.systemTimeseriesQuery, {
    onSuccess(queryResult: OxqlQueryResult) {
      console.info({ queryResult })
    },
  })

  const form = useForm({ defaultValues })
  const control = form.control

  const [renderer, setRenderer] = useState<Renderer>('uplot')
  const [elapsedMs, setElapsedMs] = useState<number | null>(null)
  // Set from an event handler; useLayoutEffect below measures until paint.
  const timerStart = useRef<number | null>(null)

  const onSubmit = (body: TimeseriesQuery) => {
    timerStart.current = performance.now()
    query.mutate({ body })
  }

  const stuff: (BunchOfCharts | null)[] | null = query.data
    ? query.data.tables.map(getSomeCharts)
    : null

  console.info(stuff)
  console.info(query)

  useLayoutEffect(() => {
    if (timerStart.current === null || !stuff) return
    const start = timerStart.current
    timerStart.current = null
    const rafId = requestAnimationFrame(() => {
      setElapsedMs(performance.now() - start)
    })
    return () => cancelAnimationFrame(rafId)
  }, [renderer, stuff])

  const toggleRenderer = (next: Renderer) => {
    if (next === renderer) return
    timerStart.current = performance.now()
    setRenderer(next)
  }

  // const pointCount = stuff ? stuff.data.reduce((sum, s) => sum + s.length, 0) : 0

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
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <DescriptionField name="query" required control={control} />
        <input type="submit" />
      </form>

      {match(query)
        .with({ status: 'pending' }, () => 'Loading...')
        .with({ status: 'idle' }, () => '')
        .with({ status: 'error' }, (q) => q.error.message)
        .with({ status: 'success' }, () => (
        <>
          <div className="text-sans-md mt-4 mb-2 flex items-center gap-3">
            <div className="border-default inline-flex overflow-hidden rounded border">
              {RENDERERS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => toggleRenderer(r)}
                  className={
                    'px-3 py-1 ' +
                    (renderer === r ? 'bg-accent-secondary text-accent' : 'text-secondary')
                  }
                >
                  {r}
                </button>
              ))}
            </div>
            <div className="text-secondary">
              {/*{stuff.data.length} series · {pointCount.toLocaleString()} points*/}
              {elapsedMs !== null && (
                <span className="text-raise ml-2 tabular-nums">
                  {elapsedMs.toFixed(1)} ms to paint
                </span>
              )}
            </div>
          </div>
          {stuff && stuff.map(s => s && ( // stuff can't be null now but i don't think i should calculate stuff within this block
            <>
            <h2>{s.name}</h2>
            {s.charts.map((chart, i) => (
            <ChartContainer key={i}>
              <ChartHeader
                title="Tada!"
                label={`${renderer} | ${chart.name}`}

                // description={`${stuff.data.length} series, ${pointCount.toLocaleString()} points`}
              />
              {renderer === 'recharts' ? (
                <TimeSeriesChart
                  data={chart.data}
                  title={query.data?.tables[0].name || ''}
                  interpolation="linear"
                  startTime={chart.startTime}
                  endTime={chart.endTime}
                  unit={undefined}
                  loading={false}
                />
              ) : (
                <div className="px-5 pt-8 pb-5">
                  <UplotChart data={chart.data} title={query.data?.tables[0].name || ''} />
                </div>
              )}
            </ChartContainer>
          ))}
            </>
          ))}
        </>
      )).exhaustive()}
    </>
  )
}
