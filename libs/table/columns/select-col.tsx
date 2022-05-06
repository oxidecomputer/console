import type { Row, TableInstance } from '@tanstack/react-table'

import { Checkbox } from '@oxide/ui'

// only needs to be a function because of the generic params
export const selectCol = <TGenerics,>() => ({
  id: 'select',
  meta: { thClassName: 'w-10' },
  header: ({ instance }: { instance: TableInstance<TGenerics> }) => (
    <div>
      <Checkbox
        checked={instance.getIsAllRowsSelected()}
        indeterminate={instance.getIsSomeRowsSelected()}
        onChange={instance.getToggleAllRowsSelectedHandler()}
      />
    </div>
  ),
  cell: ({ row }: { row: Row<TGenerics> }) => (
    <div>
      <Checkbox checked={row.getIsSelected()} onChange={row.getToggleSelectedHandler()} />
    </div>
  ),
})
