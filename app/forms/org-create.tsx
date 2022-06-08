import type { Organization } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'
import { Success16Icon } from '@oxide/ui'

import { DescriptionField, Form, NameField } from 'app/components/form'
import type { PrebuiltFormProps } from 'app/forms'
import { useToast } from 'app/hooks'

const values = {
  name: '',
  description: '',
}

export function CreateOrgForm({
  id = 'create-org-form',
  title = 'Create organization',
  initialValues = values,
  onSubmit,
  onSuccess,
  onError,
  ...props
}: PrebuiltFormProps<typeof values, Organization>) {
  const queryClient = useApiQueryClient()
  const addToast = useToast()

  const createOrg = useApiMutation('organizationsPost', {
    onSuccess(org) {
      queryClient.invalidateQueries('organizationsGet', {})
      // avoid the org fetch when the org page loads since we have the data
      queryClient.setQueryData('organizationsGetOrganization', { orgName: org.name }, org)
      addToast({
        icon: <Success16Icon />,
        title: 'Success!',
        content: 'Your organization has been created.',
        timeout: 5000,
      })
      onSuccess?.(org)
    },
    onError,
  })

  return (
    <Form
      id={id}
      title={title}
      initialValues={initialValues}
      onSubmit={
        onSubmit ??
        (({ name, description }) =>
          createOrg.mutate({
            body: { name, description },
          }))
      }
      mutation={createOrg}
      {...props}
    >
      <NameField id="org-name" />
      <DescriptionField id="org-description" />
      <Form.Actions>
        <Form.Submit>{title}</Form.Submit>
        <Form.Cancel />
      </Form.Actions>
    </Form>
  )
}

export default CreateOrgForm
