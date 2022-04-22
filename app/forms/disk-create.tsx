import {
  DescriptionField,
  Form,
  NameField,
  RadioField,
  Radio,
  DiskSizeField,
} from 'app/components/form'
import { Divider } from '@oxide/ui'
import type { Disk, DiskCreate } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'

import type { PrebuiltFormProps } from 'app/forms'
import { useParams } from 'app/hooks'
import { GiB } from '@oxide/util'

export type DiskCreateInput = Omit<Assign<DiskCreate, { blockSize: string }>, 'diskSource'>

const values: DiskCreateInput = {
  name: '',
  description: '',
  size: 0,
  blockSize: '4096',
}

export const formatDiskCreate = (input: DiskCreateInput): DiskCreate => {
  const blockSize = parseInt(input.blockSize, 10)
  const { size } = input
  return {
    ...input,
    size: Math.ceil((size * GiB) / blockSize) * blockSize,
    // TODO: once there is a source type picker and an image/snapshot picker,
    // the value here will be generated from those values
    diskSource: {
      type: 'Blank',
      blockSize,
    },
  }
}

export function CreateDiskForm({
  id = 'create-disk-form',
  title = 'Create Disk',
  initialValues = values,
  onSubmit,
  onSuccess,
  onError,
  ...props
}: PrebuiltFormProps<typeof values, Disk>) {
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
    <Form
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
      mutation={createDisk}
      {...props}
    >
      <NameField id="disk-name" />
      <DescriptionField id="disk-description" />
      <Divider />
      <RadioField column id="disk-deletion-rule" name="deletionRule" label="Deletion Rule">
        <Radio value="keep">Keep disk</Radio>
        <Radio value="delete">Delete disk</Radio>
      </RadioField>
      <RadioField column id="disk-block-size" name="blockSize" label="Block Size">
        <Radio value="512">512</Radio>
        <Radio value="4096">4096</Radio>
      </RadioField>
      <DiskSizeField id="disk-size" name="size" />
      <Form.Actions>
        <Form.Submit>{title}</Form.Submit>
        <Form.Cancel />
      </Form.Actions>
    </Form>
  )
}

export default CreateDiskForm
