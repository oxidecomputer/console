/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { Control } from 'react-hook-form'

import {
  allRoles,
  type Actor,
  type IdentityType,
  type Policy,
  type RoleKey,
} from '@oxide/api'
import { Badge } from '@oxide/design-system/ui'

import { RadioFieldDyn } from '~/components/form/fields/RadioField'
import { HL } from '~/components/HL'
import { type ListboxItem } from '~/ui/lib/Listbox'
import { Message } from '~/ui/lib/Message'
import { Radio } from '~/ui/lib/Radio'
import { capitalize } from '~/util/str'

type AddUserValues = {
  identityId: string
  roleName: RoleKey | ''
}

export const defaultValues: AddUserValues = {
  identityId: '',
  roleName: '',
}

export const roleItems = allRoles.map((role) => ({
  value: role,
  label: role.split('_').map(capitalize).join(' '),
}))

// Role descriptions for project-level roles
const projectRoleDescriptions: Record<RoleKey, string> = {
  admin: 'Can control all aspects of the project',
  collaborator: 'Can manage all resources, including networking',
  limited_collaborator: 'Can manage compute resources; can not manage networking',
  viewer: 'Can read most resources within the project',
}

// Role descriptions for silo-level roles
const siloRoleDescriptions: Record<RoleKey, string> = {
  admin: 'Can control all aspects of the silo',
  collaborator: 'Can create and own projects; grants project admin role on all projects',
  limited_collaborator:
    'Can read most resources within the silo; grants limited collaborator role on all projects',
  viewer: 'Can read most resources within the silo; grants project viewer role',
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

type RoleRadioFieldProps = {
  control: Control<AddUserValues> | Control<{ roleName: RoleKey }>
  scope: 'Silo' | 'Project'
}

export function RoleRadioField({ control, scope }: RoleRadioFieldProps) {
  const roleDescriptions = scope === 'Silo' ? siloRoleDescriptions : projectRoleDescriptions
  return (
    <>
      <RadioFieldDyn
        name="roleName"
        label={`${scope} role`}
        required
        control={control as Control<AddUserValues>}
        column
        className="mt-2"
      >
        {allRoles.map((role, index) => (
          <div className={index === 0 ? 'mt-2' : 'mt-1'} key={role}>
            <Radio key={role} value={role} alignTop>
              {/* negative top margin to control spacing with radio button and label */}
              <div className="-mt-0.5 ml-1">
                <div className="text-sans-md text-raise">
                  {capitalize(role).replace('_', ' ')}
                </div>
                <div className="text-sans-sm text-secondary mt-0.5">
                  {roleDescriptions[role]}
                </div>
              </div>
            </Radio>
          </div>
        ))}
      </RadioFieldDyn>
      {scope === 'Project' && (
        <Message
          variant="info"
          content={
            <>
              A user’s strongest role determines their actual permissions. For example, a
              silo <HL>admin</HL> assigned a <HL>viewer</HL> role on a project will still
              have <HL>admin</HL> permissions on that project.
            </>
          }
        />
      )}
    </>
  )
}
