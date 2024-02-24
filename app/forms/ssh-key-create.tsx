/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useNavigate } from 'react-router-dom'

import { useApiMutation, useApiQueryClient, type SshKeyCreate } from '@oxide/api'

import { DescriptionField } from '~/components/form/fields/DescriptionField'
import { NameField } from '~/components/form/fields/NameField'
import { TextField } from '~/components/form/fields/TextField'
import { SideModalForm } from '~/components/form/SideModalForm'
import { useForm } from 'app/hooks'
import { pb } from 'app/util/path-builder'

const defaultValues: SshKeyCreate = {
  name: '',
  description: '',
  publicKey: '',
}

export function CreateSSHKeySideModalForm({
  onDismiss,
  message,
}: {
  onDismiss?: () => void
  message?: React.ReactNode
}) {
  const queryClient = useApiQueryClient()
  const navigate = useNavigate()

  const handleDismiss = onDismiss ? onDismiss : () => navigate(pb.sshKeys())

  const createSshKey = useApiMutation('currentUserSshKeyCreate', {
    onSuccess() {
      queryClient.invalidateQueries('currentUserSshKeyList')
      handleDismiss()
    },
  })
  const form = useForm({ defaultValues })

  return (
    <SideModalForm
      id="create-ssh-key-form"
      title="Add SSH key"
      form={form}
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
