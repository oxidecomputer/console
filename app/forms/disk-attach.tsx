import { Form, NameField, TextField } from '@oxide/form'
import React from 'react'
import type { PrebuiltFormProps } from '@oxide/form'
import type { Disk } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'
import { invariant } from '@oxide/util'
import { FormParamFields } from 'app/components/FormParamFields'

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
}: PrebuiltFormProps<
  typeof values,
  Disk,
  'orgName' | 'projectName' | 'instanceName'
>) {
  const queryClient = useApiQueryClient()

  const createDisk = useApiMutation('instanceDisksAttach', {
    onSuccess(data, { body: _, ...pathParams }) {
      queryClient.invalidateQueries('instanceDisksGet', pathParams)
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
        (({ orgName, projectName, instanceName, name }) => {
          invariant(
            orgName && projectName && instanceName,
            `disk-attach form is missing a path param`
          )
          createDisk.mutate({
            orgName,
            projectName,
            instanceName,
            body: { disk: name },
          })
        })
      }
      mutation={createDisk}
      {...props}
    >
      <FormParamFields
        id="form-disk-attach-params"
        params={['orgName', 'projectName', 'instanceName']}
      />
      <NameField id="form-disk-attach-name" label="Disk name" />
      <Form.Actions>
        <Form.Submit>{title}</Form.Submit>
        <Form.Cancel />
      </Form.Actions>
    </Form>
  )
}

export default AttachDiskForm
