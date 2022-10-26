import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

import type { Organization, OrganizationCreate } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'
import { Success16Icon } from '@oxide/ui'

import { Form } from 'app/components/form'
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

  // see comments in org-create.tsx
  const form = useForm({ defaultValues, mode: 'onChange' })
  const canSubmit = form.formState.isDirty && form.formState.isValid

  useEffect(() => {
    if (!isOpen) form.reset()
  }, [form, isOpen])

  return (
    <SideModalForm
      id="edit-org-form"
      title={title}
      onDismiss={onDismiss}
      onSubmit={form.handleSubmit(({ name, description }) =>
        updateOrg.mutate({
          path: { orgName: defaultValues.name },
          body: { name, description },
        })
      )}
      submitDisabled={updateOrg.isLoading || !canSubmit}
      error={updateOrg.error?.error as Error | undefined}
      submitLabel="Save changes"
      isOpen={isOpen}
    >
      <NameField name="name" control={form.control} />
      <DescriptionField name="description" control={form.control} />
      <Form.Submit>Save changes</Form.Submit>
    </SideModalForm>
  )
}
