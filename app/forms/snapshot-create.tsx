import { useNavigate } from 'react-router-dom'

import type { PathParamsV1, SnapshotCreate } from '@oxide/api'
import { useApiMutation, useApiQuery, useApiQueryClient } from '@oxide/api'
import { Success16Icon } from '@oxide/ui'

import {
  DescriptionField,
  ListboxField,
  NameField,
  SideModalForm,
} from 'app/components/form'
import { useProjectSelector, useToast } from 'app/hooks'
import { pb } from 'app/util/path-builder'

const useSnapshotDiskItems = (projectSelector: PathParamsV1.Project) => {
  const { data: disks } = useApiQuery('diskListV1', {
    query: { ...projectSelector, limit: 1000 },
  })
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
  const projectSelector = useProjectSelector()
  const addToast = useToast()
  const navigate = useNavigate()

  const diskItems = useSnapshotDiskItems(projectSelector)

  const onDismiss = () => navigate(pb.snapshots(projectSelector))

  const createSnapshot = useApiMutation('snapshotCreateV1', {
    onSuccess() {
      queryClient.invalidateQueries('snapshotListV1', { query: projectSelector })
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
        createSnapshot.mutate({ query: projectSelector, body: values })
      }}
      submitError={createSnapshot.error}
    >
      {({ control }) => (
        <>
          <NameField name="name" control={control} />
          <DescriptionField name="description" control={control} />
          <ListboxField name="disk" items={diskItems} required control={control} />
        </>
      )}
    </SideModalForm>
  )
}
