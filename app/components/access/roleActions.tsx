/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { type AccessScope, type RoleKey } from '@oxide/api'

import { HL } from '~/components/HL'
import { confirmDelete } from '~/stores/confirm-delete'
import { type MenuAction } from '~/table/columns/action-col'

/** Verb labels for the row actions, scoped so the project tab reads "project role". */
function roleActionLabels(managedScope: AccessScope) {
  const isProject = managedScope === 'project'
  return {
    assign: isProject ? 'Assign project role' : 'Assign role',
    change: isProject ? 'Change project role' : 'Change role',
    remove: isProject ? 'Remove project role' : 'Remove role',
  }
}

type BuildRoleActionsArgs = {
  /** Display name of the user or group, used in the confirm-delete copy. */
  name: string
  /** Scope managed by this tab; determines labels and project-specific framing. */
  managedScope: AccessScope
  /** Direct role on the managed policy, if any. Required to remove a role. */
  directManagedRole: RoleKey | undefined
  /** Effective role across all scopes, or null if the identity has no role. */
  effective: { role: RoleKey } | null
  /** Disabled reason shown when there's no direct managed role to remove. */
  inheritedReason: string
  /** Open the edit modal, pre-filled with the given role (undefined = assign). */
  openEditModal: (defaultRole: RoleKey | undefined) => void
  /** Remove the direct managed role. */
  doRemove: () => Promise<unknown>
}

/**
 * Row-action menu for a user or group in the access tabs. Identical logic for
 * both; callers supply how the effective role was computed and the
 * inherited-role message (which differs because a user can inherit via a group
 * or the silo, while a group only inherits from another scope).
 */
export function buildRoleActions({
  name,
  managedScope,
  directManagedRole,
  effective,
  inheritedReason,
  openEditModal,
  doRemove,
}: BuildRoleActionsArgs): MenuAction[] {
  const labels = roleActionLabels(managedScope)
  const removeAction: MenuAction = {
    label: directManagedRole ? labels.remove : 'Remove role',
    onActivate: confirmDelete({
      doDelete: doRemove,
      label: (
        <span>
          the <HL>{directManagedRole}</HL> role for <HL>{name}</HL>
        </span>
      ),
      resourceKind: 'role assignment',
    }),
    // a direct role on the managed policy is required to remove anything
    disabled: !directManagedRole && inheritedReason,
  }
  // No role at all — direct or inherited.
  if (!effective) {
    return [{ label: labels.assign, onActivate: () => openEditModal(undefined) }]
  }
  // For the project tab, an inherited silo role doesn't give us anything to
  // "change" on the project policy — frame it as assigning a project role. For
  // the silo tab, an inherited (via group) role can be promoted to a direct
  // silo assignment via "Change role" pre-filled with the effective role.
  if (managedScope === 'project' && !directManagedRole) {
    return [
      { label: labels.assign, onActivate: () => openEditModal(undefined) },
      removeAction,
    ]
  }
  // Pre-fill with the direct managed role if any; otherwise the effective role
  // so the modal opens in 'edit' mode showing the role currently in effect.
  const defaultRole = directManagedRole ?? effective.role
  return [
    { label: labels.change, onActivate: () => openEditModal(defaultRole) },
    removeAction,
  ]
}
