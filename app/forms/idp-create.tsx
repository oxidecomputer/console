import { useNavigate } from 'react-router-dom'

import type { SamlIdentityProviderCreate } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'
import { Success16Icon } from '@oxide/ui'

import { DescriptionField, NameField, SideModalForm } from 'app/components/form'
import { pb } from 'app/util/path-builder'

import { useSiloParams, useToast } from '../hooks'

type IdpCreateFormValues = { type: 'saml' } & SamlIdentityProviderCreate

const defaultValues: IdpCreateFormValues = {
  type: 'saml',
  name: '',
  description: '',
  acsUrl: '',
  idpEntityId: '',
  idpMetadataSource: {
    type: 'url',
    url: '',
  },
  sloUrl: '',
  spClientId: '',
  technicalContactEmail: '',
}

export function CreateIdpSideModalForm() {
  const navigate = useNavigate()
  const queryClient = useApiQueryClient()
  const addToast = useToast()

  const { siloName } = useSiloParams()

  const onDismiss = () => navigate(pb.silo({ siloName }))

  const createIdp = useApiMutation('samlIdentityProviderCreate', {
    onSuccess() {
      queryClient.invalidateQueries('siloIdentityProviderList', { path: { siloName } })
      addToast({
        icon: <Success16Icon />,
        title: 'Success!',
        content: 'Your identity provider has been created.',
      })
      onDismiss()
    },
  })

  return (
    <SideModalForm
      id="create-idp-form"
      formOptions={{ defaultValues }}
      title="Create identity provider"
      onDismiss={onDismiss}
      onSubmit={(values) => createIdp.mutate({ path: { siloName }, body: values })}
      submitDisabled={createIdp.isLoading}
      submitError={createIdp.error}
      submitLabel="Create provider"
    >
      {({ control }) => (
        <>
          <NameField name="name" control={control} />
          <DescriptionField name="description" control={control} />
        </>
      )}
    </SideModalForm>
  )
}
