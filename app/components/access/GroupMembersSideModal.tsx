/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useQuery } from '@tanstack/react-query'
import * as R from 'remeda'

import { api, q, roleOrder, type Group, type Policy, type User } from '@oxide/api'
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

type ScopedGroupPolicy = {
  scope: 'silo' | 'project'
  policy: Policy
  /** Label for the Source column, e.g. "Assigned" or "Inherited from silo" */
  sourceLabel: string
}

type Props = {
  group: Group
  onDismiss: () => void
  scopedPolicies: ScopedGroupPolicy[]
}

export function GroupMembersSideModal({ group, onDismiss, scopedPolicies }: Props) {
  const { data } = useQuery(q(api.userList, { query: { group: group.id, limit: ALL_ISH } }))
  const members = data?.items ?? []

  const roleEntries = R.sortBy(
    scopedPolicies.flatMap(({ scope, policy, sourceLabel }) => {
      const assignment = policy.roleAssignments.find((ra) => ra.identityId === group.id)
      return assignment ? [{ scope, roleName: assignment.roleName, sourceLabel }] : []
    }),
    (e) => roleOrder[e.roleName]
  )

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
            {roleEntries.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={2} className="text-secondary">
                  No roles assigned
                </Table.Cell>
              </Table.Row>
            ) : (
              roleEntries.map(({ scope, roleName, sourceLabel }, i) => (
                <Table.Row key={i}>
                  <Table.Cell>
                    <Badge color={roleColor[roleName]}>
                      {scope}.{roleName}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>{sourceLabel}</Table.Cell>
                </Table.Row>
              ))
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
