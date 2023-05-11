import { useNavigate } from 'react-router-dom'

import type { SiloCreate } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'
import { Success12Icon } from '@oxide/ui'

import {
  CheckboxField,
  DescriptionField,
  NameField,
  RadioField,
  SideModalForm,
  TextField,
} from 'app/components/form'
import { useToast } from 'app/hooks'
import { pb } from 'app/util/path-builder'

const defaultValues: SiloCreate = {
  name: '',
  description: '',
  discoverable: true,
  identityMode: 'saml_jit',
  adminGroupName: '',
}

export function CreateSiloSideModalForm() {
  const navigate = useNavigate()
  const queryClient = useApiQueryClient()
  const addToast = useToast()

  const onDismiss = () => navigate(pb.silos())

  const createSilo = useApiMutation('siloCreate', {
    onSuccess(silo) {
      queryClient.invalidateQueries('siloList', {})
      queryClient.setQueryData('siloView', { path: { silo: silo.name } }, silo)
      addToast({
        icon: <Success12Icon />,
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
      onSubmit={({ adminGroupName, ...rest }) =>
        createSilo.mutate({
          body: {
            // no point setting it to empty string or whitespace
            adminGroupName: adminGroupName?.trim() || undefined,
            ...rest,
          },
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
          <TextField
            name="adminGroupName"
            label="Admin group name"
            helpText="This group will be created and granted the Silo Admin role"
            control={control}
          />
        </>
      )}
    </SideModalForm>
  )
}
