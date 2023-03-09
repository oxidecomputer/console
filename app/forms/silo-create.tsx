import { useNavigate } from 'react-router-dom'

import type { SiloCreate } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'
import { Success16Icon } from '@oxide/ui'

import {
  CheckboxField,
  DescriptionField,
  NameField,
  RadioField,
  SideModalForm,
} from 'app/components/form'
import { useToast } from 'app/hooks'
import { pb } from 'app/util/path-builder'

const defaultValues: SiloCreate = {
  name: '',
  description: '',
  discoverable: true,
  identityMode: 'saml_jit',
}

export function CreateSiloSideModalForm() {
  const navigate = useNavigate()
  const queryClient = useApiQueryClient()
  const addToast = useToast()

  const onDismiss = () => navigate(pb.silos())

  const createSilo = useApiMutation('siloCreateV1', {
    onSuccess(silo) {
      queryClient.invalidateQueries('siloListV1', {})
      queryClient.setQueryData('siloViewV1', { path: { silo: silo.name } }, silo)
      addToast({
        icon: <Success16Icon />,
        title: 'Success!',
        content: 'Your silo has been created.',
      })
      onDismiss()
    },
  })

  return (
    <SideModalForm
      id="create-silo-form"
      title="Create silo"
      formOptions={{ defaultValues }}
      onDismiss={onDismiss}
      onSubmit={({ name, description, discoverable, identityMode }) =>
        createSilo.mutate({
          body: { name, description, discoverable, identityMode },
        })
      }
      loading={createSilo.isLoading}
      submitError={createSilo.error}
    >
      {({ control }) => (
        <>
          <NameField name="name" control={control} />
          <DescriptionField name="description" control={control} />
          <CheckboxField name="discoverable" control={control}>
            Discoverable
          </CheckboxField>
          <RadioField
            name="identityMode"
            label="Identity mode"
            column
            control={control}
            items={[
              { value: 'saml_jit', label: 'SAML JIT' },
              { value: 'local_only', label: 'Local only' },
            ]}
          />
        </>
      )}
    </SideModalForm>
  )
}
