import { NameField, DescriptionField, SideModalForm } from 'app/components/form'
import type { Organization, OrganizationCreate } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'
import { useToast } from 'app/hooks'
import type { SideModalProps } from '@oxide/ui'
import { Success16Icon } from '@oxide/ui'
import type { PrebuiltFormProps } from 'app/forms'

const values = {
  name: '',
  description: '',
}

type CreateOrgSideModalFormProps = Omit<SideModalProps, 'id'> &
  PrebuiltFormProps<OrganizationCreate, Organization>

export function CreateOrgSideModalForm({
  id = 'create-org-form',
  title = 'Create organization',
  initialValues = values,
  onSubmit,
  onSuccess,
  onError,
  ...props
}: CreateOrgSideModalFormProps) {
  const queryClient = useApiQueryClient()
  const addToast = useToast()

  const createOrg = useApiMutation('organizationsPost', {
    onSuccess(org) {
      queryClient.invalidateQueries('organizationsGet', {})
      // avoid the org fetch when the org page loads since we have the data
      queryClient.setQueryData('organizationsGetOrganization', { orgName: org.name }, org)
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
    <SideModalForm
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
      {...props}
    >
      <NameField id="org-name" />
      <DescriptionField id="org-description" />
    </SideModalForm>
  )
}
