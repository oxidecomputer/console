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
const roleActionLabel = (scope: RoleScope, verb: RoleVerb) =>
  `${capitalize(verb)} ${scope} role`

/** Disabled-action reason shown when the user can't edit roles in this scope. */
const noRolePermissionReason = (scope: RoleScope, verb: RoleVerb) =>
  `You don't have permission to ${verb} ${scope} roles`

/**
 * Builds consistently labeled actions for one scope. Callers choose add versus
 * change because the meaning of direct and inherited roles varies by surface.
 */
export const roleActions = (scope: RoleScope, canEdit: boolean) => {
  const edit = (verb: Exclude<RoleVerb, 'remove'>, onActivate: () => void): MenuAction => ({
    label: roleActionLabel(scope, verb),
    onActivate,
    disabled: !canEdit && noRolePermissionReason(scope, verb),
  })

  return {
    add: (onActivate: () => void) => edit('add', onActivate),
    change: (onActivate: () => void) => edit('change', onActivate),

    /** A destructive remove action with standard confirmation copy. */
    remove({
      name,
      directRole,
      isSelf = false,
      inheritedReason,
      doRemove,
    }: {
      name: string
      /** Direct assignment to remove, absent when the displayed role is inherited. */
      directRole: RoleKey | undefined
      isSelf?: boolean
      /** Explains where an inherited role must be removed instead. */
      inheritedReason?: string
      doRemove: () => Promise<unknown>
    }): MenuAction {
      const disabled = !canEdit
        ? noRolePermissionReason(scope, 'remove')
        : // if role is not direct, it is inherited from a silo or group, so
          // we use inheritedReason to direct them to the appropriate spot to
          // remove it
          !directRole
          ? inheritedReason
          : undefined

      return {
        // Match RowActions' Delete behavior: destructive styling only while enabled.
        label: roleActionLabel(scope, 'remove'),
        className: disabled ? undefined : 'destructive',
        onActivate: confirmDelete({
          doDelete: doRemove,
          label: (
            <span>
              the <HL>{directRole}</HL> role for <HL>{name}</HL>
            </span>
          ),
          resourceKind: 'role assignment',
          extraContent: isSelf ? `This will remove your own ${scope} access.` : undefined,
        }),
        disabled,
      }
    },
  }
}
