import type { SshKey, SshKeyCreate } from '@oxide/api'
import { useApiMutation } from '@oxide/api'
import { useApiQueryClient } from '@oxide/api'
import type { SideModalProps } from '@oxide/ui'

import { DescriptionField, NameField, SideModalForm, TextField } from 'app/components/form'

import type { CreateFormProps } from '.'

const values: SshKeyCreate = {
  name: '',
  description: '',
  publicKey: '',
}

type CreateSSHKeyFormProps = CreateFormProps<SshKeyCreate, SshKey> &
  Omit<SideModalProps, 'id'>

export function CreateSSHKeySideModalForm({
  id = 'create-ssh-key-form',
  title = 'Add SSH key',
  initialValues = values,
  onSuccess,
  onError,
  onDismiss,
  ...props
}: CreateSSHKeyFormProps) {
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
      {/* TODO: Turn into a text area */}
      <TextField
        id="ssh-key-public-key"
        name="publicKey"
        label="SSH key content"
        required
      />
    </SideModalForm>
  )
}
