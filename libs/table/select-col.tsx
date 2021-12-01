import type { Column, Row, TableInstance } from 'react-table'
import React from 'react'

import { Checkbox } from '@oxide/ui'

// TODO: make this generic instead of using any?
export const selectCol: Column<Row> & { className?: string } = {
  id: 'selection',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Header: (props: TableInstance<any>) => (
    <div className="flex justify-center items-center">
      <Checkbox {...props.getToggleAllRowsSelectedProps()} />
    </div>
  ),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Cell: ({ row }: { row: Row<any> }) => (
    <div className="text-center">
      <Checkbox {...row.getToggleRowSelectedProps()} />
    </div>
  ),

  className: 'w-12',
}
