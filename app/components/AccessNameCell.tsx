import type { CellContext } from '@tanstack/react-table'

import { Badge } from '@oxide/ui'

/**
 * Display the user or group name. If the row is for a group, add a GROUP badge.
 */
export const AccessNameCell = <RowData extends { name: string; type: 'user' | 'group' }>(
  info: CellContext<RowData, string>
) => {
  const name = info.getValue()
  const identityType = info.row.original.type
  return (
    <>
      <span>{name}</span>
      {identityType === 'group' ? (
        <Badge color="neutral" className="ml-2">
          Group
        </Badge>
      ) : null}
    </>
  )
}
