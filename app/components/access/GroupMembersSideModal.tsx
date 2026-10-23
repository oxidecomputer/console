/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useQuery } from '@tanstack/react-query'

import {
  groupMemberList,
  userScopedRoleEntries,
  type Group,
  type Loadable,
  type Policy,
  type User,
} from '@oxide/api'
import { PersonGroup16Icon } from '@oxide/design-system/icons/react'

import { ReadOnlySideModalForm } from '~/components/form/ReadOnlySideModalForm'
import { PropertiesTable } from '~/ui/lib/PropertiesTable'
import { ResourceLabel } from '~/ui/lib/SideModal'

import { IdentityListTable, RoleAssignmentsTable } from './DetailTables'

type Props = {
  group: Group
  onDismiss: () => void
  siloPolicy: Policy
  projectPolicy?: Policy
}

export function GroupMembersSideModal({
  group,
  onDismiss,
  siloPolicy,
  projectPolicy,
}: Props) {
  // not awaited by every loader that leads here, so it may still be loading
  const membersQuery = useQuery(groupMemberList({ groupId: group.id }))
  const members: Loadable<User[]> =
    membersQuery.status === 'success'
      ? { status: 'success', data: membersQuery.data.items }
      : { status: membersQuery.status }

  // groups never inherit, so passing no groups yields the group's direct roles
  const roleEntries = {
    status: 'success',
    data: userScopedRoleEntries(group.id, [], siloPolicy, projectPolicy),
  } as const

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
        <RoleAssignmentsTable entries={roleEntries} />
      </div>
      <div className="mt-6">
        <IdentityListTable
          label="Members"
          items={members}
          emptyText="This group has no members"
        />
      </div>
    </ReadOnlySideModalForm>
  )
}
