/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

import {
  groupMemberList,
  groupScopedRoleEntries,
  scopedRoleEntries,
  type Group,
  type Loadable,
  type RoleKey,
  type ScopedRoleEntry,
  type User,
} from '@oxide/api'
import { PersonGroup16Icon } from '@oxide/design-system/icons/react'

import { ReadOnlySideModalForm } from '~/components/form/ReadOnlySideModalForm'
import { useCurrentUser } from '~/hooks/use-current-user'
import { type MenuAction } from '~/table/columns/action-col'
import { SideModalFormDocs } from '~/ui/lib/ModalLinks'
import { PropertiesTable } from '~/ui/lib/PropertiesTable'
import { ResourceLabel } from '~/ui/lib/SideModal'
import { docLinks } from '~/util/links'

import { EffectiveRole, IdentityListTable, RoleAssignmentsTable } from './DetailTables'
import { type PolicyScope } from './policy-scope'
import { roleActions, siloPolicyReason } from './role-actions'
import { canEditScope, useCanEditPolicy } from './use-can-edit-policy'

type Props = {
  group: Group
  onDismiss: () => void
  scope: PolicyScope
}

export function GroupMembersSideModal({ group, onDismiss, scope }: Props) {
  const { managedScope, siloPolicy, projectPolicy, managedPolicy, EditModal } = scope
  const { removeRole, userPath } = scope
  const canEdit = useCanEditPolicy(siloPolicy, projectPolicy)
  const { me, myGroups } = useCurrentUser()
  // no default role means adding one
  const [editing, setEditing] = useState<{ defaultRole?: RoleKey } | null>(null)

  // not awaited by every loader that leads here, so it may still be loading
  const membersQuery = useQuery(groupMemberList({ groupId: group.id }))
  const members: Loadable<User[]> =
    membersQuery.status === 'success'
      ? { status: 'success', data: membersQuery.data.items }
      : { status: membersQuery.status }

  const roleEntries = {
    status: 'success',
    data: groupScopedRoleEntries(group.id, siloPolicy, projectPolicy),
  } as const

  const addRoleAction = roleActions(managedScope, canEdit).add(() => setEditing({}))
  const hasManagedRole = roleEntries.data.some((e) => e.scope === managedScope)

  // A member who removes the group's role loses it too. For the silo this
  // misses fleet-derived access (see canEditScope), so it can warn needlessly.
  const isSelf = myGroups.items.some((g) => g.id === group.id)
  const keepsEditAccess =
    isSelf &&
    canEditScope(
      scopedRoleEntries(me.id, myGroups.items, siloPolicy, projectPolicy).filter(
        (e) =>
          !(
            e.scope === managedScope &&
            e.source.type === 'group' &&
            e.source.group.id === group.id
          )
      ),
      managedScope
    )

  const makeRoleActions = ({ roleName, scope: entryScope }: ScopedRoleEntry) => {
    const actions = roleActions(entryScope, canEdit)
    // a silo role shown on a project page can only be edited on the silo page
    if (entryScope !== managedScope) return actions.inherited(siloPolicyReason)
    return [
      actions.change(() => setEditing({ defaultRole: roleName })),
      actions.remove({
        name: group.displayName,
        directRole: roleName,
        isSelf,
        keepsEditAccess,
        doRemove: () => removeRole(group.id),
      }),
    ]
  }

  const makeMemberActions = (member: { id: string }): MenuAction[] => [
    { label: 'View user', to: userPath(member.id) },
  ]

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
        <PropertiesTable.Row label="Effective role">
          <EffectiveRole entries={roleEntries} />
        </PropertiesTable.Row>
      </PropertiesTable>
      <div className="mt-6">
        <RoleAssignmentsTable
          entries={roleEntries}
          makeActions={makeRoleActions}
          // on a project page, a group with only a silo role can still get a project role
          addRole={
            hasManagedRole
              ? undefined
              : { text: `No ${managedScope} role assigned`, actions: [addRoleAction] }
          }
        />
      </div>
      <div className="mt-6">
        <IdentityListTable
          label="Members"
          items={members}
          emptyText="This group has no members"
          makeActions={makeMemberActions}
        />
      </div>
      <SideModalFormDocs docs={[scope.rolesDocLink, docLinks.managingGroups]} />
      {editing && (
        <EditModal
          onDismiss={() => setEditing(null)}
          policy={managedPolicy}
          name={group.displayName}
          identityId={group.id}
          identityType="silo_group"
          defaultValues={{ roleName: editing.defaultRole }}
          isOwnGroup={isSelf}
          keepsEditAccess={keepsEditAccess}
        />
      )}
    </ReadOnlySideModalForm>
  )
}
