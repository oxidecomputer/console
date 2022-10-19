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
import { pb } from 'app/util/path-builder'

import type { CreateSideModalFormProps } from '.'

const values: SiloCreate = {
  name: '',
  description: '',
  discoverable: true,
  identityMode: 'saml_jit',
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
      queryClient.setQueryData('siloView', { path: { siloName: silo.name } }, silo)
      addToast({
        icon: <Success16Icon />,
        title: 'Success!',
        content: 'Your silo has been created.',
      })
      onSuccess?.(silo)
      navigate(pb.silos())
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
        (({ name, description, discoverable, identityMode }) =>
          createSilo.mutate({
            body: { name, description, discoverable, identityMode },
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
      <RadioField id="silo-identity-mode" name="identityMode" label="Identity mode" column>
        <Radio value="saml_jit">SAML JIT</Radio>
        <Radio value="local_only">Local only</Radio>
      </RadioField>
    </SideModalForm>
  )
}
