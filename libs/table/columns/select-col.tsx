import type { ReactTable, Row as Row2 } from '@tanstack/react-table'
import type { Row, TableInstance } from 'react-table'
import React from 'react'

import { Checkbox } from '@oxide/ui'

export const getSelectCol = <T extends object>() => ({
  id: 'selection',
  Header: (props: TableInstance<T>) => (
    <div className="flex items-center justify-center">
      <Checkbox {...props.getToggleAllRowsSelectedProps()} />
    </div>
  ),
  Cell: ({ row }: { row: Row<T> }) => (
    <Checkbox {...row.getToggleRowSelectedProps()} />
  ),
  className: 'w-10',
})

// only needs to be a function because of the generic params
export const selectCol = <T, U, V, W, X>() => ({
  id: 'select',
  // TODO: fix width at w-12
  header: ({ instance }: { instance: ReactTable<T, U, V, W, X> }) => (
    <Checkbox {...instance.getToggleAllRowsSelectedProps()} />
  ),
  cell: ({ row }: { row: Row2<T, U, V, W, X> }) => (
    <div className="px-1">
      <Checkbox {...row.getToggleSelectedProps()} />
    </div>
  ),
})
