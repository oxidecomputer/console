/* eslint-disable @typescript-eslint/no-explicit-any */

import React from 'react'
import { DefaultCell } from './cells'
import { DefaultHeader } from './headers'
import { getSelectCol, getActionsCol } from './columns'
import { Pagination } from '@oxide/ui'
import { Table } from './Table'
import { unsafe_get } from '@oxide/util'
import { useApiQuery } from '@oxide/api'
import { useCallback } from 'react'
import { useMemo } from 'react'
import { useRowSelect, useTable } from 'react-table'
import type { ComponentType, ReactElement } from 'react'
import type { ErrorResponse, ApiClient, Params, Result } from '@oxide/api'
import type { MenuAction } from './columns'
import type { Path } from '@oxide/util'
import type { Row } from 'react-table'
import type { UseQueryOptions } from 'react-query'
import { PaginationPortal, usePagination } from '@oxide/pagination'

interface UseQueryTableResult<
  A extends ApiClient,
  M extends keyof A,
  T extends Result<A[M]>
> {
  Table: ComponentType<QueryTableProps<A, M, T>>
  Column: ComponentType<QueryTableColumnProps<A, M, T>>
}
/**
 * This hook builds a table that's linked to a given query. It's a combination
 * of react-query and react-table. It generates a `Table` component that controls
 * table level options and a `Column` component which governs the individual column
 * configuration
 */
export const useQueryTable = <
  A extends ApiClient,
  M extends keyof A,
  T extends Result<A[M]>
>(
  query: M,
  params: Params<A[M]>,
  options?: UseQueryOptions<Result<A[M]>, ErrorResponse>
): UseQueryTableResult<A, M, T> => {
  // TODO: We should probably find a better way to do this. In essence
  // we need the params and options to be stable and comparable to prevent unnecessary recreation
  // of the table which is a relatively expensive operation.
  const stableParams = Object.values(params as Record<string, string>)
    .sort()
    .join(':')
  const stableOpts =
    options &&
    Object.entries(options as Record<string, string>)
      .map((e) => e.join(':'))
      .sort()
      .join(',')
  const Table = useMemo(
    () => makeQueryTable(query, params, options),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [query, stableParams, stableOpts]
  )

  return { Table, Column: QueryTableColumn }
}
interface QueryTableProps<
  A extends ApiClient,
  M extends keyof A,
  T extends Result<A[M]>
> {
  selectable?: boolean
  /** Prints table data in the console when enabled */
  debug?: boolean
  rowId?:
    | string
    | ((row: Row, relativeIndex: number, parent: unknown) => string)
  actions?: MenuAction<A, M, T>[]
  pagination?: 'inline' | 'page'
  pageSize?: number
  children: React.ReactNode
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const makeQueryTable = <
  A extends ApiClient,
  M extends keyof A,
  T extends Result<A[M]>
>(
  query: any,
  params: any,
  options: any
) =>
  function QueryTable({
    children,
    selectable,
    actions,
    debug,
    rowId,
    pagination = 'page',
    pageSize = 10,
  }: QueryTableProps<A, M, T>) {
    const { currentPage, goToNextPage, goToPrevPage, hasPrev } = usePagination()
    const columns = useMemo(
      () =>
        React.Children.toArray(children).map((child) => {
          const column = { ...(child as ReactElement).props }
          if (!column.accessor) {
            column.accessor = column.id
          }
          if (typeof column.accessor === 'string') {
            const accessorPath = column.accessor
            column.accessor = (v: unknown) => unsafe_get(v, accessorPath)
          }
          if (!column.header) {
            column.header = column.id
          }
          if (typeof column.header === 'string') {
            const name = column.header
            column.header = <DefaultHeader>{name}</DefaultHeader>
          }
          if (!column.cell) {
            column.cell = DefaultCell
          }
          column.Cell = column.cell
          column.Header = column.header
          return column
        }),
      [children]
    )

    const { data, isLoading } = useApiQuery(
      query,
      { ...params, page_token: currentPage, limit: pageSize },
      options
    )

    const tableData = useMemo(
      () => (data as any)?.items || [],
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [(data as any)?.items]
    )

    const getRowId = useCallback(
      (row, relativeIndex, parent) => {
        if (!rowId) return row.id || row?.identity?.id
        return typeof rowId === 'string'
          ? unsafe_get(row, rowId)
          : rowId(row, relativeIndex, parent)
      },
      [rowId]
    )

    const table = useTable(
      {
        columns,
        data: tableData,
        getRowId,
        // @ts-expect-error It's yelling b/c this isn't defined in the options as a type but it is included in the docs
        autoResetSelectedRows: false,
      },
      useRowSelect,
      (hooks) => {
        hooks.visibleColumns.push((columns) => {
          const visibleColumns = []
          if (selectable) visibleColumns.push(getSelectCol())
          visibleColumns.push(...columns)
          if (actions) visibleColumns.push(getActionsCol(actions))

          return visibleColumns
        })
      }
    )

    if (debug) console.table(data)

    const paginationParams = useMemo(
      () => ({
        pageSize,
        hasNext: tableData.length === pageSize,
        hasPrev,
        nextPage: (data as any)?.next_page,
        onNext: goToNextPage,
        onPrev: goToPrevPage,
      }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [pageSize, tableData.length, (data as any)?.next_page]
    )

    if (isLoading || (tableData.items?.length === 0 && !hasPrev))
      return <div>loading</div>

    return (
      <>
        <Table table={table} />
        <PaginationPortal target={pagination}>
          <Pagination type={pagination} {...paginationParams} />
        </PaginationPortal>
      </>
    )
  }

export interface QueryTableColumnProps<
  A extends ApiClient,
  M extends keyof A,
  T extends Result<A[M]>,
  R extends unknown = any
> {
  id: string
  // @ts-expect-error It complains about items not being indexable of T but we know it will be
  accessor?: Path<T['items'][number]> | ((type: T['items'][number]) => R)
  header?: string | ReactElement
  cell?: ComponentType<R>
}
const QueryTableColumn = <
  A extends ApiClient,
  M extends keyof A,
  T extends Result<A[M]>,
  R extends unknown = any
>(
  _props: QueryTableColumnProps<A, M, T, R>
) => {
  return null
}
