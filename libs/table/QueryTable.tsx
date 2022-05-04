/* eslint-disable @typescript-eslint/no-explicit-any */

import React from 'react'
import { DefaultCell } from './cells'
import { DefaultHeader } from './headers'
import { actionsCol, selectCol } from './columns'
import { Table } from './Table'
import { useApiQuery } from '@oxide/api'
import { useCallback } from 'react'
import { useMemo } from 'react'
import { createTable, getCoreRowModelSync, useTableInstance } from '@tanstack/react-table'
import type { ComponentType, ReactElement } from 'react'
import type { ErrorResponse, ApiListMethods, Params, Result, ResultItem } from '@oxide/api'
import type { MakeActions } from './columns'
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
    const tableHelper = useMemo(() => createTable().setRowType<Item>(), [])
    const columns = useMemo(() => {
      const columns = React.Children.toArray(children).map((child) => {
        const column = { ...(child as ReactElement).props }
        const options = {
          header: column.header || column.id,
          cell: column.cell || DefaultCell,
          id: column.id,
        }

        if (typeof options.header === 'string') {
          const name = options.header
          options.header = <DefaultHeader>{name}</DefaultHeader>
        }

        const accessor = column.accessor || column.id
        // it doesn't like the type of options here but the error is opaque
        return tableHelper.createDataColumn(accessor, options as any)
      })
      if (makeActions) {
        columns.unshift(selectCol())
        columns.push(actionsCol(makeActions))
      }

      return columns
    }, [children, tableHelper, makeActions])

    const { data, isLoading } = useApiQuery(
      query,
      { ...params, page_token: currentPage, limit: pageSize },
      options
    )

    const tableData: any[] = useMemo(() => (data as any)?.items || [], [data])

    const getRowId = useCallback((row) => row.id, [])

    const table = useTableInstance(tableHelper, {
      columns,
      data: tableData,
      getRowId,
      getCoreRowModel: getCoreRowModelSync(),
    })

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
  accessor?: keyof Item | ((item: Item) => R)
  header?: string | ReactElement
  /** Use `header` instead */
  name?: never
  cell?: ComponentType<R>
}

const QueryTableColumn = <Item, R extends unknown = any>(
  _props: QueryTableColumnProps<Item, R>
) => null
