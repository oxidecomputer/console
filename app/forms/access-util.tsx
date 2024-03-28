/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import {
  allRoles,
  type Actor,
  type IdentityType,
  type Policy,
  type RoleKey,
} from '@oxide/api'

import { Badge } from '~/ui/lib/Badge'
import { type ListboxItem } from '~/ui/lib/Listbox'
import { capitalize } from '~/util/str'

type AddUserValues = {
  identityId: string
  roleName: RoleKey | ''
}

export const defaultValues: AddUserValues = {
  identityId: '',
  roleName: '',
}

export const roleItems = allRoles.map((role) => ({ value: role, label: capitalize(role) }))

export const actorToItem = (actor: Actor): ListboxItem => ({
  value: actor.id,
  label: (
    <>
      {actor.displayName}
      {actor.identityType === 'silo_group' && (
        <Badge color="neutral" className="ml-2">
          Group
        </Badge>
      )}
    </>
  ),
  labelString: actor.displayName,
})

export type AddRoleModalProps = {
  onDismiss: () => void
  policy: Policy
}

export type EditRoleModalProps = AddRoleModalProps & {
  name?: string
  identityId: string
  identityType: IdentityType
  defaultValues: { roleName: RoleKey }
}
