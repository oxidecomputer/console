import type { CellContext } from '@tanstack/react-table'

import { Badge } from '@oxide/ui'

/**
 * Display the user or group name. If the row is for a group, add a GROUP badge.
 */
export const AccessNameCell = <TData extends { name: string; type: 'user' | 'group' }>(
  info: CellContext<TData, string>
) => {
  const name = info.getValue()
  const identityType = info.row.original.type
  return (
    <>
      <span className="mr-2">{name}</span>
      {identityType === 'group' ? <Badge color="neutral">Group</Badge> : null}
    </>
  )
}
