import { DescriptionField, Form, NameField, TextField } from '@oxide/form'
import { Divider } from '@oxide/ui'
import { RadioField, Radio } from '@oxide/form'
import React from 'react'
import type { BaseFormProps } from './helpers/form-types'

const values = {
  name: '',
  description: '',
  size: 0,
  type: '',
  sourceType: '',
  deletionRule: '',
}

CreateDiskForm.defaultProps = {
  id: 'create-disk-form',
  title: 'Create Disk',
  initialValues: values,
  onSubmit: () => {},
}
export function CreateDiskForm({
  id,
  title,
  initialValues,
  onSubmit,
  ...props
}: BaseFormProps<typeof values>) {
  return (
    <Form
      id={id!}
      title={title}
      initialValues={initialValues!}
      onSubmit={onSubmit!}
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
        <Form.Submit>{title!}</Form.Submit>
        <Form.Cancel />
      </Form.Actions>
    </Form>
  )
}

export default CreateDiskForm
