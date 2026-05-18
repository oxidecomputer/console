/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { getLocalTimeZone, now } from '@internationalized/date'
import { useInfiniteQuery, useIsFetching } from '@tanstack/react-query'
import { useWindowVirtualizer } from '@tanstack/react-virtual'
import cn from 'classnames'
import { differenceInMilliseconds } from 'date-fns'
import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { match, P } from 'ts-pattern'
import { type JsonValue } from 'type-fest'

import { api, type AuditLogEntry, type AuditLogListQueryParams } from '@oxide/api'
import {
  Close12Icon,
  Error12Icon,
  Logs16Icon,
  Logs24Icon,
  NextArrow12Icon,
  PrevArrow12Icon,
} from '@oxide/design-system/icons/react'
import { Badge } from '@oxide/design-system/ui'

import { DocsPopover } from '~/components/DocsPopover'
import { useDateTimeRangePicker } from '~/components/form/fields/DateTimeRangePicker'
import { useIntervalPicker } from '~/components/RefetchIntervalPicker'
import { EmptyCell } from '~/table/cells/EmptyCell'
import { Button } from '~/ui/lib/Button'
import { CopyToClipboard } from '~/ui/lib/CopyToClipboard'
import { Divider } from '~/ui/lib/Divider'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { PropertiesTable } from '~/ui/lib/PropertiesTable'
import { Spinner } from '~/ui/lib/Spinner'
import { Truncate } from '~/ui/lib/Truncate'
import { classed } from '~/util/classed'
import { toLocaleDateString, toSyslogDateString, toSyslogTimeString } from '~/util/date'
import { docLinks } from '~/util/links'
import { deterRandom } from '~/util/math'

export const handle = { crumb: 'Audit Log' }

/**
 * Convert API response JSON from the camel-cased version we get out of the TS
 * client back into snake-case, which is what we get from the API. This is truly
 * stupid but I can't think of a better way.
 */
function camelToSnakeJson(o: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {}

  if (o instanceof Date) return o

  for (const originalKey in o) {
    if (!Object.prototype.hasOwnProperty.call(o, originalKey)) {
      continue
    }

    const snakeKey = originalKey
      .replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
      .replace(/^_/, '')
    const value = o[originalKey]

    if (value !== null && typeof value === 'object') {
      if (Array.isArray(value)) {
        result[snakeKey] = value.map((item) =>
          item !== null && typeof item === 'object' && !Array.isArray(item)
            ? camelToSnakeJson(item as Record<string, unknown>)
            : item
        )
      } else {
        result[snakeKey] = camelToSnakeJson(value as Record<string, unknown>)
      }
    } else {
      result[snakeKey] = value
    }
  }

  return result
}

const Indent = ({ depth }: { depth: number }) => (
  <span className="inline-block" style={{ width: `${depth * 4 + 1}ch` }} />
)

const Primitive = ({ value }: { value: null | boolean | number | string | Date }) => (
  <span className="text-[var(--base-blue-600)]">
    {value === null
      ? 'null'
      : typeof value === 'string'
        ? `"${value}"`
        : value instanceof Date
          ? `"${value.toISOString()}"`
          : String(value)}
  </span>
)

// memo is important to avoid re-renders if the value hasn't changed. value
// passed in must be referentially stable, which should generally be the case
// with API responses
const HighlightJSON = memo(({ json, depth = 0 }: { json: JsonValue; depth?: number }) => {
  if (json === undefined) return null

  if (
    json === null ||
    typeof json === 'boolean' ||
    typeof json === 'number' ||
    typeof json === 'string' ||
    // special case. the types don't currently reflect that this is possible.
    // dates have type object so you can't use typeof
    json instanceof Date
  ) {
    return <Primitive value={json} />
  }

  if (Array.isArray(json)) {
    if (json.length === 0) return <span className="text-quaternary">[]</span>

    return (
      <>
        <span className="text-quaternary">[</span>
        {'\n'}
        {json.map((item, index) => (
          <span key={index}>
            <Indent depth={depth + 1} />
            <HighlightJSON json={item} depth={depth + 1} />
            {index < json.length - 1 && <span className="text-quaternary">,</span>}
            {'\n'}
          </span>
        ))}
        <Indent depth={depth} />
        <span className="text-quaternary">]</span>
      </>
    )
  }

  const entries = Object.entries(json)
  if (entries.length === 0) return <span className="text-quaternary">{'{}'}</span>

  return (
    <>
      <span className="text-quaternary">{'{'}</span>
      {'\n'}
      {entries.map(([key, val], index) => (
        <span key={key}>
          <Indent depth={depth + 1} />
          <span className="text-default">{key}</span>
          <span className="text-quaternary">: </span>
          <HighlightJSON json={val} depth={depth + 1} />
          {index < entries.length - 1 && <span className="text-quaternary">,</span>}
          {'\n'}
        </span>
      ))}
      <Indent depth={depth} />
      <span className="text-quaternary">{'}'}</span>
    </>
  )
})

