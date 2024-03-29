/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { hashKey, type UseQueryOptions } from '@tanstack/react-query'
import { getCoreRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table'
import React, { useCallback, useMemo, type ComponentType } from 'react'

import {
  useApiQuery,
  type ApiError,
  type ApiListMethods,
  type Params,
  type Result,
  type ResultItem,
} from '@oxide/api'

import { Pagination } from '~/components/Pagination'
import { usePagination } from '~/hooks/use-pagination'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { TableEmptyBox } from '~/ui/lib/Table'

import { defaultCell } from './cells/DefaultCell'
import { Table } from './Table'

interface UseQueryTableResult<Item extends Record<string, unknown>> {
  Table: ComponentType<QueryTableProps<Item>>
}
/**
 * This hook builds a table that's linked to a given query. It's a combination
 * of react-query and react-table. It generates a `Table` component that controls
 * table level options and a `Column` component which governs the individual column
 * configuration
 */
export const useQueryTable2 = <A extends ApiListMethods, M extends keyof A>(
  query: M,
  params: Params<A[M]>,
  options?: Omit<UseQueryOptions<Result<A[M]>, ApiError>, 'queryKey' | 'queryFn'>
): UseQueryTableResult<ResultItem<A[M]>> => {
  const Table = useMemo(
    () => makeQueryTable<ResultItem<A[M]>>(query, params, options),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [query, hashKey(params as any), hashKey(options as any)]
  )

  return { Table }
}

type QueryTableProps<Item> = {
  /** Prints table data in the console when enabled */
  debug?: boolean
  /** Function that produces a list of actions from a row item */
  pagination?: 'inline' | 'page'
  pageSize?: number
  emptyState: React.ReactElement
  columns: ColumnDef<Item, any>[]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const makeQueryTable = <Item extends Record<string, unknown>>(
  query: any,
  params: any,
  options: any
): ComponentType<QueryTableProps<Item>> =>
  function QueryTable({
    debug,
    pagination = 'page',
    pageSize = 25,
    emptyState,
    columns,
  }: QueryTableProps<Item>) {
    const { currentPage, goToNextPage, goToPrevPage, hasPrev } = usePagination()

    const { data, isLoading } = useApiQuery(
      query,
      {
        path: params.path,
        query: { ...params.query, page_token: currentPage, limit: pageSize },
      },
      options
    )

    const tableData: any[] = useMemo(() => (data as any)?.items || [], [data])

    const getRowId = useCallback((row: any) => row.name, [])

    const table = useReactTable({
      columns,
      defaultColumn: { cell: defaultCell },
      data: tableData,
      getRowId,
      getCoreRowModel: getCoreRowModel(),
      manualPagination: true,
    })

    if (debug) console.table((data as { items?: any[] })?.items || data)

    if (isLoading) return null

    const isEmpty = tableData.length === 0 && !hasPrev
    if (isEmpty) {
      return (
        <TableEmptyBox>{emptyState || <EmptyMessage title="No results" />}</TableEmptyBox>
      )
    }

    return (
      <>
        <Table table={table} />
        <Pagination
          inline={pagination === 'inline'}
          pageSize={pageSize}
          hasNext={tableData.length === pageSize}
          hasPrev={hasPrev}
          nextPage={(data as any)?.nextPage}
          onNext={goToNextPage}
          onPrev={goToPrevPage}
        />
      </>
    )
  }
