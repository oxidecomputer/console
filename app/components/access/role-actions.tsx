/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { type AccessScope, type RoleKey } from '@oxide/api'

import { HL } from '~/components/HL'
import { confirmAction } from '~/stores/confirm-action'
import { type MenuAction } from '~/table/columns/action-col'
import { Message } from '~/ui/lib/Message'
import { capitalize } from '~/util/str'

type RoleScope = AccessScope | 'fleet'
type RoleVerb = 'add' | 'change' | 'remove'

const roleActionLabel = (scope: RoleScope, verb: RoleVerb) =>
  `${capitalize(verb)} ${scope} role`

/** Disabled reason for a silo role shown on a project page */
export const siloPolicyReason = 'This role comes from the silo policy'

/** Consistently labeled row actions for the role assignments of one scope */
export const roleActions = (scope: RoleScope, canEdit: boolean) => {
  const noPermission = (verb: RoleVerb) =>
    canEdit ? undefined : `You don't have permission to ${verb} ${scope} roles`

  const edit = (verb: 'add' | 'change', onActivate: () => void): MenuAction => ({
    label: roleActionLabel(scope, verb),
    onActivate,
    disabled: noPermission(verb),
  })

  return {
    add: (onActivate: () => void) => edit('add', onActivate),
    change: (onActivate: () => void) => edit('change', onActivate),

    /**
     * Disabled change and remove actions for a role that can't be edited from
     * this page. `reason` tells the user where it comes from.
     */
    inherited: (reason: string): MenuAction[] =>
      (['change', 'remove'] as const).map((verb) => ({
        label: roleActionLabel(scope, verb),
        onActivate: () => {},
        disabled: noPermission(verb) ?? reason,
      })),

    remove({
      name,
      directRole,
      isSelf = false,
      keepsEditAccess = false,
      doRemove,
    }: {
      name: string
      directRole: RoleKey
      /** The current user holds this assignment, directly or through a group */
      isSelf?: boolean
      /** The current user's other roles still let them edit this scope's roles */
      keepsEditAccess?: boolean
      doRemove: () => Promise<unknown>
    }): MenuAction {
      const disabled = noPermission('remove')

      // only admin grants permission to edit roles in the scope it's removed from
      const isRemovingOwnAdmin = isSelf && directRole === 'admin' && !keepsEditAccess

      return {
        label: roleActionLabel(scope, 'remove'),
        // match RowActions' Delete behavior: destructive styling only while enabled
        className: disabled ? undefined : 'destructive',
        onActivate: () =>
          confirmAction({
            doAction: doRemove,
            modalTitle: 'Remove role assignment',
            modalContent: (
              <div className="space-y-2">
                <p>
                  Are you sure you want to remove the <HL>{directRole}</HL> role for{' '}
                  <HL>{name}</HL>?
                </p>
                {/* "could" because the same access may also come from a group */}
                {isRemovingOwnAdmin && (
                  <Message
                    variant="error"
                    content={`This could remove your own ${scope} access.`}
                  />
                )}
              </div>
            ),
            errorTitle: 'Could not remove role assignment',
            actionType: 'danger',
            confirmText: isRemovingOwnAdmin ? name || 'delete my own role' : undefined,
          }),
        disabled,
      }
    },
  }
}
