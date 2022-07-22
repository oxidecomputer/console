import type { Row, TableInstance } from '@tanstack/react-table'

import { Checkbox, Radio } from '@oxide/ui'

// only needs to be a function because of the generic params
export const getSelectCol = <TGenerics,>() => ({
  id: 'select',
  meta: { thClassName: 'w-10' },
  header: '',
  cell: ({ row }: { row: Row<TGenerics>; instance: TableInstance<TGenerics> }) => {
    // `onChange` is empty to suppress react warning. Actual trigger happens in `Table.tsx`
    return <Radio checked={row.getIsSelected()} onChange={() => {}} />
  },
})

export const getMultiSelectCol = <TGenerics,>() => ({
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
    // `onChange` is empty to suppress react warning. Actual trigger happens in `Table.tsx`
    <Checkbox checked={row.getIsSelected()} onChange={() => {}} />
  ),
})
