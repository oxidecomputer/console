import { Form, NameField } from '@oxide/form'
import React from 'react'
import type { PrebuiltFormProps } from '@oxide/form'
import { useParams } from 'app/hooks'
import type { Disk } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'

const values = {
  name: '',
}

export function AttachDiskForm({
  id = 'create-disk-form',
  title = 'Create Disk',
  initialValues = values,
  onSubmit,
  onSuccess,
  onError,
  ...props
}: PrebuiltFormProps<typeof values, Disk>) {
  const parentNames = useParams('orgName', 'projectName', 'instanceName')
  const queryClient = useApiQueryClient()

  const createDisk = useApiMutation('instanceDisksAttach', {
    onSuccess(data) {
      queryClient.invalidateQueries('instanceDisksGet', parentNames)
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
          createDisk.mutate({ ...parentNames, body })
        })
      }
      mutation={createDisk}
      {...props}
    >
      <NameField id="disk-name" />
      <Form.Actions>
        <Form.Submit>{title}</Form.Submit>
        <Form.Cancel />
      </Form.Actions>
    </Form>
  )
}

export default AttachDiskForm
