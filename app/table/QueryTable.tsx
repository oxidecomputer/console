/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { hashKey, useIsFetching, type UseQueryOptions } from '@tanstack/react-query'
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type RowData,
} from '@tanstack/react-table'
import cn from 'classnames'
import React, { useCallback, useMemo, useRef, useState, type ComponentType } from 'react'
import { useSearchParams } from 'react-router-dom'

import {
  apiQueryClient,
  useApiQuery,
  type ApiError,
  type ApiListMethods,
  type Params,
  type Result,
  type ResultItem,
} from '@oxide/api'
import { Close12Icon, Search16Icon } from '@oxide/design-system/icons/react'

import { Pagination } from '~/components/Pagination'
import { useIntervalPicker } from '~/components/RefetchIntervalPicker'
import { TableFilter } from '~/components/TableFilter'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { TableActions, TableEmptyBox } from '~/ui/lib/Table'

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

  return { Table }
}

type QueryTableProps<Item> = {
  /** Prints table data in the console when enabled */
  debug?: boolean
  /** Function that produces a list of actions from a row item */
  pagination?: 'inline' | 'page'
  pageSize?: number
  rowHeight?: 'small' | 'large'
  emptyState: React.ReactElement
  actions?: React.ReactElement
  columns: ColumnDef<Item, any>[]
}

declare module '@tanstack/react-table' {
  // allows us to define custom properties for our columns
  interface ColumnMeta<TData extends RowData, TValue> {
    filterVariant?: 'text' | 'range' | 'select' | 'datetime'
    options?: string[]
  }
}

export const PAGE_SIZE = 25

