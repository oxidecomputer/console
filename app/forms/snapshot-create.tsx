import type { PathParams, Snapshot, SnapshotCreate } from '@oxide/api'
import { useApiQuery } from '@oxide/api'
import { useApiMutation } from '@oxide/api'
import { useApiQueryClient } from '@oxide/api'
import { Success16Icon } from '@oxide/ui'

import {
  DescriptionField,
  ListboxField,
  NameField,
  SideModalForm,
} from 'app/components/form'
import { useRequiredParams, useToast } from 'app/hooks'

import type { CreateSideModalFormProps } from '.'

const useSnapshotDiskItems = (params: PathParams.Project) => {
  const { data: disks } = useApiQuery('diskList', { path: params, query: { limit: 1000 } })
  return (
    disks?.items
      .filter((disk) => disk.state.state === 'attached')
      .map((disk) => ({ value: disk.name, label: disk.name })) || []
  )
}

const values: SnapshotCreate = {
  description: '',
  disk: '',
  name: '',
}

export function CreateSnapshotSideModalForm({
  id = 'create-snapshot-form',
  title = 'Create Snapshot',
  initialValues = values,
  onSubmit,
  onSuccess,
  onError,
  onDismiss,
  ...props
}: CreateSideModalFormProps<SnapshotCreate, Snapshot>) {
  const queryClient = useApiQueryClient()
  const pathParams = useRequiredParams('orgName', 'projectName')
  const addToast = useToast()

  const diskItems = useSnapshotDiskItems(pathParams)

  const createSnapshot = useApiMutation('snapshotCreate', {
    onSuccess(data) {
      queryClient.invalidateQueries('snapshotList', { path: pathParams })
      addToast({
        icon: <Success16Icon />,
        title: 'Success!',
        content: 'Your snapshot has been created.',
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
        ((values) => {
          createSnapshot.mutate({
            path: pathParams,
            body: values,
          })
        })
      }
      {...props}
    >
      <NameField id="snapshot-name" />
      <DescriptionField id="snapshot-description" />
      <ListboxField
        id="snapshot-disk"
        name="disk"
        label="Disk"
        items={diskItems}
        required
      />
    </SideModalForm>
  )
}
