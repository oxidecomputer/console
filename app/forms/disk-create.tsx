import type { NavigateFunction } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'

import type { BlockSize, Disk, DiskCreate } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'
import { Divider, Success16Icon } from '@oxide/ui'
import { GiB } from '@oxide/util'

import {
  DescriptionField,
  DiskSizeField,
  NameField,
  RadioField,
  SideModalForm,
} from 'app/components/hook-form'
import { useRequiredParams, useToast } from 'app/hooks'

const defaultValues: DiskCreate = {
  name: '',
  description: '',
  size: 10,
  diskSource: {
    blockSize: 4096,
    type: 'blank',
  },
}

type CreateSideModalFormProps = {
  /**
   * If defined, this overrides the usual mutation. Caller is responsible for
   * doing a dismiss behavior in onSubmit as well, because we are not calling
   * the RQ `onSuccess` defined for the mutation.
   */
  onSubmit?: (diskCreate: DiskCreate) => void
  /**
   * Passing navigate is a bit of a hack to be able to do a nav from the routes
   * file. The callers that don't need the arg can ignore it.
   */
  onDismiss: (navigate: NavigateFunction) => void
  onSuccess?: (disk: Disk) => void
}

export function CreateDiskSideModalForm({
  onSubmit,
  onSuccess,
  onDismiss,
}: CreateSideModalFormProps) {
  const queryClient = useApiQueryClient()
  const pathParams = useRequiredParams('orgName', 'projectName')
  const addToast = useToast()
  const navigate = useNavigate()

  const createDisk = useApiMutation('diskCreate', {
    onSuccess(data) {
      queryClient.invalidateQueries('diskList', { path: pathParams })
      addToast({
        icon: <Success16Icon />,
        title: 'Success!',
        content: 'Your disk has been created.',
      })
      onSuccess?.(data)
      onDismiss(navigate)
    },
  })

  return (
    <SideModalForm
      id="create-disk-form"
      title="Create Disk"
      formOptions={{ defaultValues }}
      onDismiss={() => onDismiss(navigate)}
      onSubmit={({ size, ...rest }) => {
        const body = { size: size * GiB, ...rest }
        onSubmit ? onSubmit(body) : createDisk.mutate({ path: pathParams, body })
      }}
      submitDisabled={createDisk.isLoading}
      submitError={createDisk.error}
    >
      {(control) => (
        <>
          <NameField name="name" control={control} />
          <DescriptionField name="description" control={control} />
          <Divider />
          <RadioField
            column
            name="diskSource.blockSize"
            label="Block size"
            units="Bytes"
            control={control}
            parseValue={(val) => parseInt(val, 10) as BlockSize}
            items={[
              { label: '4096', value: 4096 },
              { label: '512', value: 512 },
            ]}
          />
          <DiskSizeField name="size" control={control} />
        </>
      )}
    </SideModalForm>
  )
}
