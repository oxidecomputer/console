import type { CellContext } from '@tanstack/react-table'

import type { RoleKey } from '@oxide/api'
import { Badge } from '@oxide/ui'

/**
 * Highlight the "effective" role in green, others gray.
 *
 * Example: User has collab on org and viewer on project. Collab supersedes
 * because it is the "stronger" role, i.e., it strictly includes the perms on
 * viewer. So collab is highlighted as the "effective" role.
 */
export const RoleBadgeCell = <RowData extends { effectiveRole: RoleKey }>(
  info: CellContext<RowData, RoleKey>
) => {
  const cellRole = info.getValue()
  if (!cellRole) return null
  const effectiveRole = info.row.original.effectiveRole
  return (
    <Badge color={effectiveRole === cellRole ? 'default' : 'neutral'}>{cellRole}</Badge>
  )
}
