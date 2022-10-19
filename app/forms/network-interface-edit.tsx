import invariant from 'tiny-invariant'

import type { NetworkInterface, NetworkInterfaceUpdate } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'

import { DescriptionField, Form, NameField, SideModalForm } from 'app/components/form'
import type { EditSideModalFormProps } from 'app/forms'
import { useAllParams } from 'app/hooks'

export default function EditNetworkInterfaceSideModalForm({
  id = 'edit-network-interface-form',
  title = 'Edit network interface',
  onSubmit,
  onSuccess,
  onError,
  onDismiss,
  initialValues,
  ...props
}: EditSideModalFormProps<NetworkInterfaceUpdate, NetworkInterface>) {
  const queryClient = useApiQueryClient()
  const { orgName, projectName, instanceName } = useAllParams('orgName', 'projectName')

  const editNetworkInterface = useApiMutation('instanceNetworkInterfaceUpdate', {
    onSuccess(data) {
      invariant(instanceName, 'instanceName is required when posting a network interface')
      queryClient.invalidateQueries('instanceNetworkInterfaceList', {
        path: { orgName, projectName, instanceName },
      })
      onSuccess?.(data)
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
        onSubmit ||
        ((body) => {
          const interfaceName = initialValues.name
          invariant(
            interfaceName,
            'interfaceName is required when updating a network interface'
          )
          invariant(
            instanceName,
            'instanceName is required when posting a network interface'
          )

          editNetworkInterface.mutate({
            path: { orgName, projectName, instanceName, interfaceName },
            body,
          })
        })
      }
      submitDisabled={editNetworkInterface.isLoading}
      error={editNetworkInterface.error?.error as Error | undefined}
      {...props}
    >
      <NameField id="nic-name" />
      <DescriptionField id="nic-description" />
      <Form.Submit>Save changes</Form.Submit>
    </SideModalForm>
  )
}
