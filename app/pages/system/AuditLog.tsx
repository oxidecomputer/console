/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { getLocalTimeZone, now } from '@internationalized/date'
import { useInfiniteQuery, useIsFetching } from '@tanstack/react-query'
import { useVirtualizer } from '@tanstack/react-virtual'
import cn from 'classnames'
import { differenceInMilliseconds } from 'date-fns'
import { useMemo, useRef } from 'react'

import { api } from '@oxide/api'
import { Logs16Icon, Logs24Icon } from '@oxide/design-system/icons/react'

import { DocsPopover } from '~/components/DocsPopover'
import { useDateTimeRangePicker } from '~/components/form/fields/DateTimeRangePicker'
import { useIntervalPicker } from '~/components/RefetchIntervalPicker'
import { Badge } from '~/ui/lib/Badge'
import { Button } from '~/ui/lib/Button'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { Spinner } from '~/ui/lib/Spinner'
import { classed } from '~/util/classed'
import { toSyslogDateString, toSyslogTimeString } from '~/util/date'
import { docLinks } from '~/util/links'

export const handle = { crumb: 'Audit Log' }

// todo
// might want to still render the items in case of error
const ErrorState = () => {
  return <div>Error State</div>
}

// todo
const LoadingState = () => {
  return <div>Loading State</div>
}

const HeaderCell = classed.div`text-mono-sm text-tertiary`

// for virtualizer
const estimateSize = () => 36

export default function SiloAuditLogsPage() {
  // pass refetch interval to this to keep the date up to date
  const { preset, startTime, endTime, dateTimeRangePicker, onRangeChange } =
    useDateTimeRangePicker({
      initialPreset: 'lastHour',
      maxValue: now(getLocalTimeZone()),
    })

  const { intervalPicker } = useIntervalPicker({
    enabled: preset !== 'custom',
    isLoading: useIsFetching({ queryKey: ['auditLogList'] }) > 0,
    // sliding the range forward is sufficient to trigger a refetch
    fn: () => onRangeChange(preset),
  })

  const queryParams = {
    startTime,
    endTime,
    limit: 500,
  }

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isPending,
    isFetching,
    error,
  } = useInfiniteQuery({
    queryKey: ['auditLogList', { query: queryParams }],
    queryFn: ({ pageParam }) =>
      api.methods
        .auditLogList({ query: { ...queryParams, pageToken: pageParam } })
        .then((result) => {
          if (result.type === 'success') return result.data
          throw result
        }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextPage || undefined,
    placeholderData: (x) => x,
  })

  const auditLogs = useMemo(() => {
    return data?.pages.flatMap((page) => page.items) || []
  }, [data])

  const parentRef = useRef<HTMLDivElement>(null)

  const rowVirtualizer = useVirtualizer({
    count: auditLogs.length,
    getScrollElement: () => document.querySelector('#scroll-container'),
    estimateSize,
    overscan: 20,
  })

  const logTable = (
    <>
      <div
        className="relative w-full"
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const log = auditLogs[virtualRow.index]

          return (
            <div
              key={virtualRow.index}
              className="absolute left-0 right-0 top-0 w-full"
              style={{
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <div
                className={cn(
                  'grid h-9 w-full items-center gap-8 px-[var(--content-gutter)] text-left text-sans-md border-secondary',
                  virtualRow.index !== 0 && 'border-t'
                )}
                style={{
                  gridTemplateColumns: '7rem 4.25rem 180px 120px 120px 120px 300px 300px',
                }}
              >
                <div className="overflow-hidden whitespace-nowrap text-mono-sm">
                  <span className="text-tertiary">
                    {toSyslogDateString(log.timeCompleted)}
                  </span>{' '}
                  {toSyslogTimeString(log.timeCompleted)}
                </div>
                <div className="flex gap-1 overflow-hidden whitespace-nowrap">
                  <span className="text-mono-sm text-tertiary">POST</span>
                  <Badge>200</Badge>
                </div>
                <div>
                  <Badge color="neutral" className="text-tertiary">
                    {log.operationId.split('_').join(' ')}
                  </Badge>
                </div>
                <div className="text-secondary">hannah.arendt</div>
                <div>
                  {!!log.accessMethod && (
                    <Badge color="neutral" className="text-tertiary">
                      {log.accessMethod.split('_').join(' ')}
                    </Badge>
                  )}
                </div>
                <div className="text-secondary">maze-war</div>
                <div className="text-secondary">
                  {differenceInMilliseconds(new Date(log.timeCompleted), log.timeStarted)}
                  ms
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <div className="flex justify-center border-t px-[var(--content-gutter)] py-4 border-secondary">
        {!hasNextPage && !isFetching && !isPending && auditLogs.length > 0 ? (
          <div className="text-mono-sm text-quaternary">
            No more logs to show within selected timeline
          </div>
        ) : (
          <Button
            variant="ghost"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="text-mono-sm text-quaternary"
            type="button"
          >
            <div className="flex items-center gap-2">
              {isFetchingNextPage && <Spinner variant="secondary" />} Load More
            </div>
          </Button>
        )}
      </div>
    </>
  )

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Logs24Icon />}>Audit Log</PageTitle>
        <DocsPopover
          heading="audit log"
          icon={<Logs16Icon />}
          summary="The audit log provides a record of system activities, including user actions, API calls, and system events."
          links={[docLinks.auditLogs]}
        />
      </PageHeader>

      <div className="!mx-0 mb-3 mt-8 flex !w-full flex-wrap justify-between gap-3 border-b px-[var(--content-gutter)] pb-4 border-secondary">
        <div className="flex gap-2">{intervalPicker}</div>
        <div className="flex items-center gap-2">{dateTimeRangePicker}</div>
      </div>

      <div
        className="sticky top-0 z-10 !mx-0 grid !w-full items-center gap-8 border-b px-[var(--content-gutter)] pb-2 pt-4 bg-default border-secondary"
        style={{
          gridTemplateColumns: '7rem 4.25rem 180px 120px 120px 120px 300px 300px',
        }}
      >
        <HeaderCell>Time</HeaderCell>
        <HeaderCell>Status</HeaderCell>
        <HeaderCell>Operation</HeaderCell>
        <HeaderCell>Actor</HeaderCell>
        <HeaderCell>Access Method</HeaderCell>
        <HeaderCell>Silo</HeaderCell>
        <HeaderCell>Duration</HeaderCell>
      </div>

      <div className="!mx-0 flex h-full !w-full flex-col">
        <div className="w-full flex-1" ref={parentRef}>
          {error ? <ErrorState /> : !isLoading ? logTable : <LoadingState />}
        </div>
      </div>
    </>
  )
}
