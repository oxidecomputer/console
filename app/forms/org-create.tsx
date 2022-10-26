import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

import type { Organization, OrganizationCreate } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'
import { Success16Icon } from '@oxide/ui'

import type { CreateSideModalFormProps } from 'app/components/hook-form'
import { DescriptionField, NameField, SideModalForm } from 'app/components/hook-form'
import { useToast } from 'app/hooks'
import { pb } from 'app/util/path-builder'

const values = {
  name: '',
  description: '',
}

export function CreateOrgSideModalForm({
  title = 'Create organization',
  defaultValues = values,
  onSuccess,
  onError,
  onDismiss,
  isOpen,
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

  // TODO: we don't want to have manually specify this every time we make a
  // form. might have to make a wrapper hook with different defaults
  //
  // TODO: the docs warn against the performance implications of validating on
  // every change
  const form = useForm({ defaultValues, mode: 'onChange' })
  const canSubmit = form.formState.isDirty && form.formState.isValid

  // TODO: calling useForm all the way up here means it's always mounted whether
  // the side modal is open or not, which means form state hangs around even
  // when the modal is closed. Using useEffect like this is a code smell, (and
  // error-prone, and would have to be wrapped up in a custom useForm in order
  // to get consistent correct behavior everywhere) so I would like this to work
  // differently. Ideally useForm would be called one level lower, e.g., in a
  // component that wraps name and description in the children of SideModalForm
  // so it only gets rendered when the form is open.
  useEffect(() => {
    if (!isOpen) form.reset()
  }, [form, isOpen])

  return (
    <SideModalForm
      id="create-org-form"
      title={title}
      onDismiss={onDismiss}
      onSubmit={form.handleSubmit((values) => createOrg.mutate({ body: values }))}
      submitDisabled={createOrg.isLoading || !canSubmit}
      error={createOrg.error?.error as Error | undefined}
      isOpen={isOpen}
    >
      <NameField name="name" control={form.control} />
      <DescriptionField name="description" control={form.control} />
    </SideModalForm>
  )
}
