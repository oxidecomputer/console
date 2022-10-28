import type { Disk, DiskCreate } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'
import { Divider } from '@oxide/ui'
import { Success16Icon } from '@oxide/ui'
import { GiB } from '@oxide/util'

import {
  DescriptionField,
  DiskSizeField,
  NameField,
  RadioField,
  SideModalForm,
} from 'app/components/hook-form'
import { useRequiredParams, useToast } from 'app/hooks'

const defaultValues: DiskCreate = {
  name: '',
  description: '',
  size: 10,
  diskSource: {
    blockSize: 4096,
    type: 'blank',
  },
}

type CreateSideModalFormProps = {
  onSubmit?: (diskCreate: DiskCreate) => void
  onDismiss: () => void
  onSuccess?: (disk: Disk) => void
}

export function CreateDiskSideModalForm({
  onSubmit,
  onSuccess,
  onDismiss,
}: CreateSideModalFormProps) {
  const queryClient = useApiQueryClient()
  const pathParams = useRequiredParams('orgName', 'projectName')
  const addToast = useToast()

  const createDisk = useApiMutation('diskCreate', {
    onSuccess(data) {
      queryClient.invalidateQueries('diskList', { path: pathParams })
      addToast({
        icon: <Success16Icon />,
        title: 'Success!',
        content: 'Your disk has been created.',
      })
      onSuccess?.(data)
      onDismiss()
    },
  })

  return (
    <SideModalForm
      id="create-disk-form"
      title="Create Disk"
      formOptions={{ defaultValues }}
      onDismiss={onDismiss}
      onSubmit={({ size, ...rest }) => {
        const body = { size: size * GiB, ...rest }
        // important: if onSubmit is passed in, it overrides the mutation
        onSubmit ? onSubmit(body) : createDisk.mutate({ path: pathParams, body })
      }}
      submitDisabled={createDisk.isLoading}
      submitError={createDisk.error}
    >
      {(control) => (
        <>
          <NameField name="name" control={control} />
          <DescriptionField name="description" control={control} />
          <Divider />
          <RadioField
            column
            name="diskSource.blockSize"
            label="Block size"
            units="Bytes"
            control={control}
            items={[
              { label: '4096', value: 4096 },
              { label: '512', value: 512 },
            ]}
          />
          <DiskSizeField name="size" control={control} />
        </>
      )}
    </SideModalForm>
  )
}
