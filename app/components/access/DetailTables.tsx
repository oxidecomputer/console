/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { sortRoleEntries, type ScopedRoleEntry } from '@oxide/api'
import { Badge } from '@oxide/design-system/ui'

import { RowActions } from '~/table/columns/action-col'
import { Table } from '~/ui/lib/Table'
import { roleColor } from '~/util/access'

/**
 * Role/Source table shared by the user and group detail side modals. Entries
 * come from `userScopedRoleEntries` (groups pass an empty groups list, so their
 * entries are all direct). Sorted strongest-first.
 */
export function RoleAssignmentsTable({ entries }: { entries: ScopedRoleEntry[] }) {
  const sorted = sortRoleEntries(entries)
  return (
    <table className="ox-table text-sans-md w-full border-separate">
      <Table.Header>
        <Table.HeaderRow>
          <Table.HeadCell>Role</Table.HeadCell>
          <Table.HeadCell>Source</Table.HeadCell>
        </Table.HeaderRow>
      </Table.Header>
      <Table.Body>
        {sorted.length === 0 ? (
          <Table.Row>
            <Table.Cell colSpan={2} className="text-secondary">
              No roles assigned
            </Table.Cell>
          </Table.Row>
        ) : (
          sorted.map(({ roleName, scope, source }, i) => (
            <Table.Row key={i}>
              <Table.Cell>
                <Badge color={roleColor[roleName]}>
                  {scope}.{roleName}
                </Badge>
              </Table.Cell>
              <Table.Cell>
                {source.type === 'direct' && 'Assigned'}
                {source.type === 'group' && `via ${source.group.displayName}`}
              </Table.Cell>
            </Table.Row>
          ))
        )}
      </Table.Body>
    </table>
  )
}

/**
 * List of related identities (a group's members, or a user's groups) with a
 * Copy ID row action. Shared by the user and group detail side modals.
 */
export function IdentityListTable({
  label,
  items,
  emptyText,
}: {
  label: string
  items: { id: string; displayName: string }[]
  emptyText: string
}) {
  return (
    <table className="ox-table text-sans-md w-full border-separate">
      <Table.Header>
        <Table.HeaderRow>
          <Table.HeadCell>{label}</Table.HeadCell>
          <Table.HeadCell />
        </Table.HeaderRow>
      </Table.Header>
      <Table.Body>
        {items.length === 0 ? (
          <Table.Row>
            <Table.Cell colSpan={2} className="text-secondary">
              {emptyText}
            </Table.Cell>
          </Table.Row>
        ) : (
          items.map((item) => (
            <Table.Row key={item.id}>
              <Table.Cell>{item.displayName}</Table.Cell>
              <Table.Cell className="action-col w-10 *:p-0">
                <RowActions id={item.id} />
              </Table.Cell>
            </Table.Row>
          ))
        )}
      </Table.Body>
    </table>
  )
}
