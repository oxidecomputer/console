import { useNavigate } from 'react-router-dom'

import { useApiMutation, useApiQueryClient } from '@oxide/api'

import { DescriptionField, NameField, SideModalForm, TextField } from 'app/components/form'
import { FileField } from 'app/components/form/fields'
import { useSiloSelector, useToast } from 'app/hooks'
import { readBlobAsBase64 } from 'app/util/file'
import { pb } from 'app/util/path-builder'

import type { IdpCreateFormValues } from './shared'
import { MetadataSourceField } from './shared'

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
  signingKeypair: {
    publicCert: null,
    privateKey: null,
  },
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
      onSubmit={async ({
        signingKeypair,
        groupAttributeName,
        idpMetadataSource,
        idpMetadataSourceFile,
        ...rest
      }) => {
        // if both signingKeypair files are present, base64 and add to post
        const keypair =
          signingKeypair.publicCert && signingKeypair.privateKey
            ? {
                publicCert: await readBlobAsBase64(signingKeypair.publicCert),
                privateKey: await readBlobAsBase64(signingKeypair.privateKey),
              }
            : undefined

        const metadataSource =
          idpMetadataSourceFile && idpMetadataSource.type === 'base64_encoded_xml'
            ? {
                type: idpMetadataSource.type,
                data: await readBlobAsBase64(idpMetadataSourceFile),
              }
            : idpMetadataSource

        createIdp.mutate({
          query: { silo },
          body: {
            ...rest,
            idpMetadataSource: metadataSource,
            // convert empty string to undefined so it remains unset
            groupAttributeName: groupAttributeName?.trim() || undefined,
            signingKeypair: keypair,
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
          <DescriptionField name="description" control={control} required />
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
          {/* We don't bother validating that you have both of these or neither even
              though the API requires that because we are going to change the API to
              always require both, at which point these become simple `required` fields */}
          <FileField
            id="public-cert-file-input"
            name="signingKeypair.publicCert"
            helpText="DER-encoded X.509 certificate"
            label="Public cert"
            control={control}
          />
          <FileField
            id="private-key-file-input"
            name="signingKeypair.privateKey"
            helpText="DER-encoded private key"
            label="Private key"
            control={control}
          />
        </>
      )}
    </SideModalForm>
  )
}