export const defaultColumnFilters = [
  {
    id: '',
    value: '',
  },
]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const makeQueryTable = <Item extends Record<string, unknown>>(
  query: any,
  params: any,
  options: any
): ComponentType<QueryTableProps<Item>> =>
  function QueryTable({
    debug,
    pagination = 'page',
    pageSize = PAGE_SIZE,
    rowHeight = 'small',
    emptyState,
    columns,
    actions,
  }: QueryTableProps<Item>) {
    const [globalFilter, setGlobalFilter] = useState('')
    const [searching, setSearching] = useState(false)
    const searchInputRef = useRef<HTMLInputElement>(null)

    // localFilters are the state used for the filter popover
    // columnFilters are the applied state used to do the actual filtering
    const [localFilters, setLocalFilters] = useState(defaultColumnFilters)
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

    const { data, isLoading } = useApiQuery(
      query,
      {
        path: params.path,
        query: { ...params.query, limit: 500000 },
      },
      options
    )

    const { intervalPicker } = useIntervalPicker({
      enabled: true,
      isLoading: useIsFetching({ queryKey: [query] }) > 0,
      fn: () => apiQueryClient.invalidateQueries(query),
      variant: 'table',
    })

    const tableData: any[] = useMemo(() => (data as any)?.items || [], [data])

    const getRowId = useCallback((row: any) => row.name, [])

    const [searchParams, setSearchParams] = useSearchParams()
    const page = searchParams.get('page')
    const currentPage = page ? Number(page) : 0

    const nextPage = () => {
      const maxPage = table.getPageCount() - 1
      if (currentPage < maxPage) {
        updatePage(currentPage + 1)
      }
    }

    const prevPage = () => {
      if (currentPage > 0) {
        updatePage(currentPage - 1)
      }
    }

    const updatePage = (p: number) => {
      if (p === 0) {
        // first page does not need to be in the URL
        searchParams.delete('page')
      } else {
        searchParams.set('page', p.toString())
      }
      setSearchParams(searchParams, { replace: true })
    }

    const table = useReactTable({
      columns,
      data: tableData,
      getRowId,
      getCoreRowModel: getCoreRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      getSortedRowModel: getSortedRowModel(),
      enableSortingRemoval: false,
      getPaginationRowModel: getPaginationRowModel(),
      onGlobalFilterChange: setGlobalFilter,
      globalFilterFn: 'includesString',
      initialState: {
        sorting: [
          {
            id: 'timeCreated',
            desc: true,
          },
        ],
      },
      state: {
        pagination: {
          pageIndex: currentPage,
          pageSize,
        },
        globalFilter,
        columnFilters,
      },
      onPaginationChange: (updater) => {
        if (typeof updater === 'function') {
          const newState = updater({ pageIndex: currentPage, pageSize })
          updatePage(newState.pageIndex)
        }
      },
      manualPagination: false,
    })

    if (debug) console.table((data as { items?: any[] })?.items || data)
    if (isLoading) return null

    const filteredLength = table.getPrePaginationRowModel().rows.length
    const noResults = tableData.length === 0
    const isEmpty = noResults || filteredLength === 0

    const resetSearch = () => {
      setGlobalFilter('')
      setSearching(false)
    }

    const clearAllFilters = () => {
      setGlobalFilter('')
      setSearching(false)
      setLocalFilters([...defaultColumnFilters])
      setColumnFilters([])
    }

    const isFilteringColumn = columnFilters.length > 0

    return (
      <>
        <TableActions className="justify-between">
          <div>{intervalPicker}</div>
          <div className="flex space-x-2">
            <div className="flex items-center space-x-3">
              {(globalFilter || isFilteringColumn) && (
                <div className="text-sans-sm text-tertiary">
                  {filteredLength.toLocaleString()} matches
                </div>
              )}
              <div
                className={cn(
                  'relative flex h-8 items-center justify-center rounded border border-default',
                  searching
                    ? 'w-52 !justify-start !px-3 focus-within:ring-2 focus-within:ring-accent-secondary'
                    : 'w-8 hover:bg-hover',
                  noResults ? 'text-disabled !border-secondary' : ''
                )}
              >
                <button
                  type="button"
                  onClick={() => {
                    if (!searching) {
                      setSearching(true)
                      searchInputRef.current?.focus()
                    }
                  }}
                  className={searching ? 'pointer-events-none' : 'absolute inset-0'}
                >
                  <SearchIcon12 className="text-tertiary" />
                </button>

                <input
                  ref={searchInputRef}
                  value={globalFilter}
                  className={cn(
                    'absolute inset-0 z-10 ml-8 mr-8 border-none bg-transparent text-sans-md text-secondary border-secondary focus:outline-none',
                    !searching && 'pointer-events-none opacity-0'
                  )}
                  onChange={(el) => setGlobalFilter(el.target.value)}
                  onBlur={() => {
                    if (globalFilter === '') {
                      setSearching(false)
                    }
                  }}
                />
                <button
                  type="button"
                  className={cn(
                    'absolute right-1 flex items-center justify-center rounded p-1 hover:bg-hover',
                    !searching && 'hidden'
                  )}
                  onClick={resetSearch}
                >
                  <Close12Icon />
                </button>
              </div>
            </div>
            <TableFilter
              disabled={noResults}
              columnFilters={columnFilters}
              setColumnFilters={setColumnFilters}
              localFilters={localFilters}
              setLocalFilters={setLocalFilters}
              columnOptions={table.getAllColumns().filter((item) => !!item.accessorFn)} // If it doesnt have an accessorFn it probably isn't filterable
            />
            {actions}
          </div>
        </TableActions>
        {isEmpty ? (
          <TableEmptyBox>
            {noResults ? (
              emptyState || <EmptyMessage title="No results" />
            ) : (
              <EmptyMessage
                icon={<Search16Icon />}
                title="No matches"
                body={
                  isFilteringColumn
                    ? 'Could not find items that match filters'
                    : `Could not find item "${globalFilter}"`
                }
                buttonText={isFilteringColumn ? 'Clear filters' : 'Clear search'}
                onClick={clearAllFilters}
              />
            )}
          </TableEmptyBox>
        ) : (
          <Table table={table} rowHeight={rowHeight} />
        )}
        <Pagination
          inline={pagination === 'inline'}
          pageSize={pageSize}
          currentPage={currentPage}
          pageCount={table.getPageCount()}
          onNext={nextPage}
          onPrev={prevPage}
        />
      </>
    )
  }

const SearchIcon12 = ({ className }: { className?: string }) => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M9 5.5C9 7.433 7.433 9 5.5 9C3.567 9 2 7.433 2 5.5C2 3.567 3.567 2 5.5 2C7.433 2 9 3.567 9 5.5ZM8.61752 10.0317C7.73148 10.6424 6.6575 11 5.5 11C2.46243 11 0 8.53757 0 5.5C0 2.46243 2.46243 0 5.5 0C8.53757 0 11 2.46243 11 5.5C11 6.6575 10.6424 7.73148 10.0317 8.61753L11.7333 10.3191C11.995 10.5808 11.995 11.005 11.7333 11.2666L11.2667 11.7333C11.005 11.995 10.5808 11.995 10.3191 11.7333L8.61752 10.0317Z"
      fill="currentColor"
    />
  </svg>
)
