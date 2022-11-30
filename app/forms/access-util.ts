import type { Actor, IdentityType, Policy, RoleKey } from '@oxide/api'
import { allRoles } from '@oxide/api'
import { capitalize } from '@oxide/util'

type AddUserValues = {
  identityId: string
  roleName: RoleKey | ''
}

export const defaultValues: AddUserValues = {
  identityId: '',
  roleName: '',
}

export const roleItems = allRoles.map((role) => ({ value: role, label: capitalize(role) }))

export const actorToItem = (actor: Actor) => ({
  value: actor.id,
  label: actor.displayName + (actor.identityType === 'silo_group' ? ' [group]' : ''),
})

export type AddRoleModalProps = {
  onDismiss: () => void
  policy: Policy
}

export type EditRoleModalProps = AddRoleModalProps & {
  identityId: string
  identityType: IdentityType
  defaultValues: { roleName: RoleKey }
}
