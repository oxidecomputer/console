import { useParams } from 'react-router-dom'
import invariant from 'tiny-invariant'

import type { Disk, DiskIdentifier } from '@oxide/api'
import { useApiMutation, useApiQuery, useApiQueryClient } from '@oxide/api'

import { ListboxField, SideModalForm } from 'app/components/form'
import { useProjectSelector } from 'app/hooks'

const defaultValues = { name: '' }

type AttachDiskProps = {
  /** If defined, this overrides the usual mutation */
  onSubmit?: (diskAttach: DiskIdentifier) => void
  onDismiss: () => void
  onSuccess?: (disk: Disk) => void
}

export function AttachDiskSideModalForm({
  onSubmit,
  onSuccess,
  onDismiss,
}: AttachDiskProps) {
  const queryClient = useApiQueryClient()
  // instance name undefined when this form is called from DisksTableField on
  // instance create, which passes in its own onSubmit, bypassing the attachDisk mutation
  const { instanceName } = useParams()
  const projectSelector = useProjectSelector()

  const attachDisk = useApiMutation('instanceDiskAttachV1', {
    onSuccess(data) {
      invariant(instanceName, 'instanceName is required')
      queryClient.invalidateQueries('instanceDiskListV1', {
        path: { instance: instanceName },
        query: projectSelector,
      })
      onSuccess?.(data)
      onDismiss()
    },
  })

  // TODO: loading state? because this fires when the modal opens and not when
  // they focus the combobox, it will almost always be done by the time they
  // click in
  // TODO: error handling
  const detachedDisks =
    useApiQuery('diskListV1', { query: projectSelector }).data?.items.filter(
      (d) => d.state.state === 'detached'
    ) || []

  return (
    <SideModalForm
      id="form-disk-attach"
      title="Attach Disk"
      formOptions={{ defaultValues }}
      onSubmit={
        onSubmit ||
        (({ name }) => {
          invariant(instanceName, 'instanceName is required')
          attachDisk.mutate({
            path: { instance: instanceName },
            query: projectSelector,
            body: { disk: name },
          })
        })
      }
      loading={attachDisk.isLoading}
      submitError={attachDisk.error}
      onDismiss={onDismiss}
    >
      {({ control }) => (
        <ListboxField
          label="Disk name"
          name="name"
          items={detachedDisks.map(({ name }) => ({ value: name, label: name }))}
          control={control}
        />
      )}
    </SideModalForm>
  )
}

export default AttachDiskSideModalForm
