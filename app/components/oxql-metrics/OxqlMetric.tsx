/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

/*
 * OxQL Metrics Schema:
 * https://github.com/oxidecomputer/omicron/tree/main/oximeter/oximeter/schema
 */

import { useQuery } from '@tanstack/react-query'
import { Children, useMemo, useState, type ReactNode } from 'react'
import type { LoaderFunctionArgs } from 'react-router'

import { apiq, OXQL_GROUP_BY_ERROR, queryClient } from '@oxide/api'

import { CopyCodeModal } from '~/components/CopyCode'
import { MoreActionsMenu } from '~/components/MoreActionsMenu'
import { getInstanceSelector, useProjectSelector } from '~/hooks/use-params'
import { LearnMore } from '~/ui/lib/CardBlock'
import * as Dropdown from '~/ui/lib/DropdownMenu'
import { classed } from '~/util/classed'
import { links } from '~/util/links'

import { ChartContainer, ChartHeader, TimeSeriesChart } from '../TimeSeriesChart'
import { HighlightedOxqlQuery, toOxqlStr } from './HighlightedOxqlQuery'
import {
  composeOxqlData,
  getBytesChartProps,
  getCountChartProps,
  getUtilizationChartProps,
  type OxqlQuery,
} from './util'

export async function loader({ params }: LoaderFunctionArgs) {
  const { project, instance } = getInstanceSelector(params)
  await queryClient.prefetchQuery(
    apiq('instanceView', { path: { instance }, query: { project } })
  )
  return null
}

export type OxqlMetricProps = OxqlQuery & {
  title: string
  description?: string
  unit: 'Bytes' | '%' | 'Count'
}

export function OxqlMetric({ title, description, unit, ...queryObj }: OxqlMetricProps) {
  const query = toOxqlStr(queryObj)
  const { project } = useProjectSelector()
  const {
    data: metrics,
    error,
    isLoading,
  } = useQuery(
    apiq('timeseriesQuery', { body: { query }, query: { project } })
    // avoid graphs flashing blank while loading when you change the time
    // { placeholderData: (x) => x }
  )

  // HACK: omicron has a bug where it blows up on an attempt to group by on
  // empty result set because it can't determine whether the data is aligned.
  // Most likely it should consider empty data sets trivially aligned and just
  // flow the emptiness on through, but in the meantime we have to detect
  // this error and pretend it is not an error.
  // See https://github.com/oxidecomputer/omicron/issues/7715
  const errorMeansEmpty = error?.message === OXQL_GROUP_BY_ERROR
  const hasError = !!error && !errorMeansEmpty

  const { startTime, endTime } = queryObj
  const { chartData, timeseriesCount } = useMemo(
    () =>
      errorMeansEmpty ? { chartData: [], timeseriesCount: 0 } : composeOxqlData(metrics),
    [metrics, errorMeansEmpty]
  )

  const { data, label, unitForSet, yAxisTickFormatter } = useMemo(() => {
    if (unit === 'Bytes') return getBytesChartProps(chartData)
    if (unit === 'Count') return getCountChartProps(chartData)
    return getUtilizationChartProps(chartData, timeseriesCount)
  }, [unit, chartData, timeseriesCount])

  const [modalOpen, setModalOpen] = useState(false)

  return (
    <ChartContainer>
      <ChartHeader title={title} label={label} description={description}>
        <MoreActionsMenu label="Instance actions" isSmall>
          <Dropdown.LinkItem to={links.oxqlSchemaDocs(queryObj.metricName)}>
            About this metric
          </Dropdown.LinkItem>
          <Dropdown.Item onSelect={() => setModalOpen(true)} label="View OxQL query" />
        </MoreActionsMenu>
        <CopyCodeModal
          isOpen={modalOpen}
          onDismiss={() => setModalOpen(false)}
          code={query}
          copyButtonText="Copy query"
          modalTitle="OxQL query"
          footer={<LearnMore href={links.oxqlDocs} text="OxQL" />}
        >
          <HighlightedOxqlQuery {...queryObj} />
        </CopyCodeModal>
      </ChartHeader>
      <TimeSeriesChart
        title={title}
        startTime={startTime}
        endTime={endTime}
        unit={unitForSet}
        data={data}
        yAxisTickFormatter={yAxisTickFormatter}
        hasError={hasError}
        // isLoading only covers first load --- future-proof against the reintroduction of interval refresh
        loading={isLoading}
      />
    </ChartContainer>
  )
}

export const MetricHeader = ({ children }: { children: ReactNode }) => {
  // If header has only one child, align it to the end of the container
  const justify = Children.count(children) === 1 ? 'justify-end' : 'justify-between'
  return <div className={`flex flex-wrap gap-2 ${justify}`}>{children}</div>
}
export const MetricCollection = classed.div`mt-3 flex flex-col gap-4`

export const MetricRow = classed.div`flex w-full flex-col gap-4 @[48rem]:flex-row`
