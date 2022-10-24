import { useNavigate } from 'react-router-dom'

import type { Organization, OrganizationCreate } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'
import { Success16Icon } from '@oxide/ui'

import { SideModalForm2 } from 'app/components/form/SideModalForm2'
import { TextField } from 'app/components/form/fields/TextField2'
import { useToast } from 'app/hooks'
import { pb } from 'app/util/path-builder'

import type { CreateSideModalFormProps } from '.'

const values = {
  name: '',
  description: '',
}

export function CreateOrgSideModalForm({
  id = 'create-org-form',
  title = 'Create organization',
  initialValues = values,
  onSubmit,
  onSuccess,
  onError,
  onDismiss,
  ...props
}: CreateSideModalFormProps<OrganizationCreate, Organization>) {
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
    <SideModalForm2
      id={id}
      title={title}
      initialValues={initialValues}
      onDismiss={onDismiss}
      onSubmit={
        onSubmit ??
        (({ name, description }) =>
          createOrg.mutate({
            body: { name, description },
          }))
      }
      submitDisabled={createOrg.isLoading}
      error={createOrg.error?.error as Error | undefined}
      {...props}
    >
      <TextField id="org-name" />
      <TextField id="org-description" />
    </SideModalForm2>
  )
}
