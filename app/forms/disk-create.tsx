import {
  DescriptionField,
  NameField,
  RadioField,
  Radio,
  DiskSizeField,
  SideModalForm,
} from 'app/components/form'
import type { SideModalProps } from '@oxide/ui'
import { Divider } from '@oxide/ui'
import type { Disk, DiskCreate } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'

import type { CreateFormProps } from 'app/forms'
import { useParams } from 'app/hooks'
import { GiB } from '@oxide/util'

export type DiskCreateValues = Omit<Assign<DiskCreate, { blockSize: string }>, 'diskSource'>

const values: DiskCreateValues = {
  name: '',
  description: '',
  size: 0,
  blockSize: '4096',
}

export const formatDiskCreate = (input: DiskCreateValues): DiskCreate => {
  const blockSize = parseInt(input.blockSize, 10)
  const { size } = input
  return {
    ...input,
    size: Math.ceil((size * GiB) / blockSize) * blockSize,
    // TODO: once there is a source type picker and an image/snapshot picker,
    // the value here will be generated from those values
    diskSource: {
      type: 'blank',
      blockSize,
    },
  }
}

type CreateDiskSideModalFormProps = Omit<SideModalProps, 'id'> &
  CreateFormProps<DiskCreateValues, Disk>

export function CreateDiskSideModalForm({
  id = 'create-disk-form',
  title = 'Create Disk',
  initialValues = values,
  onSubmit,
  onSuccess,
  onError,
  ...props
}: CreateDiskSideModalFormProps) {
  const queryClient = useApiQueryClient()
  const pathParams = useParams('orgName', 'projectName')

  const createDisk = useApiMutation('projectDisksPost', {
    onSuccess(data) {
      queryClient.invalidateQueries('projectDisksGet', pathParams)
      onSuccess?.(data)
    },
    onError,
  })

  return (
    <SideModalForm
      id={id}
      title={title}
      initialValues={initialValues}
      onSubmit={
        onSubmit ||
        ((values) => {
          createDisk.mutate({
            ...pathParams,
            body: formatDiskCreate(values),
          })
        })
      }
      submitDisabled={createDisk.isLoading}
      error={createDisk.error?.error as Error | undefined}
      {...props}
    >
      <NameField id="disk-name" />
      <DescriptionField id="disk-description" />
      <Divider />
      <RadioField
        column
        id="disk-block-size"
        name="blockSize"
        label="Block size"
        units="Bytes"
      >
        <Radio value="512">512</Radio>
        <Radio value="4096">4096</Radio>
      </RadioField>
      <DiskSizeField id="disk-size" name="size" />
    </SideModalForm>
  )
}

export default CreateDiskSideModalForm
