import type { SshKey, SshKeyCreate } from '@oxide/api'
import { useApiMutation } from '@oxide/api'
import { useApiQueryClient } from '@oxide/api'
import { DescriptionField, Form, NameField, TextField } from 'app/components/form'
import type { PrebuiltFormProps } from '.'

const values: SshKeyCreate = {
  name: '',
  description: '',
  publicKey: '',
}

export function CreateSSHKeyForm({
  id = 'create-ssh-key-form',
  title = 'Add SSH key',
  initialValues = values,
  onSuccess,
  onError,
  ...props
}: PrebuiltFormProps<SshKeyCreate, SshKey>) {
  const queryClient = useApiQueryClient()

  const createSshKey = useApiMutation('sshkeysPost', {
    onSuccess(data) {
      queryClient.invalidateQueries('sshkeysGet', {})
      onSuccess?.(data)
    },
    onError,
  })

  return (
    <Form
      id={id}
      title={title}
      initialValues={initialValues}
      onSubmit={(body) => createSshKey.mutate({ body })}
      mutation={createSshKey}
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

      <Form.Actions>
        <Form.Submit>{title}</Form.Submit>
        <Form.Cancel />
      </Form.Actions>
    </Form>
  )
}
