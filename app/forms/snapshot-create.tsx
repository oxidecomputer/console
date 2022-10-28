import { useNavigate } from 'react-router-dom'

import type { PathParams, SnapshotCreate } from '@oxide/api'
import { useApiQuery } from '@oxide/api'
import { useApiMutation } from '@oxide/api'
import { useApiQueryClient } from '@oxide/api'
import { Success16Icon } from '@oxide/ui'

import {
  DescriptionField,
  ListboxField,
  NameField,
  SideModalForm,
} from 'app/components/hook-form'
import { useRequiredParams, useToast } from 'app/hooks'
import { pb } from 'app/util/path-builder'

const useSnapshotDiskItems = (params: PathParams.Project) => {
  const { data: disks } = useApiQuery('diskList', { path: params, query: { limit: 1000 } })
  return (
    disks?.items
      .filter((disk) => disk.state.state === 'attached')
      .map((disk) => ({ value: disk.name, label: disk.name })) || []
  )
}

const defaultValues: SnapshotCreate = {
  description: '',
  disk: '',
  name: '',
}

export function CreateSnapshotSideModalForm() {
  const queryClient = useApiQueryClient()
  const pathParams = useRequiredParams('orgName', 'projectName')
  const addToast = useToast()
  const navigate = useNavigate()

  const diskItems = useSnapshotDiskItems(pathParams)

  const onDismiss = () => navigate(pb.snapshots(pathParams))

  const createSnapshot = useApiMutation('snapshotCreate', {
    onSuccess() {
      queryClient.invalidateQueries('snapshotList', { path: pathParams })
      addToast({
        icon: <Success16Icon />,
        title: 'Success!',
        content: 'Your snapshot has been created.',
      })
      onDismiss()
    },
  })

  return (
    <SideModalForm
      id="create-snapshot-form"
      title="Create Snapshot"
      formOptions={{ defaultValues }}
      onDismiss={onDismiss}
      onSubmit={(values) => {
        createSnapshot.mutate({
          path: pathParams,
          body: values,
        })
      }}
      error={createSnapshot.error}
    >
      {(control) => (
        <>
          <NameField name="name" control={control} />
          <DescriptionField name="description" control={control} />
          <ListboxField name="disk" items={diskItems} required control={control} />
        </>
      )}
    </SideModalForm>
  )
}
