/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useQuery, type QueryKey, type QueryOptions } from '@tanstack/react-query'
import { getCoreRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table'
import React, { useCallback, useMemo } from 'react'

import { ensure, type ApiError } from '@oxide/api'

import { Pagination } from '~/components/Pagination'
import { usePagination } from '~/hooks/use-pagination'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { TableEmptyBox } from '~/ui/lib/Table'

import { Table } from './Table'

export const PAGE_SIZE = 25

type QueryTableProps<TItem> = {
  optionsFn: (
    limit: number,
    page_token?: string
  ) => QueryOptions<{ items: TItem[]; nextPage?: string }, ApiError> & {
    queryKey: QueryKey
  }
  pageSize?: number
  rowHeight?: 'small' | 'large'
  emptyState: React.ReactElement
  // React Table does the same in the type of `columns` on `useReactTable`
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  columns: ColumnDef<TItem, any>[]
}

export function useQueryTable<TItem>({
  optionsFn,
  pageSize = PAGE_SIZE,
  rowHeight = 'small',
  emptyState,
  columns,
}: QueryTableProps<TItem>) {
  const { currentPage, goToNextPage, goToPrevPage, hasPrev } = usePagination()
  const queryResult = useQuery(optionsFn(pageSize, currentPage))
  // only ensure prefetched if we're on the first page
  if (currentPage === undefined) ensure(queryResult)
  const { data, isLoading } = queryResult
  const tableData = useMemo(() => data?.items || [], [data])

  // TODO: need a better function that takes name or ID. sleds in the sleds
  // table have no name, for example
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  const getRowId = useCallback((row: any) => row.name, [])

  const table = useReactTable({
    columns,
    data: tableData,
    getRowId,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  })

  const isEmpty = tableData.length === 0 && !hasPrev

  const tableElement = isLoading ? null : isEmpty ? (
    <TableEmptyBox>{emptyState || <EmptyMessage title="No results" />}</TableEmptyBox>
  ) : (
    <>
      <Table table={table} rowHeight={rowHeight} />
      <Pagination
        pageSize={pageSize}
        hasNext={tableData.length === pageSize}
        hasPrev={hasPrev}
        nextPage={data?.nextPage}
        onNext={goToNextPage}
        onPrev={goToPrevPage}
      />
    </>
  )

  return { table: tableElement, query: queryResult }
}
