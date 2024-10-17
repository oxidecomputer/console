/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

import { useApiMutation, useApiQueryClient, type SshKeyCreate } from '@oxide/api'

import { DescriptionField } from '~/components/form/fields/DescriptionField'
import { NameField } from '~/components/form/fields/NameField'
import { TextField } from '~/components/form/fields/TextField'
import { SideModalForm } from '~/components/form/SideModalForm'
import { HLs } from '~/components/HL'
import { addToast } from '~/stores/toast'
import { pb } from '~/util/path-builder'

const defaultValues: SshKeyCreate = {
  name: '',
  description: '',
  publicKey: '',
}

type Props = {
  onDismiss?: () => void
  message?: React.ReactNode
}

export function CreateSSHKeySideModalForm({ onDismiss, message }: Props) {
  const queryClient = useApiQueryClient()
  const navigate = useNavigate()

  const handleDismiss = onDismiss ? onDismiss : () => navigate(pb.sshKeys())

  const createSshKey = useApiMutation('currentUserSshKeyCreate', {
    onSuccess(sshKey) {
      queryClient.invalidateQueries('currentUserSshKeyList')
      handleDismiss()
      addToast({
        content: (
          <>
            SSH key <HLs>{sshKey.name}</HLs> created
          </>
        ),
      })
    },
  })
  const form = useForm({ defaultValues })

  return (
    <SideModalForm
      form={form}
      formType="create"
      resourceName="SSH key"
      title="Add SSH key"
      onDismiss={handleDismiss}
      onSubmit={(body) => createSshKey.mutate({ body })}
      loading={createSshKey.isPending}
      submitError={createSshKey.error}
    >
      <NameField name="name" control={form.control} />
      <DescriptionField name="description" control={form.control} />
      <TextField
        as="textarea"
        name="publicKey"
        label="Public key"
        required
        rows={8}
        control={form.control}
      />
      {message}
    </SideModalForm>
  )
}
