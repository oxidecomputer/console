import invariant from 'tiny-invariant'

import type { Disk, DiskIdentifier } from '@oxide/api'
import {
  toApiSelector,
  toPathQuery,
  useApiMutation,
  useApiQuery,
  useApiQueryClient,
} from '@oxide/api'

import { ListboxField, SideModalForm } from 'app/components/form'
import { useAllParams } from 'app/hooks'

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
  const { orgName, projectName, instanceName } = useAllParams('orgName', 'projectName')

  const attachDisk = useApiMutation('instanceDiskAttachV1', {
    onSuccess(data) {
      invariant(instanceName, 'instanceName is required')
      queryClient.invalidateQueries(
        'instanceDiskListV1',
        toPathQuery('instance', toApiSelector({ orgName, projectName, instanceName }))
      )
      onSuccess?.(data)
      onDismiss()
    },
  })

  // TODO: loading state? because this fires when the modal opens and not when
  // they focus the combobox, it will almost always be done by the time they
  // click in
  // TODO: error handling
  const detachedDisks =
    useApiQuery('diskList', { path: { orgName, projectName } }).data?.items.filter(
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
            ...toPathQuery(
              'instance',
              toApiSelector({ orgName, projectName, instanceName })
            ),
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
