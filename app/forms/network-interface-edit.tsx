import invariant from 'tiny-invariant'

import type { NetworkInterface } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'
import { pick } from '@oxide/util'

import { DescriptionField, NameField, SideModalForm } from 'app/components/form'
import { useInstanceSelector } from 'app/hooks'

type EditNetworkInterfaceFormProps = {
  editing: NetworkInterface
  onDismiss: () => void
}

export default function EditNetworkInterfaceForm({
  onDismiss,
  editing,
}: EditNetworkInterfaceFormProps) {
  const queryClient = useApiQueryClient()
  const instanceSelector = useInstanceSelector()

  const editNetworkInterface = useApiMutation('instanceNetworkInterfaceUpdateV1', {
    onSuccess() {
      invariant(
        instanceSelector.instance,
        'instanceName is required when posting a network interface'
      )
      queryClient.invalidateQueries('instanceNetworkInterfaceListV1', {
        query: instanceSelector,
      })
      onDismiss()
    },
  })

  const defaultValues = pick(editing, 'name', 'description') // satisfies NetworkInterfaceUpdate

  return (
    <SideModalForm
      id="edit-network-interface-form"
      title="Edit network interface"
      formOptions={{ defaultValues }}
      onDismiss={onDismiss}
      onSubmit={(body) => {
        const interfaceName = defaultValues.name
        editNetworkInterface.mutate({
          path: { interface: interfaceName },
          query: instanceSelector,
          body,
        })
      }}
      loading={editNetworkInterface.isLoading}
      submitError={editNetworkInterface.error}
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
