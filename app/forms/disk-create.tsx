import {
  DescriptionField,
  Form,
  NameField,
  TextField,
  RadioField,
  Radio,
} from '@oxide/form'
import { Divider } from '@oxide/ui'
import React from 'react'
import type { PrebuiltFormProps } from '@oxide/form'
import { useParams } from 'app/hooks'
import { useApiMutation, useApiQueryClient } from '@oxide/api'

const values = {
  name: '',
  description: '',
  size: 0,
  type: '',
  sourceType: '',
  deletionRule: '',
}

export function CreateDiskForm({
  id = 'create-disk-form',
  title = 'Create Disk',
  initialValues = values,
  onSubmit,
  onSuccess,
  onError,
  ...props
}: PrebuiltFormProps<typeof values>) {
  const parentIds = useParams('orgName', 'projectName')
  const queryClient = useApiQueryClient()

  const createDisk = useApiMutation('projectDisksPost', {
    onSuccess(data) {
      queryClient.invalidateQueries('projectDisksGet', parentIds)
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
          createDisk.mutate({ ...parentIds, body })
        })
      }
      {...props}
    >
      <NameField id="disk-name" />
      <DescriptionField id="disk-description" />
      <Divider />
      <TextField id="disk-type" name="type" />
      <RadioField id="disk-source-type" name="sourceType">
        <Radio value="blank">Blank disk</Radio>
        <Radio value="image">Image</Radio>
        <Radio value="snapshot">Snapshot</Radio>
      </RadioField>
      <RadioField id="disk-deletion-rule" name="deletionRule">
        <Radio value="keep">Keep disk</Radio>
        <Radio value="delete">Delete disk</Radio>
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
