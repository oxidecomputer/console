import type { Disk, DiskCreate } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'
import { Divider } from '@oxide/ui'
import { Success16Icon } from '@oxide/ui'
import { GiB } from '@oxide/util'

import { SideModalForm } from 'app/components/form'
import {
  DescriptionField,
  DiskSizeField,
  NameField,
  Radio,
  RadioField,
} from 'app/components/form'
import { useRequiredParams, useToast } from 'app/hooks'

import type { CreateSideModalFormProps } from '.'

const values: DiskCreate = {
  name: '',
  description: '',
  size: 0,
  diskSource: {
    blockSize: 4096,
    type: 'blank',
  },
}

export function CreateDiskSideModalForm({
  id = 'create-disk-form',
  title = 'Create Disk',
  initialValues = values,
  onSubmit,
  onSuccess,
  onError,
  onDismiss,
  ...props
}: CreateSideModalFormProps<DiskCreate, Disk>) {
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
          createDisk.mutate({
            path: pathParams,
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
