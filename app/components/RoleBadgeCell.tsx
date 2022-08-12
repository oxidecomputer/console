import type { CoreColumnDef } from '@tanstack/react-table'

import type { OrganizationRole, ProjectRole, SiloRole } from '@oxide/api'
import { Badge } from '@oxide/ui'

// I think there are changes in RT 8.4+ that make this less ridiculous
type CellInfo<TRow, TValue> = Parameters<
  Exclude<CoreColumnDef<TRow, TValue>['cell'], string | undefined>
>[0]

type Role = SiloRole | OrganizationRole | ProjectRole

/**
 * Highlight the "effective" role in green, others gray.
 *
 * Example: User has collab on org and viewer on project. Collab supersedes
 * because it is the "stronger" role, i.e., it strictly includes the perms on
 * viewer. So collab is highlighted as the "effective" role.
 */
export const RoleBadgeCell = <TRow extends { effectiveRole: Role }, TValue extends Role>(
  info: CellInfo<TRow, TValue>
) => {
  const cellRole = info.getValue()
  if (!cellRole) return null
  const effectiveRole = info.row.original.effectiveRole
  return (
    <Badge color={effectiveRole === cellRole ? 'default' : 'neutral'}>{cellRole}</Badge>
  )
}
