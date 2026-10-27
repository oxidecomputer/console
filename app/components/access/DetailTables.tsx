/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { match } from 'ts-pattern'

import { sortRoleEntries, type Loadable, type ScopedRoleEntry } from '@oxide/api'
import { Badge } from '@oxide/design-system/ui'

import { SkeletonCell } from '~/table/cells/EmptyCell'
import { RowActions, type MenuAction } from '~/table/columns/action-col'
import { Table } from '~/ui/lib/Table'
import { roleColor } from '~/util/access'

/**
 * Role/Source table shared by the user and group detail side modals. Entries
 * come from `userScopedRoleEntries` (groups pass an empty groups list, so their
 * entries are all direct). Sorted strongest-first. A user's entries depend on
 * group memberships, so they can be pending or failed. Passing `makeActions`
 * adds a row actions column. Passing `addRole` adds a row with a menu for
 * adding a direct role: "No roles assigned" when there are no entries,
 * otherwise `addRole.text` below them.
 */
export function RoleAssignmentsTable({
  entries,
  makeActions,
  addRole,
}: {
  entries: Loadable<ScopedRoleEntry[]>
  makeActions?: (entry: ScopedRoleEntry) => MenuAction[]
  addRole?: { text: string; actions: MenuAction[] }
}) {
  const colSpan = makeActions ? 3 : 2
  return (
    <table className="ox-table text-sans-md w-full border-separate">
      <Table.Header>
        <Table.HeaderRow>
          <Table.HeadCell>Role</Table.HeadCell>
          <Table.HeadCell>Source</Table.HeadCell>
          {makeActions && <Table.HeadCell />}
        </Table.HeaderRow>
      </Table.Header>
      <Table.Body>
        {match(entries)
          .with({ status: 'pending' }, () => <LoadingRow colSpan={colSpan} />)
          .with({ status: 'error' }, () => (
            <MessageRow colSpan={colSpan} error>
              Could not load group memberships
            </MessageRow>
          ))
          .with({ status: 'success' }, ({ data }) => (
            <>
              {sortRoleEntries(data).map((entry, i) => (
                <Table.Row key={i}>
                  <Table.Cell>
                    <Badge color={roleColor[entry.roleName]}>
                      {entry.scope}.{entry.roleName}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    {entry.source.type === 'direct' && 'Assigned'}
                    {entry.source.type === 'group' &&
                      `via ${entry.source.group.displayName}`}
                  </Table.Cell>
                  {makeActions && (
                    <Table.Cell className="action-col w-10 *:p-0">
                      <RowActions actions={makeActions(entry)} />
                    </Table.Cell>
                  )}
                </Table.Row>
              ))}
              {makeActions && addRole ? (
                <Table.Row>
                  <Table.Cell colSpan={2} className="text-secondary">
                    {data.length === 0 ? 'No roles assigned' : addRole.text}
                  </Table.Cell>
                  <Table.Cell className="action-col w-10 *:p-0">
                    <RowActions actions={addRole.actions} />
                  </Table.Cell>
                </Table.Row>
              ) : (
                data.length === 0 && (
                  <MessageRow colSpan={colSpan}>No roles assigned</MessageRow>
                )
              )}
            </>
          ))
          .exhaustive()}
      </Table.Body>
    </table>
  )
}

type Identity = { id: string; displayName: string }

/**
 * List of related identities (a group's members, or a user's groups) with a
 * Copy ID row action, plus any from `makeActions`. Shared by the user and group
 * detail side modals.
 */
export function IdentityListTable({
  label,
  items,
  emptyText,
  makeActions,
}: {
  label: string
  items: Loadable<Identity[]>
  emptyText: string
  makeActions?: (item: Identity) => MenuAction[]
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
        {match(items)
          .with({ status: 'pending' }, () => <LoadingRow colSpan={2} />)
          .with({ status: 'error' }, () => (
            <MessageRow colSpan={2} error>
              Could not load {label.toLowerCase()}
            </MessageRow>
          ))
          .with({ status: 'success' }, ({ data }) =>
            data.length === 0 ? (
              <MessageRow colSpan={2}>{emptyText}</MessageRow>
            ) : (
              data.map((item) => (
                <Table.Row key={item.id}>
                  <Table.Cell>{item.displayName}</Table.Cell>
                  <Table.Cell className="action-col w-10 *:p-0">
                    <RowActions id={item.id} actions={makeActions?.(item)} />
                  </Table.Cell>
                </Table.Row>
              ))
            )
          )
          .exhaustive()}
      </Table.Body>
    </table>
  )
}

const LoadingRow = ({ colSpan }: { colSpan: number }) => (
  <Table.Row>
    <Table.Cell colSpan={colSpan}>
      <SkeletonCell />
    </Table.Cell>
  </Table.Row>
)

const MessageRow = ({
  colSpan,
  error,
  children,
}: {
  colSpan: number
  error?: boolean
  children: React.ReactNode
}) => (
  <Table.Row>
    <Table.Cell colSpan={colSpan} className={error ? 'text-error' : 'text-secondary'}>
      {children}
    </Table.Cell>
  </Table.Row>
)
