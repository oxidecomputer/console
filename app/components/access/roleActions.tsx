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
import { capitalize } from '~/util/str'

/** Scopes whose role assignments are editable from a row action. */
type RoleScope = AccessScope | 'fleet'
type RoleVerb = 'add' | 'change' | 'remove'

/** Row-action label, scoped so it reads e.g. "Change project role". */
export const roleActionLabel = (scope: RoleScope, verb: RoleVerb) =>
  `${capitalize(verb)} ${scope} role`

/** Disabled-action reason shown when the user can't edit roles in this scope. */
export const noRolePermissionReason = (scope: RoleScope, verb: RoleVerb) =>
  `You don't have permission to ${verb} ${scope} roles`

/**
 * The "Remove role" row action: a destructive confirm-delete with the standard
 * role-assignment copy and a self-removal warning. `disabledReason` is the
 * caller's computed reason (undefined when enabled), because what makes removal
 * unavailable differs by surface — no edit permission, or an inherited-only role
 * that must be changed at its source.
 */
export function buildRemoveRoleAction({
  name,
  role,
  scope,
  isSelf,
  disabledReason,
  doRemove,
}: {
  name: string
  role: RoleKey | undefined
  scope: RoleScope
  isSelf: boolean
  disabledReason: string | undefined
  doRemove: () => Promise<unknown>
}): MenuAction {
  return {
    // renamed from "Delete", so the auto destructive styling (keyed on the label
    // "delete") no longer applies — set it explicitly
    label: roleActionLabel(scope, 'remove'),
    className: 'destructive',
    onActivate: confirmDelete({
      doDelete: doRemove,
      label: (
        <span>
          the <HL>{role}</HL> role for <HL>{name}</HL>
        </span>
      ),
      resourceKind: 'role assignment',
      extraContent: isSelf ? `This will remove your own ${scope} access.` : undefined,
    }),
    disabled: disabledReason,
  }
}

type BuildRoleActionsArgs = {
  /** Display name of the user or group, used in the confirm-delete copy. */
  name: string
  /** Direct role on the silo policy, if any. Required to remove a role. */
  directRole: RoleKey | undefined
  /** Effective role including group-inherited, undefined if none. */
  effectiveRole: RoleKey | undefined
  /** Whether the current user can add/change/remove silo roles. */
  canEdit: boolean
  /** Whether this row is the current user (shows a self-removal warning). */
  isSelf: boolean
  /** Open the edit modal, pre-filled with the given role (undefined = assign). */
  openEditModal: (defaultRole: RoleKey | undefined) => void
  /** Remove the direct silo role. */
  doRemove: () => Promise<unknown>
}

/**
 * Row-action menu for a user or group in the silo users/groups tabs. For
 * groups, direct and effective are the same role (groups don't inherit). For
 * users, an inherited (via group) role can be promoted to a direct silo
 * assignment via the change action, pre-filled with the effective role.
 */
export function buildRoleActions({
  name,
  directRole,
  effectiveRole,
  canEdit,
  isSelf,
  openEditModal,
  doRemove,
}: BuildRoleActionsArgs): MenuAction[] {
  // No role at all — direct or inherited.
  if (!effectiveRole) {
    return [
      {
        label: roleActionLabel('silo', 'add'),
        onActivate: () => openEditModal(undefined),
        disabled: !canEdit && noRolePermissionReason('silo', 'add'),
      },
    ]
  }
  return [
    {
      label: roleActionLabel('silo', 'change'),
      // pre-fill with the direct role if any; otherwise the effective role so
      // the modal opens in 'edit' mode showing the role currently in effect
      onActivate: () => openEditModal(directRole ?? effectiveRole),
      disabled: !canEdit && noRolePermissionReason('silo', 'change'),
    },
    buildRemoveRoleAction({
      name,
      role: directRole,
      scope: 'silo',
      isSelf,
      disabledReason: !canEdit
        ? noRolePermissionReason('silo', 'remove')
        : // a direct role is required to remove anything
          !directRole
          ? 'Role is inherited from a group; it can only be removed from the group.'
          : undefined,
      doRemove,
    }),
  ]
}