const ErrorState = ({ error, onDismiss }: { error: string; onDismiss: () => void }) => {
  return (
    <div className="text-sans-md text-error bg-error-secondary flex h-10 items-center justify-between px-[var(--content-gutter)]">
      <div className="-ml-[18px] flex items-center gap-1.5">
        <Error12Icon className="flex-shrink-0" />
        {error}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="hover:bg-destructive-secondary-hover absolute right-2 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded"
        aria-label="Dismiss error"
      >
        <Close12Icon />
      </button>
    </div>
  )
}

const LoadingState = () => {
  return (
    <div className="border-secondary h-full w-full overflow-hidden border-t">
      {/* Generate skeleton rows */}
      <div className="w-full">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className={cn(
              'grid h-9 w-full animate-pulse items-center gap-8 px-[var(--content-gutter)] border-secondary',
              i !== 0 && 'border-t'
            )}
            style={{ ...colWidths, animationDelay: `${i * 0.1}s` }}
          >
            {/* Time column */}
            <div className="bg-tertiary h-4 rounded" style={{ width: '80%' }} />

            {/* Status column */}
            <div className="bg-tertiary h-4 rounded" style={{ width: '60%' }} />

            {/* Operation column */}
            <div
              className="bg-tertiary h-4 rounded"
              style={{
                width: `${deterRandom(i, 60, 10)}%`,
              }}
            />

            {/* Actor ID column */}
            <div
              className="bg-tertiary h-4 rounded"
              style={{
                width: `${deterRandom(i, 80, 10)}%`,
              }}
            />

            {/* Auth Method column */}
            <div
              className="bg-tertiary h-4 rounded"
              style={{
                width: `${deterRandom(i, 60, 20)}%`,
              }}
            />

            {/* Silo ID column */}
            <div
              className="bg-tertiary h-4 rounded"
              style={{
                width: `${deterRandom(i, 80, 10)}%`,
              }}
            />

            {/* Duration column */}
            <div
              className="bg-tertiary h-4 rounded"
              style={{
                width: `${deterRandom(i, 20, 5)}%`,
              }}
            />
          </div>
        ))}
      </div>

      {/* Gradient fade overlay */}
      <div
        className="pointer-events-none fixed bottom-0 h-32 w-full"
        style={{
          background: 'linear-gradient(180deg, rgba(8, 15, 17, 0) 0%, #080F11 100%)',
        }}
      />
    </div>
  )
}

function StatusCodeCell({ code }: { code: number }) {
  const color = code >= 200 && code < 500 ? 'default' : 'destructive'
  return <Badge color={color}>{code}</Badge>
}

const colWidths = {
  gridTemplateColumns: '7.75rem 3rem 160px 130px 120px 130px 1fr',
}

const HeaderCell = classed.div`text-mono-sm text-tertiary`

