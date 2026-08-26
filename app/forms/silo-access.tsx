/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useForm } from 'react-hook-form'

import {
  api,
  queryClient,
  rolesByIdFromPolicy,
  updateRole,
  useActorsNotInPolicy,
  useApiMutation,
} from '@oxide/api'
import { Access16Icon } from '@oxide/design-system/icons/react'

import { ListboxField } from '~/components/form/fields/ListboxField'
import { SideModalForm } from '~/components/form/SideModalForm'
import { HL } from '~/components/HL'
import { useCurrentUser } from '~/hooks/use-current-user'
import { confirmAction } from '~/stores/confirm-action'
import { SideModalFormDocs } from '~/ui/lib/ModalLinks'
import { ResourceLabel } from '~/ui/lib/SideModal'
import { docLinks } from '~/util/links'

import {
  actorToItem,
  defaultValues,
  RoleRadioField,
  type AddRoleModalProps,
  type EditRoleModalProps,
} from './access-util'

export function SiloAccessAddUserSideModal({ onDismiss, policy }: AddRoleModalProps) {
  const actors = useActorsNotInPolicy(policy)

  const updatePolicy = useApiMutation(api.policyUpdate, {
    onSuccess: () => {
      queryClient.invalidateEndpoint('policyView')
      onDismiss()
    },
  })

  const form = useForm({ defaultValues })

  return (
    <SideModalForm
      form={form}
      formType="create"
      resourceName="role"
      title="Add user or group"
      submitLabel="Assign role"
      onDismiss={() => {
        updatePolicy.reset() // clear API error state so it doesn't persist on next open
        onDismiss()
      }}
      onSubmit={({ identityId, roleName }) => {
        // actor is guaranteed to be in the list because it came from there
        const identityType = actors.find((a) => a.id === identityId)!.identityType

        updatePolicy.mutate({
          body: updateRole({ identityId, identityType, roleName }, policy),
        })
      }}
      loading={updatePolicy.isPending}
      submitError={updatePolicy.error}
    >
      <ListboxField
        name="identityId"
        items={actors.map(actorToItem)}
        label="User or group"
        required
        control={form.control}
      />
      <RoleRadioField name="roleName" control={form.control} scope="Silo" />
      <SideModalFormDocs docs={[docLinks.access]} />
    </SideModalForm>
  )
}

export function SiloAccessEditUserSideModal({
  onDismiss,
  name,
  identityId,
  identityType,
  policy,
  defaultValues,
}: EditRoleModalProps) {
  const isAssigning = !defaultValues.roleName
  const { me } = useCurrentUser()
  // the direct assignment, which is what an update actually replaces —
  // defaultValues.roleName may be a role inherited from a group
  const myDirectRole = rolesByIdFromPolicy(policy).get(me.id)
  const updatePolicy = useApiMutation(api.policyUpdate, {
    onSuccess: () => {
      queryClient.invalidateEndpoint('policyView')
      onDismiss()
    },
  })
  const form = useForm({ defaultValues })

  return (
    <SideModalForm
      form={form}
      formType={isAssigning ? 'create' : 'edit'}
      resourceName="role"
      title={isAssigning ? 'Add silo role' : 'Edit silo role'}
      subtitle={
        <ResourceLabel>
          <Access16Icon /> {name}
        </ResourceLabel>
      }
      onSubmit={({ roleName }) => {
        if (!roleName) return
        const body = updateRole({ identityId, identityType, roleName }, policy)
        // Only silo admins can edit the policy, so an admin who removes their
        // own admin role may not be able to undo the change. "May" because
        // they could still be an admin through a group.
        if (identityId === me.id && myDirectRole === 'admin' && roleName !== 'admin') {
          confirmAction({
            actionType: 'danger',
            doAction: () => updatePolicy.mutateAsync({ body }),
            modalTitle: 'Remove your own admin role',
            modalContent: (
              <p>
                You are removing the <HL>admin</HL> role from your own account. You may lose
                the ability to manage access to this silo, including restoring your own
                role. Are you sure?
              </p>
            ),
            errorTitle: 'Could not update role',
          })
          return
        }
        updatePolicy.mutate({ body })
      }}
      loading={updatePolicy.isPending}
      submitError={updatePolicy.error}
      onDismiss={() => {
        updatePolicy.reset() // clear API error state so it doesn't persist on next open
        onDismiss()
      }}
    >
      <RoleRadioField name="roleName" control={form.control} scope="Silo" />
      <SideModalFormDocs docs={[docLinks.access]} />
    </SideModalForm>
  )
}
