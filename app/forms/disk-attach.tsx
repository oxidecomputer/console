import { Form, NameField } from '@oxide/form'
import React from 'react'
import type { Disk } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'
import { invariant } from '@oxide/util'
import { FormParamFields } from 'app/components/FormParamFields'
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
  const pathParams = useParams('orgName', 'projectName', 'instanceName?')

  const createDisk = useApiMutation('instanceDisksAttach', {
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
