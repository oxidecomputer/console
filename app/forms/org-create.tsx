import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import type { SetRequired } from 'type-fest'

import type { Organization, OrganizationCreate } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'
import type { ErrorResult } from '@oxide/api'
import { Success16Icon } from '@oxide/ui'
import type { SideModalProps } from '@oxide/ui'

import { SideModalForm2 } from 'app/components/form/SideModalForm2'
import { NameField } from 'app/components/form/fields/NameField2'
import { TextField } from 'app/components/form/fields/TextField2'
import { useToast } from 'app/hooks'
import { pb } from 'app/util/path-builder'

export type CreateFormProps<TFieldValues, Data> = {
  id?: string
  defaultValues?: TFieldValues
  onSuccess?: (data: Data) => void
  onError?: (err: ErrorResult) => void
  onDismiss?: () => void
}

export type CreateSideModalFormProps<Values, Data> = CreateFormProps<Values, Data> &
  Omit<SideModalProps, 'id'>

export type EditSideModalFormProps<Values, Data> = SetRequired<
  CreateFormProps<Values, Data>,
  'defaultValues'
> &
  CreateSideModalFormProps<Values, Data>

const values = {
  name: '',
  description: '',
}

export function CreateOrgSideModalForm({
  id = 'create-org-form',
  title = 'Create organization',
  defaultValues = values,
  onSuccess,
  onError,
  onDismiss,
  ...props
}: CreateSideModalFormProps<OrganizationCreate, Organization>) {
  const navigate = useNavigate()
  const queryClient = useApiQueryClient()
  const addToast = useToast()

  const form = useForm({ defaultValues, mode: 'onTouched' })

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
      onDismiss={onDismiss}
      onSubmit={({ name, description }) =>
        createOrg.mutate({
          body: { name, description },
        })
      }
      submitDisabled={createOrg.isLoading}
      error={createOrg.error?.error as Error | undefined}
      form={form}
      {...props}
    >
      <NameField control={form.control} />
      <TextField name="description" control={form.control} />
    </SideModalForm2>
  )
}
