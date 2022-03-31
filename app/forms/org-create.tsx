import React from 'react'
import { Form, NameField, DescriptionField } from '@oxide/form'
import { useApiMutation, useApiQueryClient } from '@oxide/api'
import { useToast } from 'app/hooks'
import { Success16Icon } from '@oxide/ui'
import type { PrebuiltFormProps } from '@oxide/form'

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
}: PrebuiltFormProps<typeof values>) {
  const queryClient = useApiQueryClient()
  const addToast = useToast()

  const createOrg = useApiMutation('organizationsPost', {
    onSuccess(org) {
      queryClient.invalidateQueries('organizationsGet', {})
      // avoid the org fetch when the org page loads since we have the data
      queryClient.setQueryData(
        'organizationsGetOrganization',
        { orgName: org.name },
        org
      )
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
