import { useNavigate } from 'react-router-dom'

import { useApiMutation, useApiQueryClient } from '@oxide/api'
import type { SamlIdentityProviderCreate } from '@oxide/api'

import { DescriptionField, NameField, SideModalForm, TextField } from 'app/components/form'
import { useSiloSelector, useToast } from 'app/hooks'
import { pb } from 'app/util/path-builder'

import { MetadataSourceField } from './shared'

export type IdpCreateFormValues = { type: 'saml' } & SamlIdentityProviderCreate

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
  groupAttributeName: '',
  signingKeypair: undefined,
}

export function CreateIdpSideModalForm() {
  const navigate = useNavigate()
  const queryClient = useApiQueryClient()
  const addToast = useToast()

  const { silo } = useSiloSelector()

  const onDismiss = () => navigate(pb.silo({ silo }))

  const createIdp = useApiMutation('samlIdentityProviderCreate', {
    onSuccess() {
      queryClient.invalidateQueries('siloIdentityProviderList', { query: { silo } })
      addToast({
        content: 'Your identity provider has been created',
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
      onSubmit={(values) => {
        createIdp.mutate({
          query: { silo },
          body: {
            ...values,
            // convert empty string to undefined so it remains unset
            groupAttributeName: values.groupAttributeName?.trim() || undefined,
          },
        })
      }}
      loading={createIdp.isLoading}
      submitError={createIdp.error}
      submitLabel="Create provider"
    >
      {({ control }) => (
        <>
          <NameField name="name" control={control} />
          <DescriptionField name="description" control={control} />
          <TextField
            name="acsUrl"
            label="ACS URL"
            helpText="Service provider endpoint for the IdP to send the SAML response"
            required
            control={control}
          />
          {/* TODO: help text */}
          <TextField name="idpEntityId" label="Entity ID" required control={control} />
          <TextField
            name="sloUrl"
            label="Single Logout (SLO) URL"
            helpText="Service provider endpoint for log out requests"
            required
            control={control}
          />
          {/* TODO: help text */}
          <TextField
            name="spClientId"
            label="Service provider client ID"
            required
            control={control}
          />
          <TextField
            name="groupAttributeName"
            label="Group attribute name"
            helpText="Name of SAML attribute where we can find a comma-separated list of names of groups the user belongs to"
            control={control}
          />
          {/* TODO: Email field, probably */}
          <TextField
            name="technicalContactEmail"
            label="Technical contact email"
            required
            control={control}
          />
          <MetadataSourceField control={control} />
          {/* TODO: signingKeypair */}
        </>
      )}
    </SideModalForm>
  )
}
