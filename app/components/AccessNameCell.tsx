import type { CellContext } from '@tanstack/react-table'

import type { IdentityType } from '@oxide/api'
import { TableLink } from '@oxide/table'
import { Badge } from '@oxide/ui'

import { pb } from 'app/util/path-builder'

/**
 * Display the user or group name. If the row is for a group, add a GROUP badge.
 */
export const AccessNameCell = <
  RowData extends { id: string; name: string; identityType: IdentityType }
>(
  info: CellContext<RowData, string>
) => {
  const name = info.getValue()
  const identityType = info.row.original.identityType

  if (identityType === 'silo_user') {
    return <span>{name}</span>
  }

  return (
    <>
      <TableLink to={pb.group({ group: info.row.original.id })}>{name}</TableLink>
      <Badge color="neutral" className="ml-2">
        Group
      </Badge>
    </>
  )
}
