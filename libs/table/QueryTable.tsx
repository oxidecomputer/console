/* eslint-disable @typescript-eslint/no-explicit-any */

import React from 'react'
import { DefaultCell } from './cells'
import { DefaultHeader } from './headers'
import { getSelectCol, getActionsCol } from './columns'
import { Table } from './Table'
import { unsafe_get } from '@oxide/util'
import { useApiQuery } from '@oxide/api'
import { useCallback } from 'react'
import { useMemo } from 'react'
import { useRowSelect, useTable } from 'react-table'
import type { ComponentType, ReactElement } from 'react'
import type { ErrorResponse, ApiListMethods, Params, Result, ResultItem } from '@oxide/api'
import type { MakeActions } from './columns'
import type { Path } from '@oxide/util'
import type { UseQueryOptions } from 'react-query'
import { hashQueryKey } from 'react-query'
import { Pagination, usePagination } from '@oxide/pagination'
import { EmptyMessage, TableEmptyBox } from '@oxide/ui'

interface UseQueryTableResult<Item> {
  Table: ComponentType<QueryTableProps<Item>>
  Column: ComponentType<QueryTableColumnProps<Item>>
}
/**
 * This hook builds a table that's linked to a given query. It's a combination
 * of react-query and react-table. It generates a `Table` component that controls
 * table level options and a `Column` component which governs the individual column
 * configuration
 */
export const useQueryTable = <A extends ApiListMethods, M extends keyof A>(
  query: M,
  params: Params<A[M]>,
  options?: UseQueryOptions<Result<A[M]>, ErrorResponse>
): UseQueryTableResult<ResultItem<A[M]>> => {
  const Table = useMemo(
    () => makeQueryTable<ResultItem<A[M]>>(query, params, options),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [query, hashQueryKey(params as any), hashQueryKey(options as any)]
  )

  return { Table, Column: QueryTableColumn }
}

interface QueryTableProps<Item> {
  /** Prints table data in the console when enabled */
  debug?: boolean
  /** Function that produces a list of actions from a row item */
  makeActions?: MakeActions<Item>
  pagination?: 'inline' | 'page'
  pageSize?: number
  children: React.ReactNode
  emptyState: React.ReactElement
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const makeQueryTable = <Item,>(
  query: any,
  params: any,
  options: any
): ComponentType<QueryTableProps<Item>> =>
  function QueryTable({
    children,
    makeActions,
    debug,
    pagination = 'page',
    pageSize = 10,
    emptyState,
  }: QueryTableProps<Item>) {
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

    const tableData: any[] = useMemo(() => (data as any)?.items || [], [data])

    const getRowId = useCallback((row) => row.id, [])

    const table = useTable(
      {
        columns,
        data: tableData,
        getRowId,
        autoResetSelectedRows: false,
      },
      useRowSelect,
      (hooks) => {
        hooks.visibleColumns.push((columns) => {
          const visibleColumns = []
          if (makeActions) visibleColumns.push(getSelectCol())
          visibleColumns.push(...columns)
          if (makeActions) visibleColumns.push(getActionsCol(makeActions))

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
        <Pagination inline={pagination === 'inline'} {...paginationParams} />
      </>
    )
  }

export interface QueryTableColumnProps<Item, R extends unknown = any> {
  id: string
  accessor?: Path<Item> | ((item: Item) => R)
  header?: string | ReactElement
  /** Use `header` instead */
  name?: never
  cell?: ComponentType<R>
}

const QueryTableColumn = <Item, R extends unknown = any>(
  _props: QueryTableColumnProps<Item, R>
) => null
