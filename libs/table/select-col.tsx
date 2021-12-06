import type { Row, TableInstance } from 'react-table'
import React from 'react'

import { Checkbox } from '@oxide/ui'

export const getSelectCol = <T extends object>() => ({
  id: 'selection',
  Header: (props: TableInstance<T>) => (
    <div className="flex justify-center items-center">
      <Checkbox {...props.getToggleAllRowsSelectedProps()} />
    </div>
  ),
  Cell: ({ row }: { row: Row<T> }) => (
    <div className="text-center">
      <Checkbox {...row.getToggleRowSelectedProps()} />
    </div>
  ),
  className: 'w-12',
})
