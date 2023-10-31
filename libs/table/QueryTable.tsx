/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import type { UseQueryOptions } from '@tanstack/react-query'
import { hashKey } from '@tanstack/react-query'
import type { AccessorFn, DeepKeys } from '@tanstack/react-table'
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import React, { useCallback, useEffect, useMemo } from 'react'
import type { ComponentType, ReactElement } from 'react'

import { useApiQuery } from '@oxide/api'
import type { ApiError, ApiListMethods, Params, Result, ResultItem } from '@oxide/api'
import { Pagination, usePagination } from '@oxide/pagination'
import { EmptyMessage, TableEmptyBox } from '@oxide/ui'
import { invariant, isOneOf } from '@oxide/util'

import { DefaultCell } from './cells'
import { getActionsCol, getMultiSelectCol, getSelectCol } from './columns'
import type { MakeActions } from './columns'
import { Table } from './Table'

interface UseQueryTableResult<Item extends Record<string, unknown>> {
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
  options?: Omit<UseQueryOptions<Result<A[M]>, ApiError>, 'queryKey' | 'queryFn'>
): UseQueryTableResult<ResultItem<A[M]>> => {
  const Table = useMemo(
    () => makeQueryTable<ResultItem<A[M]>>(query, params, options),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [query, hashKey(params as any), hashKey(options as any)]
  )

  return { Table, Column: QueryTableColumn }
}

type QueryTableProps<Item> = {
  /** Prints table data in the console when enabled */
  debug?: boolean
  /** Function that produces a list of actions from a row item */
  makeActions?: MakeActions<Item>
  pagination?: 'inline' | 'page'
  pageSize?: number
  children: React.ReactNode
  emptyState: React.ReactElement
} & (
  | {
      /**
       * If present, the table will include a select column and make rows
       * selectable one at a time.
       */
      onSingleSelect: (selection: string) => void
      onMultiSelect?: never
    }
  | {
      onSingleSelect?: never
      /**
       * If present, the table will include a select column and make rows
       * selectable.
       */
      onMultiSelect: (selections: string[]) => void
    }
  | {
      onSingleSelect?: never
      onMultiSelect?: never
    }
)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const makeQueryTable = <Item extends Record<string, unknown>>(
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
    onSingleSelect,
    onMultiSelect,
  }: QueryTableProps<Item>) {
    invariant(
      isOneOf(children, [QueryTableColumn]),
      'QueryTable can only have Column as a child'
    )

    const [rowSelection, setRowSelection] = React.useState({})
    useEffect(() => {
      const selected = Object.keys(rowSelection)
      onSingleSelect?.(selected[0])
      onMultiSelect?.(selected)
    }, [rowSelection, onSingleSelect, onMultiSelect])

    const { currentPage, goToNextPage, goToPrevPage, hasPrev } = usePagination()
    const columns = useMemo(() => {
      const colHelper = createColumnHelper<Item>()
      const columns = React.Children.toArray(children).map((child) => {
        const column = { ...(child as ReactElement<QueryTableColumnProps<Item>>).props }

        // QueryTableColumnProps ensures `id` is passed in if and only if
        // `accessor` is not a string
        const id =
          'id' in column
            ? column.id
            : typeof column.accessor === 'string'
            ? column.accessor
            : undefined // should never happen because id is required if accessor is a function

        return colHelper.accessor(column.accessor, {
          id: id!, // undefined not really possible, and helper doesn't allow it
          header: typeof column.header === 'string' ? column.header : id,
          cell: (info: any) => {
            const Comp = column.cell || DefaultCell
            return <Comp value={info.getValue()} />
          },
        })
      })

      if (onSingleSelect) {
        columns.unshift(getSelectCol())
      } else if (onMultiSelect) {
        columns.unshift(getMultiSelectCol())
      }

      if (makeActions) {
        columns.push(getActionsCol(makeActions))
      }

      return columns
    }, [children, makeActions, onSingleSelect, onMultiSelect])

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
      data: tableData,
      getRowId,
      getCoreRowModel: getCoreRowModel(),
      state: {
        rowSelection,
      },
      manualPagination: true,
      enableRowSelection: !!onSingleSelect,
      enableMultiRowSelection: !!onMultiSelect,
      onRowSelectionChange: setRowSelection,
    })

    if (debug) console.table((data as { items?: any[] })?.items || data)

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
        <Table
          table={table}
          singleSelect={!!onSingleSelect}
          multiSelect={!!onMultiSelect}
        />
        <Pagination inline={pagination === 'inline'} {...paginationParams} />
      </>
    )
  }

export type QueryTableColumnProps<Item extends Record<string, unknown>> = {
  header?: string | ReactElement
  /** Use `header` instead */
  name?: never
  cell?: ComponentType<{ value: any }>
} & ( // imitate the way RT works: only pass id if accessor is not a string
  | {
      accessor: DeepKeys<Item>
      id?: string
    }
  | {
      accessor: AccessorFn<Item>
      id: string
    }
)

const QueryTableColumn = <Item extends Record<string, unknown>>(
  _props: QueryTableColumnProps<Item>
) => null
