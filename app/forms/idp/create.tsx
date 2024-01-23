/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useNavigate } from 'react-router-dom'

import { useApiMutation, useApiQueryClient } from '@oxide/api'

import {
  DescriptionField,
  FileField,
  NameField,
  SideModalForm,
  TextField,
} from 'app/components/form'
import { useForm, useSiloSelector, useToast } from 'app/hooks'
import { readBlobAsBase64 } from 'app/util/file'
import { pb } from 'app/util/path-builder'

import { MetadataSourceField, type IdpCreateFormValues } from './shared'

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
      queryClient.invalidateQueries('siloIdentityProviderList')
      addToast({ content: 'Your identity provider has been created' })
      onDismiss()
    },
  })

  const form = useForm({ defaultValues })

  return (
    <SideModalForm
      id="create-idp-form"
      form={form}
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
      loading={createIdp.isPending}
      submitError={createIdp.error}
      submitLabel="Create provider"
    >
      <NameField name="name" control={form.control} />
      <DescriptionField name="description" control={form.control} required />
      <TextField
        name="acsUrl"
        label="ACS URL"
        description="Service provider endpoint for the IdP to send the SAML response"
        required
        control={form.control}
      />
      {/* TODO: help text */}
      <TextField name="idpEntityId" label="Entity ID" required control={form.control} />
      <TextField
        name="sloUrl"
        label="Single Logout (SLO) URL"
        description="Service provider endpoint for log out requests"
        required
        control={form.control}
      />
      {/* TODO: help text */}
      <TextField
        name="spClientId"
        label="Service provider client ID"
        required
        control={form.control}
      />
      <TextField
        name="groupAttributeName"
        label="Group attribute name"
        description="Name of SAML attribute where we can find a comma-separated list of names of groups the user belongs to"
        control={form.control}
      />
      {/* TODO: Email field, probably */}
      <TextField
        name="technicalContactEmail"
        label="Technical contact email"
        required
        control={form.control}
      />
      <MetadataSourceField control={form.control} />
      {/* We don't bother validating that you have both of these or neither even
              though the API requires that because we are going to change the API to
              always require both, at which point these become simple `required` fields */}
      <FileField
        id="public-cert-file-input"
        name="signingKeypair.publicCert"
        description="DER-encoded X.509 certificate"
        label="Public cert"
        control={form.control}
      />
      <FileField
        id="private-key-file-input"
        name="signingKeypair.privateKey"
        description="DER-encoded private key"
        label="Private key"
        control={form.control}
      />
    </SideModalForm>
  )
}
