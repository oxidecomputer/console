import type { IdentityType, Policy, RoleKey } from '@oxide/api'
import { allRoles } from '@oxide/api'
import { capitalize } from '@oxide/util'

type AddUserValues = {
  userId: string
  roleName: RoleKey | ''
}

export const defaultValues: AddUserValues = {
  userId: '',
  roleName: '',
}

export const roleItems = allRoles.map((role) => ({ value: role, label: capitalize(role) }))

export type AddRoleModalProps = {
  onDismiss: () => void
  policy: Policy
}

export type EditRoleModalProps = AddRoleModalProps & {
  identityId: string
  identityType: IdentityType
  defaultValues: { roleName: RoleKey }
}
