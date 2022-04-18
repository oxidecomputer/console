import { Form, NameField } from 'app/components/form'
import React from 'react'
import type { Disk } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'
import invariant from 'tiny-invariant'
import { useParams } from 'app/hooks'
import type { PrebuiltFormProps } from 'app/forms'

const values = {
  name: '',
}

export function AttachDiskForm({
  id = 'form-disk-attach',
  title = 'Attach Disk',
  initialValues = values,
  onSubmit,
  onSuccess,
  onError,
  ...props
}: PrebuiltFormProps<typeof values, Disk>) {
  const queryClient = useApiQueryClient()
  const pathParams = useParams('orgName', 'projectName')

  const attachDisk = useApiMutation('instanceDisksAttach', {
    onSuccess(data) {
      const { instanceName, ...others } = pathParams
      invariant(instanceName, 'instanceName is required')
      queryClient.invalidateQueries('instanceDisksGet', {
        instanceName,
        ...others,
      })
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
        (({ name }) => {
          const { instanceName, ...others } = pathParams
          invariant(instanceName, 'instanceName is required')
          attachDisk.mutate({
            instanceName,
            ...others,
            body: { name },
          })
        })
      }
      mutation={attachDisk}
      {...props}
    >
      <NameField id="form-disk-attach-name" label="Disk name" />
      <Form.Actions>
        <Form.Submit>{title}</Form.Submit>
        <Form.Cancel />
      </Form.Actions>
    </Form>
  )
}

export default AttachDiskForm
