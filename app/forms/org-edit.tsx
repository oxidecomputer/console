import type { Organization, OrganizationCreate } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'
import { Success16Icon } from '@oxide/ui'

import { DescriptionField, Form, NameField, SideModalForm } from 'app/components/form'
import { useToast } from 'app/hooks'

import type { EditSideModalFormProps } from '.'

export function EditOrgSideModalForm({
  id = 'edit-org-form',
  title = 'Edit organization',
  initialValues,
  onSubmit,
  onSuccess,
  onError,
  onDismiss,
  ...props
}: EditSideModalFormProps<OrganizationCreate, Organization>) {
  const queryClient = useApiQueryClient()
  const addToast = useToast()

  const updateOrg = useApiMutation('organizationUpdate', {
    onSuccess(org) {
      queryClient.invalidateQueries('organizationList', {})
      // avoid the org fetch when the org page loads since we have the data
      queryClient.setQueryData('organizationView', { path: { orgName: org.name } }, org)
      addToast({
        icon: <Success16Icon />,
        title: 'Success!',
        content: 'Your organization has been updated.',
        timeout: 5000,
      })
      onSuccess?.(org)
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
      onSubmit={
        onSubmit ??
        (({ name, description }) =>
          updateOrg.mutate({
            path: { orgName: initialValues.name },
            body: { name, description },
          }))
      }
      submitDisabled={updateOrg.isLoading}
      error={updateOrg.error?.error as Error | undefined}
      {...props}
    >
      <NameField id="org-name" />
      <DescriptionField id="org-description" />
      <Form.Submit>Save changes</Form.Submit>
    </SideModalForm>
  )
}
