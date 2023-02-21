import type { LoaderFunctionArgs } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'

import { apiQueryClient, useApiMutation, useApiQuery, useApiQueryClient } from '@oxide/api'
import { Success16Icon } from '@oxide/ui'

import { DescriptionField, NameField, SideModalForm } from 'app/components/form'
import { requireOrgParams, useOrgSelector, useToast } from 'app/hooks'
import { pb } from 'app/util/path-builder'

EditOrgSideModalForm.loader = async ({ params }: LoaderFunctionArgs) => {
  const { orgName } = requireOrgParams(params)
  await apiQueryClient.prefetchQuery('organizationViewV1', {
    path: { organization: orgName },
  })
  return null
}

export function EditOrgSideModalForm() {
  const queryClient = useApiQueryClient()
  const addToast = useToast()
  const navigate = useNavigate()

  const { organization } = useOrgSelector()

  const onDismiss = () => navigate(pb.orgs())

  const { data: org } = useApiQuery('organizationViewV1', { path: { organization } })

  const updateOrg = useApiMutation('organizationUpdateV1', {
    onSuccess(org) {
      queryClient.invalidateQueries('organizationListV1', {})
      // avoid the org fetch when the org page loads since we have the data
      queryClient.setQueryData(
        'organizationViewV1',
        { path: { organization: org.name } },
        org
      )
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
          path: { organization },
          body: { name, description },
        })
      }
      loading={updateOrg.isLoading}
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
