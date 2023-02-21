import { useNavigate } from 'react-router-dom'

import type { SshKeyCreate } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'

import { DescriptionField, NameField, SideModalForm, TextField } from 'app/components/form'
import { pb2 } from 'app/util/path-builder'

const defaultValues: SshKeyCreate = {
  name: '',
  description: '',
  publicKey: '',
}

export function CreateSSHKeySideModalForm() {
  const queryClient = useApiQueryClient()
  const navigate = useNavigate()

  const onDismiss = () => navigate(pb2.sshKeys())

  const createSshKey = useApiMutation('sessionSshkeyCreate', {
    onSuccess() {
      queryClient.invalidateQueries('sessionSshkeyList', {})
      onDismiss()
    },
  })

  return (
    <SideModalForm
      id="create-ssh-key-form"
      title="Add SSH key"
      formOptions={{ defaultValues }}
      onDismiss={onDismiss}
      onSubmit={(body) => createSshKey.mutate({ body })}
      loading={createSshKey.isLoading}
      submitError={createSshKey.error}
    >
      {({ control }) => (
        <>
          <NameField name="name" control={control} />
          <DescriptionField name="description" control={control} />
          <TextField
            as="textarea"
            name="publicKey"
            label="Public key"
            required
            rows={8}
            control={control}
          />
        </>
      )}
    </SideModalForm>
  )
}
