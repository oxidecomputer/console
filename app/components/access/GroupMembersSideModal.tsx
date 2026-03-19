/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useQuery } from '@tanstack/react-query'

import { api, q, type Group, type Policy, type User } from '@oxide/api'
import { PersonGroup16Icon, PersonGroup24Icon } from '@oxide/design-system/icons/react'
import { Badge } from '@oxide/design-system/ui'

import { ReadOnlySideModalForm } from '~/components/form/ReadOnlySideModalForm'
import { RowActions } from '~/table/columns/action-col'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { PropertiesTable } from '~/ui/lib/PropertiesTable'
import { ResourceLabel } from '~/ui/lib/SideModal'
import { Table } from '~/ui/lib/Table'
import { roleColor } from '~/util/access'
import { ALL_ISH } from '~/util/consts'

type Props = {
  group: Group
  onDismiss: () => void
  policy: Policy
}

export function GroupMembersSideModal({ group, onDismiss, policy }: Props) {
  const { data } = useQuery(q(api.userList, { query: { group: group.id, limit: ALL_ISH } }))
  const members = data?.items ?? []

  const assignment = policy.roleAssignments.find((ra) => ra.identityId === group.id)

  return (
    <ReadOnlySideModalForm
      title="Group"
      subtitle={
        <ResourceLabel>
          <PersonGroup16Icon /> {group.displayName}
        </ResourceLabel>
      }
      onDismiss={onDismiss}
      animate
    >
      <PropertiesTable>
        <PropertiesTable.IdRow id={group.id} />
        <PropertiesTable.DateRow label="Created" date={group.timeCreated} />
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
            {!assignment ? (
              <Table.Row>
                <Table.Cell colSpan={2} className="text-secondary">
                  No roles assigned
                </Table.Cell>
              </Table.Row>
            ) : (
              <Table.Row>
                <Table.Cell>
                  <Badge color={roleColor[assignment.roleName]}>
                    silo.{assignment.roleName}
                  </Badge>
                </Table.Cell>
                <Table.Cell>Assigned</Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </table>
      </div>
      <div className="mt-6">
        {members.length === 0 ? (
          <EmptyMessage
            icon={<PersonGroup24Icon />}
            title="No members"
            body="This group has no members"
          />
        ) : (
          <table className="ox-table text-sans-md w-full border-separate">
            <Table.Header>
              <Table.HeaderRow>
                <Table.HeadCell>Members</Table.HeadCell>
                <Table.HeadCell />
              </Table.HeaderRow>
            </Table.Header>
            <Table.Body>
              {members.map((member: User) => (
                <Table.Row key={member.id}>
                  <Table.Cell>{member.displayName}</Table.Cell>
                  <Table.Cell className="action-col w-10 *:p-0">
                    <RowActions id={member.id} />
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </table>
        )}
      </div>
    </ReadOnlySideModalForm>
  )
}
