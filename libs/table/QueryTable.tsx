import { Table } from './Table'
import type { ApiError } from '@oxide/api'
import { useApiQuery } from '@oxide/api'
import type { DefaultApi } from 'libs/api/__generated__'
import type { UseQueryOptions, UseQueryResult } from 'react-query'
import type { ComponentType, ReactElement } from 'react'
import { useState } from 'react'
import { useEffect } from 'react'
import { useMemo } from 'react'
import { useRowSelect, useTable } from 'react-table'
import { selectCol } from './select-col'
import React from 'react'
import { DefaultCell, DefaultHeader } from '.'

const get = (obj: any, path: string) => {
  console.log('get called with', obj, path)
  let current = obj
  const parts = path.split('.')
  for (const part of parts) {
    current = current[part]
  }
  return current
}

type Params<F> = F extends (p: infer P) => any ? P : never
type Result<F> = F extends (p: any) => Promise<infer R> ? R : never

type PathImpl<T, Key extends keyof T> = Key extends string
  ? T[Key] extends Record<string, any>
    ?
        | `${Key}.${PathImpl<T[Key], Exclude<keyof T[Key], keyof any[]>> &
            string}`
        | `${Key}.${Exclude<keyof T[Key], keyof any[]> & string}`
    : never
  : never

type PathImpl2<T> = PathImpl<T, keyof T> | keyof T

type Path<T> = PathImpl2<T> extends string | keyof T ? PathImpl2<T> : keyof T

// type PathValue<T, P extends Path<T>> = P extends `${infer Key}.${infer Rest}`
//   ? Key extends keyof T
//     ? Rest extends Path<T[Key]>
//       ? PathValue<T[Key], Rest>
//       : never
//     : never
//   : P extends keyof T
//   ? T[P]
//   : never

interface QueryTableProps {
  selectable?: boolean
  children: React.ReactNode
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const makeQueryTable = (query: any, params: any, options: any) =>
  function QueryTable({ children, selectable }: QueryTableProps) {
    const [tableData, setTableData] = useState([])
    const columns = useMemo(
      () =>
        React.Children.toArray(children).map((child) => {
          const column = { ...(child as ReactElement).props }
          if (typeof column.accessor === 'string') {
            const accessorPath = column.accessor
            column.accessor = (v: unknown) => get(v, accessorPath)
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
    const { data, isLoading } = useApiQuery(query, params, options)

    useEffect(() => {
      setTableData((data as any)?.items || [])
    }, [data])

    const table = useTable(
      { columns, data: tableData },
      useRowSelect,
      (hooks) => {
        selectable &&
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          hooks.visibleColumns.push((columns) => [selectCol as any, ...columns])
      }
    )

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
  // @ts-expect-error
  accessor: Path<T[items][number]> | ((type: T[items][number]) => R)
  header: string | ReactElement
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

interface UseQueryTableResult<A extends DefaultApi, M extends keyof A> {
  Table: ComponentType<QueryTableProps>
  Column: ComponentType<QueryTableColumnProps<A, M, Result<A[M]>>>
}
export const useQueryTable = <A extends DefaultApi, M extends keyof A>(
  query: M,
  params: Params<A[M]>,
  options?: UseQueryOptions<Result<A[M]>, ApiError>
): UseQueryTableResult<A, M> => {
  const Table = useMemo(() => {
    console.log('regenerating')
    return makeQueryTable(query, params, options)
  }, [query])

  return { Table, Column: QueryTableColumn }
}