export default function SiloAuditLogsPage() {
  const [expandedItem, setExpandedItem] = useState<string | null>(null)
  const [dismissedError, setDismissedError] = useState(false)

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

  const queryParams: AuditLogListQueryParams = {
    startTime,
    endTime,
    sortBy: 'time_and_id_descending',
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
      api
        .auditLogList({ query: { ...queryParams, pageToken: pageParam } })
        .then((result) => {
          if (result.type === 'success') return result.data
          throw result
        }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextPage || undefined,
    placeholderData: (x) => x,
  })

  // resetting the error if the query params change
  useEffect(() => {
    setDismissedError(false)
  }, [startTime, endTime, preset])

  const allItems = useMemo(() => {
    return data?.pages.flatMap((page) => page.items) || []
  }, [data])

  const parentRef = useRef<HTMLDivElement>(null)
  // virtual rows are positioned by their offset from the top of the document, so
  // the virtualizer needs to know how far down the page the list starts
  const [scrollMargin, setScrollMargin] = useState(0)

  const rowVirtualizer = useWindowVirtualizer({
    count: allItems.length,
    estimateSize: () => 36,
    overscan: 40,
    scrollMargin,
  })

  const handleToggle = useCallback(
    (index: string | null) => {
      setExpandedItem(index)
      setTimeout(() => {
        rowVirtualizer.measure()
      }, 0)
    },
    [rowVirtualizer]
  )

  const navigateToIndex = useCallback(
    (newIndex: number) => {
      if (newIndex < 0 || newIndex >= allItems.length) return
      handleToggle(newIndex.toString())
    },
    [allItems.length, handleToggle]
  )

  const focusRow = useCallback((index: number) => {
    parentRef.current
      ?.querySelector<HTMLElement>(`[data-row-index="${index}"]`)
      ?.focus({ preventScroll: true })
  }, [])

  // arrow keys move selection (and focus) between rows; escape closes the
  // modal. adjacent rows are within the virtualizer's overscan, so they're
  // already in the DOM when we look them up.
  useEffect(() => {
    if (expandedItem === null) return
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      // don't hijack typing in inputs (e.g. the date pickers above the list)
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return

      const currentIdx = parseInt(expandedItem, 10)
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        const next = currentIdx + 1
        if (next < allItems.length) {
          navigateToIndex(next)
          focusRow(next)
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        const prev = currentIdx - 1
        if (prev >= 0) {
          navigateToIndex(prev)
          focusRow(prev)
        }
      } else if (e.key === 'Escape') {
        e.preventDefault()
        handleToggle(null)
        // restore focus to the row in case focus was inside the modal
        focusRow(currentIdx)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [expandedItem, allItems.length, handleToggle, navigateToIndex, focusRow])

  const logTable = (
    <>
      <div
        ref={parentRef}
        className="relative w-full"
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const log = allItems[virtualRow.index]
          const indexStr = virtualRow.index.toString()
          const isExpanded = expandedItem === indexStr

          const [userId, siloId] = match(log.actor)
            .with({ kind: 'silo_user' }, (actor) => [actor.siloUserId, actor.siloId])
            .with({ kind: 'user_builtin' }, (actor) => [actor.userBuiltinId, undefined])
            .with({ kind: 'scim' }, (actor) => [undefined, actor.siloId])
            .with({ kind: 'unauthenticated' }, () => [undefined, undefined])
            .exhaustive()

          return (
            <div
              key={virtualRow.index}
              className="absolute top-0 right-0 left-0 w-full"
              style={{
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start - rowVirtualizer.options.scrollMargin}px)`,
              }}
            >
              <div
                className={cn(
                  'grid h-9 w-full cursor-pointer items-center gap-8 border-t px-[var(--content-gutter)] text-left text-sans-md bg-default border-secondary',
                  isExpanded ? 'bg-raise' : 'hover:bg-raise'
                )}
                style={colWidths}
                onClick={() => {
                  handleToggle(indexStr)
                }}
                // TODO: some of the focusing behaviour and repetitive code needs work
                // a11y thing: make it focusable and let the user press enter on it to toggle
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleToggle(indexStr)
                  }
                }}
                role="button" // oxlint-disable-line prefer-tag-over-role
                tabIndex={0}
                data-row-index={virtualRow.index}
              >
                {/* TODO: might be especially useful here to get the original UTC timestamp in a tooltip */}
                <div className="text-mono-sm overflow-hidden whitespace-nowrap">
                  <span className="text-tertiary">
                    {toSyslogDateString(log.timeCompleted)}
                  </span>{' '}
                  {toSyslogTimeString(log.timeCompleted)}
                </div>
                <div className="flex gap-1 overflow-hidden whitespace-nowrap">
                  {match(log.result)
                    .with(P.union({ kind: 'success' }, { kind: 'error' }), (result) => (
                      <StatusCodeCell code={result.httpStatusCode} />
                    ))
                    .with({ kind: 'unknown' }, () => <EmptyCell />)
                    .exhaustive()}
                </div>
                <div>
                  <Badge color="neutral">{log.operationId.split('_').join(' ')}</Badge>
                </div>
                <div className="text-secondary">
                  {userId ? (
                    <Truncate
                      maxLength={12}
                      text={userId}
                      position="middle"
                      hasCopyButton
                    />
                  ) : (
                    <EmptyCell />
                  )}
                </div>
                <div>
                  {log.authMethod ? (
                    <Badge color="neutral">{log.authMethod.split('_').join(' ')}</Badge>
                  ) : (
                    <EmptyCell />
                  )}
                </div>
                <div className="text-secondary">
                  {siloId ? (
                    <Truncate
                      maxLength={12}
                      text={siloId}
                      position="middle"
                      hasCopyButton
                    />
                  ) : (
                    <EmptyCell />
                  )}
                </div>
                <div className="text-secondary">
                  {differenceInMilliseconds(new Date(log.timeCompleted), log.timeStarted)}
                  ms
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <div className="border-secondary flex justify-center border-t px-[var(--content-gutter)] py-4">
        {!hasNextPage && !isFetching && !isPending && allItems.length > 0 ? (
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
              {isFetchingNextPage && <Spinner variant="neutral" />} Load More
            </div>
          </Button>
        )}
      </div>
    </>
  )

  const selectedItem = expandedItem ? allItems[parseInt(expandedItem, 10)] : null

  const errorMessage = error?.message ?? 'An error occurred while loading audit logs'
  const showError = error && !dismissedError

  // measure the list's distance from the top of the document so the window
  // virtualizer can position items correctly. re-measure when the error banner
  // or loading state toggles, since those shift the list's position
  useLayoutEffect(() => {
    if (parentRef.current) {
      const rect = parentRef.current.getBoundingClientRect()
      setScrollMargin(rect.top + window.scrollY)
    }
  }, [showError, isLoading])

  // scroll just enough to bring the selected row into the band between the
  // sticky header bottom and the viewport midpoint. no-op when it's already
  // there. when we do scroll, always go at least to scrollMargin so the
  // sticky header is fully stuck and the expanded-item panel reaches its full
  // height.
  useEffect(() => {
    if (expandedItem === null) return
    const index = parseInt(expandedItem, 10)
    // top-bar (54px) + sticky table header (~40px)
    const stickyBottom = 54 + 40
    const itemTop = scrollMargin + index * 36
    const viewportTop = itemTop - window.scrollY
    // scroll just enough to fully stick the header (so the expanded-item panel
    // reaches its full height). this is the floor for any scroll we do.
    const minScroll = scrollMargin - stickyBottom
    let target = window.scrollY
    if (viewportTop < stickyBottom) {
      target = itemTop - stickyBottom
    } else if (viewportTop > window.innerHeight / 2) {
      target = itemTop - window.innerHeight / 2
    }
    target = Math.max(target, minScroll)
    if (target !== window.scrollY) window.scrollTo({ top: target })
  }, [expandedItem, scrollMargin])

  return (
    <>
      <div className="!mx-0 !w-full">
        <PageHeader className="gutter">
          <PageTitle icon={<Logs24Icon />}>Audit Log</PageTitle>
          <DocsPopover
            heading="audit log"
            icon={<Logs16Icon />}
            summary="The audit log provides a record of system activities, including user actions, API calls, and system events."
            links={[docLinks.auditLog]}
          />
        </PageHeader>

        <div className="border-secondary mt-8 flex flex-wrap justify-between gap-3 border-b px-[var(--content-gutter)] pb-4">
          {intervalPicker}
          <div className="flex items-center gap-2">{dateTimeRangePicker}</div>
        </div>
      </div>

      <div className="bg-default relative !mx-0 !w-full flex-grow overflow-x-clip pt-3">
        <div className="w-full flex-1">
          <div className="bg-default border-secondary sticky top-(--top-bar-height) z-10 -mb-px border-b px-(--content-gutter) pt-4 pb-2">
            <div style={colWidths} className="grid items-center gap-8">
              <HeaderCell>Time Completed</HeaderCell>
              <HeaderCell>Status</HeaderCell>
              <HeaderCell>Operation</HeaderCell>
              <HeaderCell>Actor ID</HeaderCell>
              <HeaderCell>Auth Method</HeaderCell>
              <HeaderCell>Silo ID</HeaderCell>
              <HeaderCell>Duration</HeaderCell>
            </div>
            {selectedItem &&
              (() => {
                const [userId, siloId] = match(selectedItem.actor)
                  .with({ kind: 'silo_user' }, (actor) => [actor.siloUserId, actor.siloId])
                  .with({ kind: 'user_builtin' }, (actor) => [
                    actor.userBuiltinId,
                    undefined,
                  ])
                  .with({ kind: 'scim' }, (actor) => [undefined, actor.siloId])
                  .with({ kind: 'unauthenticated' }, () => [undefined, undefined])
                  .exhaustive()

                const currentIndex = parseInt(expandedItem!, 10)

                return (
                  <ExpandedItem
                    hasError={!!showError}
                    item={selectedItem}
                    userId={userId}
                    siloId={siloId}
                    currentIndex={currentIndex}
                    totalCount={allItems.length}
                    onNavigate={(index) => handleToggle(index.toString())}
                    onClose={() => handleToggle(null)}
                  />
                )
              })()}
          </div>
          {showError && (
            <ErrorState error={errorMessage} onDismiss={() => setDismissedError(true)} />
          )}
          {!isLoading ? logTable : <LoadingState />}
        </div>
      </div>
    </>
  )
}

const ExpandedItem = ({
  item,
  userId,
  siloId,
  currentIndex,
  totalCount,
  onNavigate,
  onClose,
  hasError = false,
}: {
  item: AuditLogEntry
  userId?: string
  siloId?: string
  currentIndex: number
  totalCount: number
  onNavigate: (index: number) => void
  onClose: () => void
  hasError: boolean
}) => {
  const snakeJson = camelToSnakeJson(item)
  const json = JSON.stringify(snakeJson, null, 2)

  return (
    <div
      className={cn(
        'absolute right-0 top-[40px] flex w-[30rem] flex-col gap-6 overflow-y-auto border-l border-t bg-default border-secondary',
        hasError
          ? 'mt-10 h-[calc(100dvh-var(--top-bar-height)-80px)]'
          : 'h-[calc(100dvh-var(--top-bar-height)-40px)]'
      )}
    >
      <div className="bg-raise border-secondary flex items-center justify-between border-b px-2 py-2">
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => currentIndex > 0 && onNavigate(currentIndex - 1)}
            disabled={currentIndex === 0}
            className="hover:bg-hover disabled:hover:bg-raise flex h-6 w-6 flex-shrink-0 rotate-90 items-center justify-center rounded disabled:cursor-default disabled:opacity-50"
          >
            {/* support arrow keys and keep centered autoscroll to element */}
            <PrevArrow12Icon />
          </button>
          <button
            type="button"
            onClick={() => currentIndex < totalCount - 1 && onNavigate(currentIndex + 1)}
            disabled={currentIndex === totalCount - 1}
            className="hover:bg-hover disabled:hover:bg-raise flex h-6 w-6 flex-shrink-0 rotate-90 items-center justify-center rounded disabled:cursor-default disabled:opacity-50"
          >
            <NextArrow12Icon />
          </button>
          <h3 className="mr-1 ml-2">
            <Badge color="neutral">{item.operationId.split('_').join(' ')}</Badge>
          </h3>
          {match(item.result)
            .with(P.union({ kind: 'success' }, { kind: 'error' }), (result) => (
              <StatusCodeCell code={result.httpStatusCode} />
            ))
            .with({ kind: 'unknown' }, () => <EmptyCell />)
            .exhaustive()}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="hover:bg-hover flex h-6 w-6 flex-shrink-0 items-center justify-center rounded"
        >
          <Close12Icon />
        </button>
      </div>

      <div className="px-6">
        <PropertiesTable>
          <PropertiesTable.Row label="Time Completed">
            <div>
              {toLocaleDateString(item.timeCompleted)}{' '}
              <span className="text-tertiary">
                {toSyslogTimeString(item.timeCompleted)}
              </span>
            </div>
          </PropertiesTable.Row>

          <PropertiesTable.Row label="Actor ID">
            {userId ? (
              <Truncate maxLength={24} text={userId} position="middle" hasCopyButton />
            ) : (
              <EmptyCell />
            )}
          </PropertiesTable.Row>

          <PropertiesTable.Row label="Access Method">
            {item.authMethod ? (
              <Badge color="neutral">{item.authMethod.split('_').join(' ')}</Badge>
            ) : (
              <EmptyCell />
            )}
          </PropertiesTable.Row>

          <PropertiesTable.Row label="Silo ID">
            {siloId ? (
              <Truncate maxLength={24} text={siloId} position="middle" hasCopyButton />
            ) : (
              <EmptyCell />
            )}
          </PropertiesTable.Row>

          <PropertiesTable.Row label="Duration">
            {differenceInMilliseconds(new Date(item.timeCompleted), item.timeStarted)}ms
          </PropertiesTable.Row>
        </PropertiesTable>
      </div>

      <Divider />

      <div className="px-6">
        <div className="mb-2 flex items-center justify-between">
          <h4 className="text-mono-sm text-tertiary">Raw JSON</h4>
          <CopyToClipboard text={json} />
        </div>
        <div className="bg-raise border-secondary overflow-x-auto rounded border px-3 py-2">
          <pre className="text-mono-code ![font-size:13px] ![line-height:18px]">
            <HighlightJSON json={snakeJson as JsonValue} />
          </pre>
        </div>
      </div>
    </div>
  )
}
