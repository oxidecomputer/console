import type { LoaderFunctionArgs } from 'react-router-dom'
import { useLoaderData, useNavigate } from 'react-router-dom'

import type { Organization, OrganizationCreate } from '@oxide/api'
import { apiQueryClient } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'
import { Success16Icon } from '@oxide/ui'

import { DescriptionField, NameField, SideModalForm } from 'app/components/hook-form'
import type { SideModalFormProps } from 'app/components/hook-form'
import { requireOrgParams, useToast } from 'app/hooks'
import { pb } from 'app/util/path-builder'

EditOrgSideModalForm.loader = async ({ params }: LoaderFunctionArgs) => {
  return apiQueryClient.fetchQuery('organizationView', {
    path: requireOrgParams(params),
  })
}

export function EditOrgSideModalForm({
  title = 'Edit organization',
  onSuccess,
  onError,
}: SideModalFormProps<OrganizationCreate, Organization>) {
  const queryClient = useApiQueryClient()
  const addToast = useToast()
  const navigate = useNavigate()

  const onDismiss = () => navigate(pb.orgs())
  const org = useLoaderData() as Organization

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
      formOptions={{ defaultValues: org }}
      title={title}
      onDismiss={onDismiss}
      onSubmit={({ name, description }) =>
        updateOrg.mutate({
          path: { orgName: org.name },
          body: { name, description },
        })
      }
      submitDisabled={updateOrg.isLoading}
      error={updateOrg.error?.error as Error | undefined}
      submitLabel="Save changes"
      isOpen
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
