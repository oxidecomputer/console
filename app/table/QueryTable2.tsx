/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useQuery } from '@tanstack/react-query'
import { getCoreRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table'
import React, { useEffect, useMemo, useRef } from 'react'

import { ensurePrefetched, type PaginatedQuery, type ResultsPage } from '@oxide/api'

import { Pagination } from '~/components/Pagination'
import { usePagination } from '~/hooks/use-pagination'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { TableEmptyBox } from '~/ui/lib/Table'

import { Table } from './Table'

type QueryTableProps<TItem> = {
  query: PaginatedQuery<ResultsPage<TItem>>
  rowHeight?: 'small' | 'large'
  emptyState: React.ReactElement
  // React Table does the same in the type of `columns` on `useReactTable`
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  columns: ColumnDef<TItem, any>[]
}

/**
 * Reset scroll to top when clicking * next/prev to change page but not,
 * for example, on initial pageload after browser forward/back.
 */
function useScrollReset(triggerDep: string | undefined) {
  const resetRequested = useRef(false)
  useEffect(() => {
    if (resetRequested.current) {
      document.querySelector('#scroll-container')?.scrollTo(0, 0)
      resetRequested.current = false
    }
  }, [triggerDep])
  return () => {
    resetRequested.current = true
  }
}

// require ID only so we can use it in getRowId
export function useQueryTable<TItem extends { id: string }>({
  query,
  rowHeight = 'small',
  emptyState,
  columns,
}: QueryTableProps<TItem>) {
  const { currentPage, goToNextPage, goToPrevPage, hasPrev } = usePagination()
  const queryOptions = query.optionsFn(currentPage)
  const queryResult = useQuery(queryOptions)
  // only ensure prefetched if we're on the first page
  if (currentPage === undefined) ensurePrefetched(queryResult, queryOptions.queryKey)
  const { data, isPlaceholderData } = queryResult
  const tableData = useMemo(() => data?.items || [], [data])

  // trigger by first item ID and not, e.g., currentPage because currentPage
  // changes as soon as you click Next, while the item ID doesn't change until
  // the page actually changes.
  const requestScrollReset = useScrollReset(tableData.at(0)?.id)

  const table = useReactTable({
    columns,
    data: tableData,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  })

  const isEmpty = tableData.length === 0 && !hasPrev

  const tableElement = isEmpty ? (
    <TableEmptyBox>{emptyState || <EmptyMessage title="No results" />}</TableEmptyBox>
  ) : (
    <>
      <Table table={table} rowHeight={rowHeight} />
      <Pagination
        pageSize={query.pageSize}
        hasNext={tableData.length === query.pageSize}
        hasPrev={hasPrev}
        nextPage={data?.nextPage}
        onNext={(p) => {
          requestScrollReset()
          goToNextPage(p)
        }}
        onPrev={() => {
          requestScrollReset()
          goToPrevPage()
        }}
        // I can't believe how well this works, but it exactly matches when
        // we want to show the spinner. Cached page changes don't need it.
        loading={isPlaceholderData}
      />
    </>
  )

  return { table: tableElement, query: queryResult }
}
