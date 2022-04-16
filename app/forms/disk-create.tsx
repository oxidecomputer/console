import React from 'react'
import {
  DescriptionField,
  Form,
  NameField,
  TextField,
  RadioField,
  Radio,
} from 'app/components/form'
import { Divider } from '@oxide/ui'
import type { Disk } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'

import type { PrebuiltFormProps } from 'app/forms'
import { useParams } from 'app/hooks'

const values = {
  name: '',
  description: '',
  size: 0,
  sourceType: 'blank',
  deletionRule: 'keep',
  blockSize: 2048,
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
        ((body) => {
          createDisk.mutate({ ...pathParams, body })
        })
      }
      mutation={createDisk}
      {...props}
    >
      <NameField id="disk-name" />
      <DescriptionField id="disk-description" />
      <Divider />
      <RadioField column id="disk-source-type" name="sourceType" label="Source type">
        <Radio value="blank">Blank disk</Radio>
        <Radio value="image">Image</Radio>
        <Radio value="snapshot">Snapshot</Radio>
      </RadioField>
      <RadioField column id="disk-deletion-rule" name="deletionRule" label="Deletion Rule">
        <Radio value="keep">Keep disk</Radio>
        <Radio value="delete">Delete disk</Radio>
      </RadioField>
      <RadioField column id="disk-block-size" name="blockSize" label="Block Size (MiB)">
        <Radio value={512}>512</Radio>
        <Radio value={2048}>2048</Radio>
        <Radio value={4096}>4096</Radio>
      </RadioField>
      <TextField id="disk-size" name="size" label="Size (GiB)" type="number" />
      <Form.Actions>
        <Form.Submit>{title}</Form.Submit>
        <Form.Cancel />
      </Form.Actions>
    </Form>
  )
}

export default CreateDiskForm
