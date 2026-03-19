/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import * as R from 'remeda'

import {
  roleOrder,
  userScopedRoleEntries,
  type Group,
  type Policy,
  type User,
} from '@oxide/api'
import { Person16Icon } from '@oxide/design-system/icons/react'
import { Badge } from '@oxide/design-system/ui'

import { ReadOnlySideModalForm } from '~/components/form/ReadOnlySideModalForm'
import { RowActions } from '~/table/columns/action-col'
import { PropertiesTable } from '~/ui/lib/PropertiesTable'
import { ResourceLabel } from '~/ui/lib/SideModal'
import { Table } from '~/ui/lib/Table'
import { roleColor } from '~/util/access'

type Props = {
  user: User
  onDismiss: () => void
  userGroups: Group[]
  policy: Policy
}

export function UserDetailsSideModal({ user, onDismiss, userGroups, policy }: Props) {
  const roleEntries = R.sortBy(
    userScopedRoleEntries(user.id, userGroups, policy),
    (e) => roleOrder[e.roleName]
  )

  return (
    <ReadOnlySideModalForm
      title="User"
      subtitle={
        <ResourceLabel>
          <Person16Icon /> {user.displayName}
        </ResourceLabel>
      }
      onDismiss={onDismiss}
      animate
    >
      <PropertiesTable>
        <PropertiesTable.IdRow id={user.id} />
        <PropertiesTable.DateRow label="Created" date={user.timeCreated} />
      </PropertiesTable>
      <div className="mt-6">
        <table className="ox-table text-sans-md w-full border-separate">
          <Table.Header>
            <Table.HeaderRow>
              <Table.HeadCell>Role</Table.HeadCell>
              <Table.HeadCell>Source</Table.HeadCell>
            </Table.HeaderRow>
          </Table.Header>
          <Table.Body>
            {roleEntries.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={2} className="text-secondary">
                  No roles assigned
                </Table.Cell>
              </Table.Row>
            ) : (
              roleEntries.map(({ roleName, source }, i) => (
                <Table.Row key={i}>
                  <Table.Cell>
                    <Badge color={roleColor[roleName]}>silo.{roleName}</Badge>
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
      </div>
      <div className="mt-6">
        <table className="ox-table text-sans-md w-full border-separate">
          <Table.Header>
            <Table.HeaderRow>
              <Table.HeadCell>Groups</Table.HeadCell>
              <Table.HeadCell />
            </Table.HeaderRow>
          </Table.Header>
          <Table.Body>
            {userGroups.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={2} className="text-secondary">
                  Not a member of any groups
                </Table.Cell>
              </Table.Row>
            ) : (
              userGroups.map((group) => (
                <Table.Row key={group.id}>
                  <Table.Cell>{group.displayName}</Table.Cell>
                  <Table.Cell className="action-col w-10 *:p-0">
                    <RowActions id={group.id} />
                  </Table.Cell>
                </Table.Row>
              ))
            )}
          </Table.Body>
        </table>
      </div>
    </ReadOnlySideModalForm>
  )
}
