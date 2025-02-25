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

import {
  Children,
  lazy,
  Suspense,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import { useApiQuery } from '@oxide/api'

import { CopyCodeModal } from '~/components/CopyCode'
import { MoreActionsMenu } from '~/components/MoreActionsMenu'
import { useMetricsContext } from '~/pages/project/instances/instance/tabs/MetricsTab'
import { LearnMore } from '~/ui/lib/SettingsGroup'
import { classed } from '~/util/classed'
import { links } from '~/util/links'

import { HighlightedOxqlQuery, toOxqlStr } from './HighlightedOxqlQuery'
import {
  composeOxqlData,
  getBytesChartProps,
  getCountChartProps,
  getUnit,
  getUtilizationChartProps,
  type OxqlQuery,
} from './util'

const TimeSeriesChart = lazy(() => import('~/components/TimeSeriesChart'))

export type OxqlMetricProps = OxqlQuery & {
  title: string
  description?: string
}

export function OxqlMetric({ title, description, ...queryObj }: OxqlMetricProps) {
  // only start reloading data once an intial dataset has been loaded
  const { setIsIntervalPickerEnabled } = useMetricsContext()
  const query = toOxqlStr(queryObj)
  const { data: metrics, error } = useApiQuery(
    'systemTimeseriesQuery',
    { body: { query } },
    // avoid graphs flashing blank while loading when you change the time
    { placeholderData: (x) => x }
  )
  useEffect(() => {
    if (metrics) {
      // this is too slow right now; disabling until we can make it faster
      // setIsIntervalPickerEnabled(true)
    }
  }, [metrics, setIsIntervalPickerEnabled])
  const { startTime, endTime } = queryObj
  const { chartData, timeseriesCount } = useMemo(() => composeOxqlData(metrics), [metrics])
  const unit = getUnit(title)
  const { data, label, unitForSet, yAxisTickFormatter } = useMemo(() => {
    if (unit === 'Bytes') return getBytesChartProps(chartData)
    if (unit === 'Count') return getCountChartProps(chartData)
    return getUtilizationChartProps(chartData, timeseriesCount)
  }, [unit, chartData, timeseriesCount])

  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div className="flex w-full grow flex-col rounded-lg border border-default">
      <div className="flex items-center justify-between border-b px-6 py-5 border-secondary">
        <div>
          <h2 className="flex items-baseline gap-1.5">
            <div className="text-sans-semi-lg">{title}</div>
            <div className="text-sans-md text-secondary">{label}</div>
          </h2>
          <div className="mt-0.5 text-sans-md text-secondary">{description}</div>
        </div>
        <MoreActionsMenu
          label="Instance actions"
          actions={[
            {
              label: 'About this metric',
              onActivate: () => {
                const url = links.oxqlSchemaDocs(queryObj.metricName)
                window.open(url, '_blank', 'noopener,noreferrer')
              },
            },
            {
              label: 'View OxQL query',
              onActivate: () => setModalOpen(true),
            },
          ]}
          isSmall
        />
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
      <div className="px-6 py-5 pt-8">
        <Suspense fallback={<div className="h-[300px]" />}>
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
        </Suspense>
      </div>
    </div>
  )
}

export const MetricHeader = ({ children }: { children: ReactNode }) => {
  // If header has only one child, align it to the end of the container
  const justify = Children.count(children) === 1 ? 'justify-end' : 'justify-between'
  return (
    <div className={`flex flex-col gap-2 ${justify} mt-8 @[48rem]:flex-row`}>
      {children}
    </div>
  )
}
export const MetricCollection = classed.div`mt-4 flex flex-col gap-4`

export const MetricRow = classed.div`flex w-full flex-col gap-4 @[48rem]:flex-row`
