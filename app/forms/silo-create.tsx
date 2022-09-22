import { useNavigate } from 'react-router-dom'

import type { Silo, SiloCreate } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'
import { Radio, Success16Icon } from '@oxide/ui'

import {
  CheckboxField,
  DescriptionField,
  NameField,
  RadioField,
  SideModalForm,
} from 'app/components/form'
import { useToast } from 'app/hooks'

import type { CreateSideModalFormProps } from '.'

const values: SiloCreate = {
  name: '',
  description: '',
  discoverable: true,
  userProvisionType: 'fixed',
}

export function CreateSiloSideModalForm({
  id = 'create-silo-form',
  title = 'Create silo',
  initialValues = values,
  onSubmit,
  onSuccess,
  onError,
  onDismiss,
  ...props
}: CreateSideModalFormProps<SiloCreate, Silo>) {
  const navigate = useNavigate()
  const queryClient = useApiQueryClient()
  const addToast = useToast()

  const createSilo = useApiMutation('siloCreate', {
    onSuccess(silo) {
      queryClient.invalidateQueries('siloList', {})
      queryClient.setQueryData('siloView', { siloName: silo.name }, silo)
      addToast({
        icon: <Success16Icon />,
        title: 'Success!',
        content: 'Your silo has been created.',
      })
      onSuccess?.(silo)
      navigate(`/system/silos`)
    },
    onError,
  })

  return (
    <SideModalForm
      id={id}
      title={title}
      initialValues={initialValues}
      onDismiss={onDismiss}
      onSubmit={
        onSubmit ??
        (({ name, description, discoverable, userProvisionType }) =>
          createSilo.mutate({
            body: { name, description, discoverable, userProvisionType },
          }))
      }
      submitDisabled={createSilo.isLoading}
      {...props}
    >
      <NameField id="silo-name" />
      <DescriptionField id="silo-description" />
      <CheckboxField id="silo-discoverable" name="discoverable">
        Discoverable
      </CheckboxField>
      <RadioField
        id="silo-user-provision-type"
        name="userProvisionType"
        label="User provision type"
        column
      >
        <Radio value="fixed">Fixed</Radio>
        <Radio value="jit">JIT</Radio>
      </RadioField>
    </SideModalForm>
  )
}
