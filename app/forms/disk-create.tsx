import { DescriptionField, Form, NameField, TextField } from '@oxide/form'
import { Divider } from '@oxide/ui'
import React from 'react'
import type { BaseFormProps } from './helpers/form-types'

const values = {
  name: '',
  description: '',
  ipv4Block: '',
  ipv6Block: '',
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
      <Form.Actions>
        <Form.Submit>{title!}</Form.Submit>
        <Form.Cancel />
      </Form.Actions>
    </Form>
  )
}

export default CreateDiskForm
