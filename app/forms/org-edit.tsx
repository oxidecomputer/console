import type { LoaderFunctionArgs } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'

import { apiQueryClient, useApiMutation, useApiQuery, useApiQueryClient } from '@oxide/api'
import { Success16Icon } from '@oxide/ui'

import { DescriptionField, NameField, SideModalForm } from 'app/components/hook-form'
import { requireOrgParams, useOrgParams, useToast } from 'app/hooks'
import { pb } from 'app/util/path-builder'

EditOrgSideModalForm.loader = async ({ params }: LoaderFunctionArgs) => {
  await apiQueryClient.prefetchQuery('organizationView', {
    path: requireOrgParams(params),
  })
}

export function EditOrgSideModalForm() {
  const queryClient = useApiQueryClient()
  const addToast = useToast()
  const navigate = useNavigate()

  const { orgName } = useOrgParams()

  const onDismiss = () => navigate(pb.orgs())

  const { data: org } = useApiQuery('organizationView', { path: { orgName } })

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
      onDismiss()
    },
  })

  return (
    <SideModalForm
      id="edit-org-form"
      formOptions={{ defaultValues: org }}
      title="Edit organization"
      onDismiss={onDismiss}
      onSubmit={({ name, description }) =>
        updateOrg.mutate({
          path: { orgName },
          body: { name, description },
        })
      }
      submitDisabled={updateOrg.isLoading}
      submitError={updateOrg.error}
      submitLabel="Save changes"
    >
      {({ control }) => (
        <>
          <NameField name="name" control={control} />
          <DescriptionField name="description" control={control} />
        </>
      )}
    </SideModalForm>
  )
}
