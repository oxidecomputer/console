import React from 'react'
import {
  DescriptionField,
  Form,
  NameField,
  TextField,
  RadioField,
  Radio,
} from '@oxide/form'
import { Divider } from '@oxide/ui'
import type { Disk } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'
import { invariant } from '@oxide/util'

import type { PrebuiltFormProps } from 'app/forms'
import { FormParamFields } from 'app/components/FormParamFields'

const values = {
  name: '',
  description: '',
  size: 0,
  type: '',
  sourceType: '',
  deletionRule: '',
}

export const params = ['orgName', 'projectName'] as const

export function CreateDiskForm({
  id = 'create-disk-form',
  title = 'Create Disk',
  initialValues = values,
  onSubmit,
  onSuccess,
  onError,
  ...props
}: PrebuiltFormProps<typeof values, Disk, typeof params>) {
  const queryClient = useApiQueryClient()

  const createDisk = useApiMutation('projectDisksPost', {
    onSuccess(data, { body: _, ...pathParams }) {
      queryClient.invalidateQueries('projectDisksGet', pathParams)
      onSuccess?.(data, pathParams)
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
        (({ orgName, projectName, ...body }) => {
          invariant(
            orgName && projectName,
            `disk-create form is missing a path param`
          )
          createDisk.mutate({ orgName, projectName, body })
        })
      }
      mutation={createDisk}
      {...props}
    >
      <FormParamFields id={`${id}-params`} params={params} />
      <NameField id="disk-name" />
      <DescriptionField id="disk-description" />
      <Divider />
      <TextField id="disk-type" name="type" />
      <RadioField column id="disk-source-type" name="sourceType">
        <Radio value="blank">Blank disk</Radio>
        <Radio value="image">Image</Radio>
        <Radio value="snapshot">Snapshot</Radio>
      </RadioField>
      <RadioField column id="disk-deletion-rule" name="deletionRule">
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
