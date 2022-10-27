import { useNavigate } from 'react-router-dom'

import type { Organization, OrganizationCreate } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'
import { Success16Icon } from '@oxide/ui'

import type { SideModalFormProps } from 'app/components/hook-form'
import { DescriptionField, NameField, SideModalForm } from 'app/components/hook-form'
import { useToast } from 'app/hooks'
import { pb } from 'app/util/path-builder'

const defaultValues: OrganizationCreate = {
  name: '',
  description: '',
}

export function CreateOrgSideModalForm({
  onSuccess,
  onError,
}: SideModalFormProps<OrganizationCreate, Organization>) {
  const navigate = useNavigate()
  const queryClient = useApiQueryClient()
  const addToast = useToast()

  const createOrg = useApiMutation('organizationCreate', {
    onSuccess(org) {
      queryClient.invalidateQueries('organizationList', {})
      // avoid the org fetch when the org page loads since we have the data
      const orgParams = { orgName: org.name }
      queryClient.setQueryData('organizationView', { path: orgParams }, org)
      addToast({
        icon: <Success16Icon />,
        title: 'Success!',
        content: 'Your organization has been created.',
      })
      onSuccess?.(org)
      navigate(pb.projects(orgParams))
    },
    onError,
  })

  return (
    <SideModalForm
      id="create-org-form"
      formOptions={{ defaultValues }}
      title="Create organization"
      onDismiss={() => navigate(pb.orgs())}
      onSubmit={(values) => createOrg.mutate({ body: values })}
      submitDisabled={createOrg.isLoading}
      error={createOrg.error?.error as Error | undefined}
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
