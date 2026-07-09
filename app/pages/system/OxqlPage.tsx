/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
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

export default function OxqlPage() {
  const query = useApiMutation(api.systemTimeseriesQuery, {
    onSuccess(queryResult: OxqlQueryResult) {
      console.info({ queryResult })
    },
  })

  const onSubmit = (body: TimeseriesQuery) => query.mutate({ body })

  const form = useForm({ defaultValues })
  const control = form.control

  const stuff: MultiChartStuff | null = query.data
    ? arrange(query.data.tables[0].timeseries)
    : null

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

      {/*<pre className="text-xs">{JSON.stringify(runQuery.data, null, 2)}</pre>*/}
      {stuff && (
        <ChartContainer>
          <ChartHeader title="Tada!" label="some numbers." />
          <TimeSeriesChart
            data={stuff.data}
            title={query.data?.tables[0].name || ''}
            interpolation="linear"
            startTime={stuff.startTime}
            endTime={stuff.endTime}
            unit={undefined /* TODO joe: something real */}
            // note use of loading, not fetching, which is only true on first fetch.
            // otherwise we get loading states on refetches
            loading={false}
          />
        </ChartContainer>
      )}
    </>
  )
}
