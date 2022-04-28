import type { Row, TableInstance } from 'react-table'

import { Checkbox } from '@oxide/ui'

export const getSelectCol = <T extends object>() => ({
  id: 'selection',
  Header: (props: TableInstance<T>) => (
    <div className="flex items-center justify-center">
      <Checkbox {...props.getToggleAllRowsSelectedProps()} />
    </div>
  ),
  Cell: ({ row }: { row: Row<T> }) => <Checkbox {...row.getToggleRowSelectedProps()} />,
  className: 'w-10',
})
