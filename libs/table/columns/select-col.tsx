import type { Row, TableInstance } from '@tanstack/react-table'

import { Checkbox } from '@oxide/ui'

// only needs to be a function because of the generic params
export const getSelectCol = <TGenerics,>() => ({
  id: 'select',
  meta: { thClassName: 'w-10' },
  header: ({ instance }: { instance: TableInstance<TGenerics> }) => (
    <div className="flex">
      <Checkbox
        checked={instance.getIsAllRowsSelected()}
        indeterminate={instance.getIsSomeRowsSelected()}
        onChange={instance.getToggleAllRowsSelectedHandler()}
      />
    </div>
  ),
  cell: ({ row }: { row: Row<TGenerics> }) => (
    <Checkbox checked={row.getIsSelected()} onChange={row.getToggleSelectedHandler()} />
  ),
})
