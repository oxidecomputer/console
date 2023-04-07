import { useNavigate } from 'react-router-dom'

import type { PathParams as PP, SnapshotCreate } from '@oxide/api'
import { DISK_SNAPSHOT_STATES } from '@oxide/api'
import { useApiMutation, useApiQuery, useApiQueryClient } from '@oxide/api'
import { Success12Icon } from '@oxide/ui'

import {
  DescriptionField,
  ListboxField,
  NameField,
  SideModalForm,
} from 'app/components/form'
import { useProjectSelector, useToast } from 'app/hooks'
import { pb } from 'app/util/path-builder'

const useSnapshotDiskItems = (projectSelector: PP.Project) => {
  const { data: disks } = useApiQuery('diskList', {
    query: { ...projectSelector, limit: 1000 },
  })
  return (
    disks?.items
      .filter((disk) => DISK_SNAPSHOT_STATES.has(disk.state.state))
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

  const createSnapshot = useApiMutation('snapshotCreate', {
    onSuccess() {
      queryClient.invalidateQueries('snapshotList', { query: projectSelector })
      addToast({
        icon: <Success12Icon />,
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
