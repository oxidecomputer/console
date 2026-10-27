/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useState } from 'react'

import {
  userScopedRoleEntries,
  type Group,
  type Loadable,
  type RoleKey,
  type ScopedRoleEntry,
  type User,
} from '@oxide/api'
import { Person16Icon } from '@oxide/design-system/icons/react'

import { ReadOnlySideModalForm } from '~/components/form/ReadOnlySideModalForm'
import { useCurrentUser } from '~/hooks/use-current-user'
import { type MenuAction } from '~/table/columns/action-col'
import { SideModalFormDocs } from '~/ui/lib/ModalLinks'
import { PropertiesTable } from '~/ui/lib/PropertiesTable'
import { ResourceLabel } from '~/ui/lib/SideModal'

import { IdentityListTable, RoleAssignmentsTable } from './DetailTables'
import { type PolicyScope } from './policy-scope'
import { roleActions, siloPolicyReason } from './roleActions'
import { useCanEditPolicy } from './use-can-edit-policy'

type Props = {
  user: User
  onDismiss: () => void
  userGroups: Loadable<Group[]>
  scope: PolicyScope
}

export function UserDetailsSideModal({ user, onDismiss, userGroups, scope }: Props) {
  const { managedScope, siloPolicy, projectPolicy, managedPolicy, EditModal } = scope
  const { removeRole, groupPath } = scope
  const canEdit = useCanEditPolicy(siloPolicy, projectPolicy)
  const { me } = useCurrentUser()
  // edit modal state; it stacks over this side modal. No default role means
  // adding a direct role.
  const [editing, setEditing] = useState<{ defaultRole?: RoleKey } | null>(null)

  const roleEntries =
    userGroups.status === 'success'
      ? {
          status: userGroups.status,
          data: userScopedRoleEntries(user.id, userGroups.data, siloPolicy, projectPolicy),
        }
      : userGroups

  const addRoleAction = roleActions(managedScope, canEdit).add(() => setEditing({}))
  const hasDirectRole =
    roleEntries.status === 'success' &&
    roleEntries.data.some((e) => e.scope === managedScope && e.source.type === 'direct')

  const makeActions = ({
    roleName,
    scope: entryScope,
    source,
  }: ScopedRoleEntry): MenuAction[] => {
    if (source.type === 'group') {
      return [{ label: 'View group', to: groupPath(source.group.id) }]
    }
    const actions = roleActions(entryScope, canEdit)
    // a direct silo role shown on a project page can only be edited on the silo page
    if (entryScope !== managedScope) {
      return [
        actions.change(() => {}, siloPolicyReason),
        actions.remove({
          name: user.displayName,
          directRole: undefined,
          inheritedReason: siloPolicyReason,
          doRemove: () => removeRole(user.id),
        }),
      ]
    }
    return [
      actions.change(() => setEditing({ defaultRole: roleName })),
      actions.remove({
        name: user.displayName,
        directRole: roleName,
        isSelf: user.id === me.id,
        doRemove: () => removeRole(user.id),
      }),
    ]
  }

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
        <RoleAssignmentsTable
          entries={roleEntries}
          makeActions={makeActions}
          // roles from a group or the silo can't be edited here, so offer to add
          // a direct one
          addRole={
            hasDirectRole
              ? undefined
              : { text: `No ${managedScope} role assigned`, actions: [addRoleAction] }
          }
        />
      </div>
      <div className="mt-6">
        <IdentityListTable
          label="Groups"
          items={userGroups}
          emptyText="Not a member of any groups"
          makeActions={(group) => [{ label: 'View group', to: groupPath(group.id) }]}
        />
      </div>
      <SideModalFormDocs docs={[scope.rolesDocLink]} />
      {editing && (
        <EditModal
          onDismiss={() => setEditing(null)}
          policy={managedPolicy}
          name={user.displayName}
          identityId={user.id}
          identityType="silo_user"
          defaultValues={{ roleName: editing.defaultRole }}
        />
      )}
    </ReadOnlySideModalForm>
  )
}
