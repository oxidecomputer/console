import type { LoaderFunctionArgs } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'

import { useApiQuery } from '@oxide/api'
import { apiQueryClient } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'

import { DescriptionField, NameField, SideModalForm } from 'app/components/form'
import { requireNicParams, useInstanceParams, useNicParams } from 'app/hooks'
import { pb } from 'app/util/path-builder'

EditNetworkInterfaceForm.loader = async ({ params }: LoaderFunctionArgs) => {
  await apiQueryClient.prefetchQuery('instanceNetworkInterfaceView', {
    path: requireNicParams(params),
  })
}

export default function EditNetworkInterfaceForm() {
  const nicParams = useNicParams()
  const queryClient = useApiQueryClient()
  const navigate = useNavigate()
  const { orgName, projectName, instanceName } = useInstanceParams()

  const { data: nic } = useApiQuery('instanceNetworkInterfaceView', { path: nicParams })

  const onDismiss = () => navigate(pb.nics(nicParams))

  const editNetworkInterface = useApiMutation('instanceNetworkInterfaceUpdate', {
    onSuccess(nic) {
      queryClient.invalidateQueries('instanceNetworkInterfaceList', {
        path: { orgName, projectName, instanceName },
      })
      queryClient.setQueryData(
        'instanceNetworkInterfaceView',
        { path: { ...nicParams, interfaceName: nic.name } },
        nic
      )
      onDismiss()
    },
  })

  return (
    <SideModalForm
      id="edit-network-interface-form"
      title="Edit network interface"
      formOptions={{ defaultValues: nic }}
      onDismiss={onDismiss}
      onSubmit={(body) => {
        editNetworkInterface.mutate({
          path: nicParams,
          body,
        })
      }}
      submitDisabled={editNetworkInterface.isLoading}
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
