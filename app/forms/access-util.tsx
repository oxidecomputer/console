/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { Control, FieldPath, FieldValues } from 'react-hook-form'
import * as R from 'remeda'

import {
  allRoles,
  fleetRoles,
  type Actor,
  type FleetRole,
  type IdentityType,
  type Policy,
  type RoleKey,
} from '@oxide/api'
import { Badge } from '@oxide/design-system/ui'

import { RadioFieldDyn } from '~/components/form/fields/RadioField'
import { type ListboxItem } from '~/ui/lib/Listbox'
import { Message } from '~/ui/lib/Message'
import { Radio } from '~/ui/lib/Radio'
import { docLinks } from '~/util/links'
import { capitalize } from '~/util/str'

type AddUserValues = {
  identityId: string
  roleName: RoleKey
}

export const defaultValues: AddUserValues = {
  identityId: '',
  roleName: 'viewer',
}

// Role descriptions for project-level roles
const projectRoleDescriptions: Record<RoleKey, string> = {
  admin: 'Control all aspects of the project',
  collaborator: 'Manage all project resources, including networking',
  limited_collaborator: 'Manage project resources except networking configuration',
  viewer: 'View resources within the project',
}

// Role descriptions for silo-level roles
const siloRoleDescriptions: Record<RoleKey, string> = {
  admin: 'Control all aspects of the silo',
  collaborator: 'Create and administer projects',
  limited_collaborator: 'Manage project resources except networking configuration',
  viewer: 'View resources within the silo',
}

// Role descriptions for fleet-level roles
const fleetRoleDescriptions: Record<FleetRole, string> = {
  admin: 'Control all aspects of the fleet',
  collaborator: 'Administer silos and fleet-level resources',
  viewer: 'View fleet-level resources',
}

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
  selectedLabel: actor.displayName,
})

export type AddRoleModalProps<Role extends RoleKey = RoleKey> = {
  onDismiss: () => void
  policy: Policy<Role>
}

export type EditRoleModalProps<Role extends RoleKey = RoleKey> = AddRoleModalProps<Role> & {
  name?: string
  identityId: string
  identityType: IdentityType
  defaultValues: { roleName: Role }
}

const AccessDocs = () => (
  <a href={docLinks.access.href} target="_blank" rel="noreferrer">
    {docLinks.access.linkText}
  </a>
)
export function RoleRadioField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  name,
  control,
  scope,
}: {
  name: TName
  control: Control<TFieldValues>
  scope: 'Fleet' | 'Silo' | 'Project'
}) {
  const roles = R.reverse(scope === 'Fleet' ? fleetRoles : allRoles)
  const roleDescriptions: Partial<Record<RoleKey, string>> =
    scope === 'Fleet'
      ? fleetRoleDescriptions
      : scope === 'Silo'
        ? siloRoleDescriptions
        : projectRoleDescriptions
  return (
    <>
      <RadioFieldDyn
        name={name}
        label={`${scope} role`}
        required
        control={control}
        column
        className="mt-2"
      >
        {roles.map((role) => (
          <Radio name="roleName" key={role} value={role} alignTop>
            <div className="text-sans-md text-raise">
              {capitalize(role).replace('_', ' ')}
            </div>
            <div className="text-sans-sm text-secondary">{roleDescriptions[role]}</div>
          </Radio>
        ))}
      </RadioFieldDyn>
      <Message
        variant="info"
        content={
          scope === 'Fleet' ? (
            <>
              Fleet roles grant access to fleet-level resources and administration. To
              maintain tenancy separation between silos, fleet roles do not cascade into
              silos. Learn more in the <AccessDocs /> guide.
            </>
          ) : scope === 'Silo' ? (
            <>
              Silo roles are inherited by all projects in the silo and override weaker
              roles. For example, a silo viewer is <em>at least</em> a viewer on all
              projects in the silo. Learn more in the <AccessDocs /> guide.
            </>
          ) : (
            <>
              Project roles can be overridden by a stronger role on the silo. For example, a
              silo viewer is <em>at least</em> a viewer on all projects in the silo. Learn
              more in the <AccessDocs /> guide.
            </>
          )
        }
      />
    </>
  )
}
