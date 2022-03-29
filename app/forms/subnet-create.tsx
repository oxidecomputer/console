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

CreateSubnetForm.defaultProps = {
  id: 'create-subnet-form',
  title: 'Create subnet',
  initialValues: values,
  onSubmit: () => {},
}
export function CreateSubnetForm({
  id,
  title,
  initialValues,
  onSubmit,
  ...props
}: BaseFormProps<typeof values>) {
  return (
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    <Form
      id={id!}
      title={title}
      initialValues={initialValues!}
      onSubmit={onSubmit!}
      {...props}
    >
      <NameField id="subnet-name" />
      <DescriptionField id="subnet-description" />
      <Divider />
      <TextField id="subnet-ipv4-block" name="ipv4Block" label="IPv4 block" />
      <TextField id="subnet-ipv6-block" name="ipv6Block" label="IPv6 block" />
      <Form.Actions>
        <Form.Submit>{title!}</Form.Submit>
        <Form.Cancel />
      </Form.Actions>
    </Form>
  )
}

export default CreateSubnetForm
