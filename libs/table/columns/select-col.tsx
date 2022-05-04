import type { Row, TableInstance } from '@tanstack/react-table'

import { Checkbox } from '@oxide/ui'

// only needs to be a function because of the generic params
export const selectCol = <TGenerics,>() => ({
  id: 'select',
  // TODO: fix width at w-12
  header: ({ instance }: { instance: TableInstance<TGenerics> }) => (
    <Checkbox
      checked={instance.getIsAllRowsSelected()}
      indeterminate={instance.getIsSomeRowsSelected()}
      onChange={instance.getToggleAllRowsSelectedHandler()}
    />
  ),
  cell: ({ row }: { row: Row<TGenerics> }) => (
    <div className="px-1">
      <Checkbox checked={row.getIsSelected()} onChange={row.getToggleSelectedHandler()} />
    </div>
  ),
})
