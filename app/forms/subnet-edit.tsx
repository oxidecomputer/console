import React from 'react'
import { CreateSubnetForm } from './subnet-create'
import type { ExtendedFormProps } from './helpers/form-types'

EditSubnetForm.defaultProps = {
  id: 'edit-subnet-form',
  title: 'Edit subnet',
}

export function EditSubnetForm({
  id = 'edit-subnet-form',
  title = 'Edit subnet',
  ...props
}: ExtendedFormProps<typeof CreateSubnetForm>) {
  return <CreateSubnetForm id={id} title={title} {...props} />
}

export default EditSubnetForm
