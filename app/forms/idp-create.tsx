import type { Control } from 'react-hook-form'
import { useController } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

import type { IdpMetadataSource, SamlIdentityProviderCreate } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'
import { FieldLabel, Radio, RadioGroup, Success16Icon } from '@oxide/ui'

import { DescriptionField, NameField, SideModalForm, TextField } from 'app/components/form'
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
  groupAttributeName: '',
  signingKeypair: undefined,
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
      onSubmit={(values) =>
        createIdp.mutate({
          path: { siloName },
          body: {
            ...values,
            // convert empty string to undefined so it remains unset
            groupAttributeName: values.groupAttributeName?.trim() || undefined,
            // TODO: set idpMetadataSource to undefined explicitly if value string is empty
          },
        })
      }
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

function MetadataSourceField({ control }: { control: Control<IdpCreateFormValues> }) {
  const {
    field: { value: source, onChange: setSource },
  } = useController({ control, name: 'idpMetadataSource' })
  return (
    <>
      <FieldLabel id="metadata-source-label">Metadata source</FieldLabel>
      <RadioGroup
        name="metadata_source_type"
        defaultChecked="url"
        onChange={(e) => {
          const newValue: IdpMetadataSource =
            e.target.value === 'url'
              ? { type: 'url', url: '' }
              : { type: 'base64_encoded_xml', data: '' }
          setSource(newValue)
        }}
      >
        <Radio value="url">URL</Radio>
        <Radio value="base64_encoded_xml">Base64-encoded XML</Radio>
      </RadioGroup>
      {/* TODO: these inputs should not have their own label */}
      {/* TODO: preserve whatever was in the input in local state
          when the type changes */}
      {source.type === 'url' && (
        <TextField
          name="idpMetadataSource.url"
          label="Metadata URL"
          // to give it the same height as the textarea
          className="mb-8"
          control={control}
        />
      )}
      {source.type === 'base64_encoded_xml' && (
        <TextField
          name="idpMetadataSource.data"
          as="textarea"
          label="Metadata"
          control={control}
        />
      )}
    </>
  )
}
