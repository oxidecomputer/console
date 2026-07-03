/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { userScopedRoleEntries, type Group, type ScopedPolicy, type User } from '@oxide/api'
import { Person16Icon } from '@oxide/design-system/icons/react'

import { ReadOnlySideModalForm } from '~/components/form/ReadOnlySideModalForm'
import { PropertiesTable } from '~/ui/lib/PropertiesTable'
import { ResourceLabel } from '~/ui/lib/SideModal'

import { IdentityListTable, RoleAssignmentsTable } from './DetailTables'

type Props = {
  user: User
  onDismiss: () => void
  userGroups: Group[]
  scopedPolicies: ScopedPolicy[]
}

export function UserDetailsSideModal({
  user,
  onDismiss,
  userGroups,
  scopedPolicies,
}: Props) {
  const roleEntries = userScopedRoleEntries(user.id, userGroups, scopedPolicies)

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
        <RoleAssignmentsTable entries={roleEntries} />
      </div>
      <div className="mt-6">
        <IdentityListTable
          label="Groups"
          items={userGroups}
          emptyText="Not a member of any groups"
        />
      </div>
    </ReadOnlySideModalForm>
  )
}
