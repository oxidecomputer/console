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

import {
  api,
  useApiMutation,
  type Timeseries,
  type Points,
  type ChartDatum,
  type TimeseriesQuery,
  type OxqlQueryResult,
} from '@oxide/api'
import { Monitoring16Icon, Monitoring24Icon } from '@oxide/design-system/icons/react'

import { ChartContainer, ChartHeader, TimeSeriesChart } from '~/components/CoolChart'
import { DocsPopover } from '~/components/DocsPopover'
import { DescriptionField } from '~/components/form/fields/DescriptionField'
import { UplotChart } from '~/components/UplotChart'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { docLinks } from '~/util/links'

const defaultValues: TimeseriesQuery = {
  query: `get hardware_component:amd_cpu_tctl
    | filter timestamp > @now() - 1m `,
}

export const handle = { crumb: 'OxQL Explorer' }

type ChartStuff = {
  data: ChartDatum[]
  startTime: number
  endTime: number
}

type MultiChartStuff = {
  data: NonEmptyArray<ChartDatum[]>
  startTime: Date
  endTime: Date
}

const pointsToStuff = (points: Points): ChartStuff | null => {
  const data = R.zip(points.timestamps, points.values[0].values.values).map(([t, v]) => ({
    timestamp: new Date(t).getTime(),
    value: v as number, // ?
  }))

  const startTime = R.firstBy(data, ({ timestamp }) => timestamp)
  const endTime = R.firstBy(data, ({ timestamp }) => -timestamp)

  if (!startTime || !endTime) return null

  return {
    data,
    startTime: startTime.timestamp,
    endTime: endTime.timestamp,
  }
}

const arrange = (timeseries: Timeseries[]): MultiChartStuff | null => {
  const stuffs: ChartStuff[] = timeseries
    .map(({ points }) => pointsToStuff(points))
    // TODO joe: lazy?
    .filter((x) => x !== null)

  if (stuffs.length === 0) return null
  const [first, ...rest] = stuffs

  const startTime = R.firstBy(stuffs, ({ startTime }) => startTime)?.startTime
  const endTime = R.firstBy(stuffs, ({ endTime }) => -endTime)?.endTime

  if (!startTime || !endTime) return null

  return {
    data: [first.data, ...rest.map(({ data }) => data)],
    startTime: new Date(startTime),
    endTime: new Date(endTime),
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

  const [renderer, setRenderer] = useState<Renderer>('recharts')
  const [elapsedMs, setElapsedMs] = useState<number | null>(null)
  // Set from an event handler; useLayoutEffect below measures until paint.
  const timerStart = useRef<number | null>(null)

  const onSubmit = (body: TimeseriesQuery) => {
    timerStart.current = performance.now()
    query.mutate({ body })
  }

  const stuff: MultiChartStuff | null = query.data
    ? arrange(query.data.tables[0].timeseries)
    : null

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

  const pointCount = stuff ? stuff.data.reduce((sum, s) => sum + s.length, 0) : 0

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

      {stuff && (
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
              {stuff.data.length} series · {pointCount.toLocaleString()} points
              {elapsedMs !== null && (
                <span className="text-raise ml-2 tabular-nums">
                  {elapsedMs.toFixed(1)} ms to paint
                </span>
              )}
            </div>
          </div>
          <ChartContainer>
            <ChartHeader
              title="Tada!"
              label={renderer}
              description={`${stuff.data.length} series, ${pointCount.toLocaleString()} points`}
            />
            {renderer === 'recharts' ? (
              <TimeSeriesChart
                data={stuff.data}
                title={query.data?.tables[0].name || ''}
                interpolation="linear"
                startTime={stuff.startTime}
                endTime={stuff.endTime}
                unit={undefined}
                loading={false}
              />
            ) : (
              <div className="px-5 pt-8 pb-5">
                <UplotChart data={stuff.data} title={query.data?.tables[0].name || ''} />
              </div>
            )}
          </ChartContainer>
        </>
      )}
    </>
  )
}
