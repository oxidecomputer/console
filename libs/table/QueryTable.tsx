/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AccessorFn } from '@tanstack/react-table'
import { getCoreRowModel, useTableInstance } from '@tanstack/react-table'
import React from 'react'
import { useCallback } from 'react'
import { useMemo } from 'react'
import type { ComponentType, ReactElement } from 'react'
import type { UseQueryOptions } from 'react-query'
import { hashQueryKey } from 'react-query'
import invariant from 'tiny-invariant'

import { useApiQuery } from '@oxide/api'
import type { ApiListMethods, ErrorResponse, Params, Result, ResultItem } from '@oxide/api'
import { Pagination, usePagination } from '@oxide/pagination'
import { EmptyMessage, TableEmptyBox } from '@oxide/ui'
import { isOneOf } from '@oxide/util'

import { Table, createTable } from './Table'
import { DefaultCell } from './cells'
import { getActionsCol, getSelectCol } from './columns'
import type { MakeActions } from './columns'

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
    invariant(
      isOneOf(children, [QueryTableColumn]),
      'QueryTable can only have Column as a child'
    )

    const { currentPage, goToNextPage, goToPrevPage, hasPrev } = usePagination()
    const tableHelper = useMemo(() => createTable().setRowType<Item>(), [])
    const columns = useMemo(() => {
      let columns = React.Children.toArray(children).map((child) => {
        const column = { ...(child as ReactElement<QueryTableColumnProps<Item>>).props }

        // QueryTableColumnProps ensures `id` is passed in if and only if
        // `accessor` is not a string
        const id = 'id' in column ? column.id : column.accessor

        return tableHelper.createDataColumn(
          column.accessor,
          // I think passing variables here messes with RT's ability to infer
          // the relationships between these keys. The type error is useless.
          // This is fine though: it's simple enough and it's correct.
          // @ts-expect-error
          {
            id,
            header: typeof column.header === 'string' ? column.header : id,
            cell: (info: any) => {
              const Comp = column.cell || DefaultCell
              return <Comp value={info.getValue()} />
            },
          }
        )
      })

      if (makeActions) {
        columns = [getSelectCol(), ...columns, getActionsCol(makeActions)]
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
      getCoreRowModel: getCoreRowModel(),
      manualPagination: true,
    })

    if (debug) console.table(data)

    const paginationParams = useMemo(
      () => ({
        pageSize,
        hasNext: tableData.length === pageSize,
        hasPrev,
        nextPage: (data as any)?.nextPage,
        onNext: goToNextPage,
        onPrev: goToPrevPage,
      }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [pageSize, tableData.length, (data as any)?.nextPage]
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

export type QueryTableColumnProps<Item> = {
  header?: string | ReactElement
  /** Use `header` instead */
  name?: never
  cell?: ComponentType<{ value: any }>
} & ( // imitate the way RT works: only pass id if accessor is not a string
  | { accessor: keyof Item }
  | {
      accessor: AccessorFn<Item>
      id: string
    }
)

const QueryTableColumn = <Item,>(_props: QueryTableColumnProps<Item>) => null
