/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useState } from 'react'
import type { Control, FieldPath, FieldValues } from 'react-hook-form'
import * as R from 'remeda'

import {
  allRoles,
  fleetRoles,
  rolesByIdFromPolicy,
  type Actor,
  type FleetRole,
  type IdentityType,
  type Policy,
  type RoleKey,
} from '@oxide/api'
import { Access16Icon } from '@oxide/design-system/icons/react'
import { Badge } from '@oxide/design-system/ui'

import { RadioFieldDyn } from '~/components/form/fields/RadioField'
import { TypeToConfirmField, typeToConfirmReason } from '~/components/TypeToConfirmField'
import { useCurrentUser } from '~/hooks/use-current-user'
import { type ComboboxItem } from '~/ui/lib/Combobox'
import { Message } from '~/ui/lib/Message'
import { Radio } from '~/ui/lib/Radio'
import { docLinks } from '~/util/links'
import { capitalize } from '~/util/str'

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

export const actorToItem = (actor: Actor): ComboboxItem => ({
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
  defaultValues: { roleName?: Role }
  /**
   * Whether the current user would still be able to edit this scope's roles
   * through their other roles if their own direct role were lowered. Skips the
   * self-demotion confirmation when true.
   */
  keepsEditAccess?: boolean
}

/** Names the user or group whose role a role modal edits, since the modal title doesn't */
export const RoleModalIdentity = ({ name }: { name?: string }) =>
  name ? (
    <div className="text-sans-lg text-accent [&>svg]:text-accent-tertiary flex items-center gap-1.5">
      <Access16Icon /> {name}
    </div>
  ) : null

/**
 * Admin is the only role that grants permission to edit a scope's roles, so a
 * user changing their own direct admin role to another role could lose that
 * permission, unless another of their roles grants it. If it could, the edit
 * form asks them to type their name first.
 */
export function useOwnAdminDemotion<Role extends RoleKey>({
  policy,
  identityId,
  name,
  roleName,
  keepsEditAccess = false,
}: {
  policy: Policy<Role>
  identityId: string
  name?: string
  /** Role currently selected in the form */
  roleName: Role | undefined
  keepsEditAccess?: boolean
}) {
  const { me } = useCurrentUser()
  const [typedText, setTypedText] = useState('')
  const isDemotingSelf =
    identityId === me.id &&
    rolesByIdFromPolicy(policy).get(me.id) === 'admin' &&
    roleName !== 'admin' &&
    !keepsEditAccess
  const confirmText = name || 'change my own role'
  return {
    isDemotingSelf,
    confirmText,
    typedText,
    setTypedText,
    submitDisabled: isDemotingSelf
      ? typeToConfirmReason(confirmText, typedText)
      : undefined,
  }
}

export const OwnAdminDemotionConfirm = ({
  scope,
  demotion,
}: {
  scope: 'fleet' | 'silo' | 'project'
  demotion: ReturnType<typeof useOwnAdminDemotion>
}) =>
  demotion.isDemotingSelf ? (
    <>
      <Message
        variant="error"
        content={`This could remove your ability to manage ${scope} roles.`}
      />
      <TypeToConfirmField
        confirmText={demotion.confirmText}
        value={demotion.typedText}
        onChange={demotion.setTypedText}
      />
    </>
  ) : null

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
          <Radio name="roleName" key={role} value={role}>
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
