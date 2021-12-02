/* eslint-disable @typescript-eslint/no-explicit-any */

import { Table } from './Table'
import type { ApiError } from '@oxide/api'
import { useApiQuery } from '@oxide/api'
import type { DefaultApi } from 'libs/api/__generated__'
import type { UseQueryOptions } from 'react-query'
import type { ComponentType, ReactElement } from 'react'
import { useMemo } from 'react'
import type { Row } from 'react-table'
import { useRowSelect, useTable } from 'react-table'
import { getSelectCol } from './select-col'
import React from 'react'
import { Cell, DefaultHeader } from '.'
import type { Path } from '@oxide/util'
import { unsafe_get } from '@oxide/util'

type Params<F> = F extends (p: infer P) => any ? P : never
type Result<F> = F extends (p: any) => Promise<infer R> ? R : never

interface UseQueryTableResult<A extends DefaultApi, M extends keyof A> {
  Table: ComponentType<QueryTableProps>
  Column: ComponentType<QueryTableColumnProps<A, M, Result<A[M]>>>
}
/**
 * This hook builds a table that's linked to a given query. It's a combination
 * of react-query and react-table. It generates a `Table` component that controls
 * table level options and a `Column` component which governs the individual column
 * configuration
 */
export const useQueryTable = <A extends DefaultApi, M extends keyof A>(
  query: M,
  params: Params<A[M]>,
  options?: UseQueryOptions<Result<A[M]>, ApiError>
): UseQueryTableResult<A, M> => {
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

  // @ts-expect-error FIXME: The accessor types are reported as different, but they shouldn't be
  return { Table, Column: QueryTableColumn }
}
interface QueryTableProps {
  selectable?: boolean
  /** Prints table data in the console when enabled */
  debug?: boolean
  rowId?:
    | string
    | ((row: Row, relativeIndex: number, parent: unknown) => string)
  children: React.ReactNode
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const makeQueryTable = (query: any, params: any, options: any) =>
  function QueryTable({ children, selectable, debug, rowId }: QueryTableProps) {
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
            column.cell = Cell
          }
          column.Cell = column.cell
          column.Header = column.header
          return column
        }),
      [children]
    )

    const { data, isLoading } = useApiQuery(query, params, options)

    const tableData = useMemo(
      () => (data as any)?.items || [],
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [(data as any)?.items]
    )

    const getRowId = useMemo(() => {
      if (!rowId) return (row: Row<any>) => row.id
      return typeof rowId === 'string'
        ? (row: Row) => unsafe_get(row, rowId)
        : rowId
    }, [rowId])

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
        selectable &&
          hooks.visibleColumns.push((columns) => [getSelectCol(), ...columns])
      }
    )

    if (debug) console.table(table.data)

    if (isLoading) return <div>loading</div>

    return <Table table={table} />
  }

type items = 'items'

interface QueryTableColumnProps<
  A extends DefaultApi,
  M extends keyof A,
  T extends Result<A[M]>,
  R extends unknown = any
> {
  id: string
  // @ts-expect-error It complains about items not being indexable of T but we know it will be
  accessor?: Path<T[items][number]> | ((type: T[items][number]) => R)
  header?: string | ReactElement
  cell?: ComponentType<R>
}
const QueryTableColumn = <
  A extends DefaultApi,
  M extends keyof A,
  T extends Result<A[M]>,
  R extends unknown = any
>(
  _props: QueryTableColumnProps<A, M, T, R>
) => {
  return null
}
