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

import { Children, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { LoaderFunctionArgs } from 'react-router'

import { apiQueryClient, useApiQuery } from '@oxide/api'

import { CopyCodeModal } from '~/components/CopyCode'
import { MoreActionsMenu } from '~/components/MoreActionsMenu'
import { getInstanceSelector } from '~/hooks/use-params'
import { useMetricsContext } from '~/pages/project/instances/common'
import { LearnMore } from '~/ui/lib/CardBlock'
import * as Dropdown from '~/ui/lib/DropdownMenu'
import { classed } from '~/util/classed'
import { links } from '~/util/links'

import { TimeSeriesChart } from '../TimeSeriesChart'
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
  await apiQueryClient.prefetchQuery('instanceView', {
    path: { instance },
    query: { project },
  })
  return null
}

export type OxqlMetricProps = OxqlQuery & {
  title: string
  description?: string
  unit: 'Bytes' | '%' | 'Count'
}

export function OxqlMetric({ title, description, unit, ...queryObj }: OxqlMetricProps) {
  // only start reloading data once an intial dataset has been loaded
  const { setIsIntervalPickerEnabled } = useMetricsContext()
  const query = toOxqlStr(queryObj)
  const { data: metrics, error } = useApiQuery(
    'systemTimeseriesQuery',
    { body: { query } }
    // avoid graphs flashing blank while loading when you change the time
    // { placeholderData: (x) => x }
  )
  useEffect(() => {
    if (metrics) {
      // this is too slow right now; disabling until we can make it faster
      // setIsIntervalPickerEnabled(true)
    }
  }, [metrics, setIsIntervalPickerEnabled])
  const { startTime, endTime } = queryObj
  const { chartData, timeseriesCount } = useMemo(() => composeOxqlData(metrics), [metrics])
  const { data, label, unitForSet, yAxisTickFormatter } = useMemo(() => {
    if (unit === 'Bytes') return getBytesChartProps(chartData)
    if (unit === 'Count') return getCountChartProps(chartData)
    return getUtilizationChartProps(chartData, timeseriesCount)
  }, [unit, chartData, timeseriesCount])

  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div className="flex w-full grow flex-col rounded-lg border border-default">
      <div className="flex items-center justify-between border-b px-5 pb-4 pt-5 border-secondary">
        <div>
          <h2 className="flex items-baseline gap-1.5">
            <div className="text-sans-semi-lg">{title}</div>
            <div className="text-sans-md text-secondary">{label}</div>
          </h2>
          <div className="mt-0.5 text-sans-md text-secondary">{description}</div>
        </div>
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
      </div>
      <div className="px-5 pb-5 pt-8">
        <TimeSeriesChart
          title={title}
          startTime={startTime}
          endTime={endTime}
          unit={unitForSet}
          data={data}
          yAxisTickFormatter={yAxisTickFormatter}
          width={480}
          height={240}
          hasBorder={false}
          hasError={!!error}
        />
      </div>
    </div>
  )
}

export const MetricHeader = ({ children }: { children: ReactNode }) => {
  // If header has only one child, align it to the end of the container
  const justify = Children.count(children) === 1 ? 'justify-end' : 'justify-between'
  return <div className={`flex flex-wrap gap-2 ${justify}`}>{children}</div>
}
export const MetricCollection = classed.div`mt-3 flex flex-col gap-4`

export const MetricRow = classed.div`flex w-full flex-col gap-4 @[48rem]:flex-row`
