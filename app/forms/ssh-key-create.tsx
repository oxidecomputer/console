import type { SshKey, SshKeyCreate } from '@oxide/api'
import { useApiMutation } from '@oxide/api'
import { useApiQueryClient } from '@oxide/api'

import { DescriptionField, NameField, SideModalForm, TextField } from 'app/components/form'

import type { CreateSideModalFormProps } from '.'

const values: SshKeyCreate = {
  name: '',
  description: '',
  publicKey: '',
}

export function CreateSSHKeySideModalForm({
  id = 'create-ssh-key-form',
  title = 'Add SSH key',
  initialValues = values,
  onSuccess,
  onError,
  onDismiss,
  ...props
}: CreateSideModalFormProps<SshKeyCreate, SshKey>) {
  const queryClient = useApiQueryClient()

  const createSshKey = useApiMutation('sshkeysPost', {
    onSuccess(data) {
      queryClient.invalidateQueries('sshkeysGet', {})
      onSuccess?.(data)
      onDismiss()
    },
    onError,
  })

  return (
    <SideModalForm
      id={id}
      title={title}
      initialValues={initialValues}
      onDismiss={onDismiss}
      onSubmit={(body) => createSshKey.mutate({ body })}
      submitDisabled={createSshKey.isLoading}
      error={createSshKey.error?.error as Error | undefined}
      {...props}
    >
      <NameField id="ssh-key-name" />
      <DescriptionField id="ssh-key-description" />
      <TextField
        as="textarea"
        id="ssh-key-public-key"
        name="publicKey"
        label="Public key"
        required
        rows={8}
      />
    </SideModalForm>
  )
}
