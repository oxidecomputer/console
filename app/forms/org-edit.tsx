import type { Organization, OrganizationCreate } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'
import { Success16Icon } from '@oxide/ui'

import { DescriptionField, NameField, SideModalForm } from 'app/components/hook-form'
import type { EditSideModalFormProps } from 'app/components/hook-form'
import { useToast } from 'app/hooks'

export function EditOrgSideModalForm({
  title = 'Edit organization',
  defaultValues,
  onSuccess,
  onError,
  onDismiss,
  isOpen,
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
      id="edit-org-form"
      formOptions={{ defaultValues }}
      title={title}
      onDismiss={onDismiss}
      onSubmit={({ name, description }) =>
        updateOrg.mutate({
          path: { orgName: defaultValues.name },
          body: { name, description },
        })
      }
      submitDisabled={updateOrg.isLoading}
      error={updateOrg.error?.error as Error | undefined}
      submitLabel="Save changes"
      isOpen={isOpen}
    >
      {(control) => (
        <>
          <NameField name="name" control={control} />
          <DescriptionField name="description" control={control} />
        </>
      )}
    </SideModalForm>
  )
}
