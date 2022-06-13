import type { Disk, DiskCreate } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'
import type { SideModalProps } from '@oxide/ui'
import { Divider } from '@oxide/ui'
import { GiB } from '@oxide/util'

import { SideModalForm } from 'app/components/form'
import {
  DescriptionField,
  DiskSizeField,
  NameField,
  Radio,
  RadioField,
} from 'app/components/form'
import type { CreateFormProps } from 'app/forms'
import { useParams } from 'app/hooks'

const values: DiskCreate = {
  name: '',
  description: '',
  size: 0,
  diskSource: {
    blockSize: 4096,
    type: 'blank',
  },
}

type CreateDiskSideModalFormProps = Omit<SideModalProps, 'id'> &
  CreateFormProps<DiskCreate, Disk>

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
            body: {
              ...values,
              size: values.size * GiB,
            },
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
