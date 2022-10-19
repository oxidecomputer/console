import invariant from 'tiny-invariant'

import type { Vpc, VpcUpdate } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'
import { Success16Icon } from '@oxide/ui'

import { DescriptionField, Form, NameField, SideModalForm } from 'app/components/form'
import type { EditSideModalFormProps } from 'app/forms'
import { useRequiredParams, useToast } from 'app/hooks'

const values: VpcUpdate = {
  name: '',
  description: '',
  dnsName: '',
}

export function EditVpcSideModalForm({
  id = 'edit-vpc-form',
  title = 'Edit VPC',
  initialValues = values,
  onSubmit,
  onSuccess,
  onDismiss,
  onError,
  ...props
}: EditSideModalFormProps<VpcUpdate, Vpc>) {
  const parentNames = useRequiredParams('orgName', 'projectName')
  const queryClient = useApiQueryClient()
  const addToast = useToast()

  const editVpc = useApiMutation('vpcUpdate', {
    async onSuccess(vpc) {
      queryClient.invalidateQueries('vpcList', { path: parentNames })
      queryClient.setQueryData(
        'vpcView',
        { path: { ...parentNames, vpcName: vpc.name } },
        vpc
      )
      addToast({
        icon: <Success16Icon />,
        title: 'Success!',
        content: 'Your VPC has been created.',
      })
      onSuccess?.(vpc)
      onDismiss()
    },
    onError,
  })

  return (
    <SideModalForm
      id={id}
      title={title}
      initialValues={initialValues}
      onDismiss={onDismiss}
      onSubmit={
        onSubmit ??
        (({ name, description, dnsName }) => {
          invariant(initialValues.name, 'Initial vpc name is required to update the VPC')
          editVpc.mutate({
            path: { ...parentNames, vpcName: initialValues.name },
            body: { name, description, dnsName },
          })
        })
      }
      submitDisabled={editVpc.isLoading}
      error={editVpc.error?.error as Error | undefined}
      {...props}
    >
      <NameField id="vpc-name" />
      <DescriptionField id="vpc-description" />
      <NameField id="vpc-dns-name" name="dnsName" label="DNS name" required={false} />
      <Form.Submit>Save changes</Form.Submit>
    </SideModalForm>
  )
}

export default EditVpcSideModalForm
