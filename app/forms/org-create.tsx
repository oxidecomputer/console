import React from 'react'
import { Form, NameField, DescriptionField } from '@oxide/form'
import { useApiMutation, useApiQueryClient } from '@oxide/api'
import { useToast } from 'app/hooks'
import { useNavigate } from 'react-router-dom'
import { Success16Icon } from '@oxide/ui'
import type { BaseFormProps } from './helpers/form-types'

const values = {
  name: '',
  description: '',
}

CreateOrgForm.defaultProps = {
  id: 'create-org-form',
  title: 'Create organization',
  initialValues: values,
}

export function CreateOrgForm({
  id,
  title,
  initialValues,
  onSubmit,
  ...props
}: BaseFormProps<typeof values>) {
  const queryClient = useApiQueryClient()
  const addToast = useToast()
  const navigate = useNavigate()

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
      navigate(`../`)
    },
  })

  return (
    <Form
      id={id!}
      title={title}
      initialValues={initialValues!}
      onSubmit={
        onSubmit ??
        (({ name, description }) =>
          createOrg.mutate({
            body: { name, description },
          }))
      }
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
