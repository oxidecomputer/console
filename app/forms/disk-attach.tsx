import invariant from 'tiny-invariant'

import type { Disk, DiskIdentifier } from '@oxide/api'
import { useApiQuery } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'

import { ListboxField } from 'app/components/form'
import { SideModalForm } from 'app/components/form/SideModalForm'
import type { CreateSideModalFormProps } from 'app/forms'
import { useParams } from 'app/hooks'

const values = { name: '' }

export function AttachDiskSideModalForm({
  id = 'form-disk-attach',
  title = 'Attach Disk',
  initialValues = values,
  onSubmit,
  onSuccess,
  onError,
  ...props
}: CreateSideModalFormProps<DiskIdentifier, Disk>) {
  const queryClient = useApiQueryClient()
  const pathParams = useParams('orgName', 'projectName')

  const attachDisk = useApiMutation('instanceDiskAttach', {
    onSuccess(data) {
      const { instanceName, ...others } = pathParams
      invariant(instanceName, 'instanceName is required')
      queryClient.invalidateQueries('instanceDiskList', {
        instanceName,
        ...others,
      })
      onSuccess?.(data)
    },
    onError,
  })

  // TODO: loading state? because this fires when the modal opens and not when
  // they focus the combobox, it will almost always be done by the time they
  // click in
  // TODO: error handling
  const detachedDisks =
    useApiQuery('diskList', { ...pathParams, limit: 50 }).data?.items.filter(
      (d) => d.state.state === 'detached'
    ) || []

  return (
    <SideModalForm
      id={id}
      title={title}
      initialValues={initialValues}
      onSubmit={
        onSubmit ||
        (({ name }) => {
          const { instanceName, ...others } = pathParams
          invariant(instanceName, 'instanceName is required')
          attachDisk.mutate({
            instanceName,
            ...others,
            body: { name },
          })
        })
      }
      submitDisabled={attachDisk.isLoading}
      error={attachDisk.error?.error as Error | undefined}
      {...props}
    >
      <ListboxField
        label="Disk name"
        id="disk-name"
        name="name"
        items={detachedDisks.map(({ name }) => ({ value: name, label: name }))}
      />
    </SideModalForm>
  )
}

export default AttachDiskSideModalForm
