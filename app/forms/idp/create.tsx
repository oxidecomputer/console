/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'

import { useApiMutation, useApiQueryClient } from '@oxide/api'

import { DescriptionField } from '~/components/form/fields/DescriptionField'
import { FileField } from '~/components/form/fields/FileField'
import { NameField } from '~/components/form/fields/NameField'
import { TextField } from '~/components/form/fields/TextField'
import { SideModalForm } from '~/components/form/SideModalForm'
import { HL } from '~/components/HL'
import { titleCrumb } from '~/hooks/use-crumbs'
import { useSiloSelector } from '~/hooks/use-params'
import { addToast } from '~/stores/toast'
import { Checkbox } from '~/ui/lib/Checkbox'
import { FormDivider } from '~/ui/lib/Divider'
import { Message } from '~/ui/lib/Message'
import { SideModal } from '~/ui/lib/SideModal'
import { readBlobAsBase64 } from '~/util/file'
import { links } from '~/util/links'
import { pb } from '~/util/path-builder'

import { MetadataSourceField, type IdpCreateFormValues } from './shared'
import { getDelegatedDomain } from './util'

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

export const handle = titleCrumb('New Identity Provider')

export default function CreateIdpSideModalForm() {
  const navigate = useNavigate()
  const queryClient = useApiQueryClient()

  const { silo } = useSiloSelector()

  const onDismiss = () => navigate(pb.silo({ silo }))

  const createIdp = useApiMutation('samlIdentityProviderCreate', {
    onSuccess(idp) {
      queryClient.invalidateQueries('siloIdentityProviderList')
      addToast(<>IdP <HL>{idp.name}</HL> created</>) // prettier-ignore
      onDismiss()
    },
  })

  const form = useForm({ defaultValues })
  const name = form.watch('name')

  const [generateUrl, setGenerateUrl] = useState(true)

  useEffect(() => {
    // When creating a SAML identity provider connection, the ACS URL that the user enters
    // should always be of the form: http(s)://<silo>.sys.<suffix>/login/<silo>/saml/<name>
    // where <silo> is the Silo name, <suffix> is the delegated domain assigned to the rack,
    // and <name> is the name of the IdP connection
    // The user can override this by unchecking the "Automatically generate ACS URL" checkbox
    // and entering a custom ACS URL, though if they check the box again, we will regenerate
    // the ACS URL.
    const suffix = getDelegatedDomain(window.location)
    if (generateUrl) {
      form.setValue('acsUrl', `https://${silo}.sys.${suffix}/login/${silo}/saml/${name}`)
    }
  }, [form, name, silo, generateUrl])

  return (
    <SideModalForm
      form={form}
      formType="create"
      resourceName="identity provider"
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
      submitLabel="Create"
    >
      <Message
        content={
          <>
            Read the{' '}
            <a
              href={links.identityProvidersDocs}
              className="underline"
              target="_blank"
              rel="noreferrer"
            >
              Rack Configuration
            </a>{' '}
            guide to learn more about setting up an identity provider.
          </>
        }
      />
      <NameField
        name="name"
        control={form.control}
        description={
          <>
            A short name for the provider in our system. Users will see it in the path to
            the login page:{' '}
            <code>
              /login/{silo}/saml/{name.trim() || 'idp-name'}
            </code>
          </>
        }
      />
      <DescriptionField name="description" control={form.control} required />
      <TextField
        name="technicalContactEmail"
        label="Technical contact email"
        required
        control={form.control}
      />

      <FormDivider />

      <SideModal.Heading>Service provider</SideModal.Heading>
      {/* TODO: help text */}
      <TextField
        name="spClientId"
        label="Service provider client ID"
        required
        control={form.control}
      />
      <div className="flex flex-col gap-2">
        <TextField
          name="acsUrl"
          label="ACS URL"
          description={
            <div className="children:inline-block">
              <span>
                Oxide endpoint for the identity provider to send the SAML response.{' '}
              </span>
              <span>
                URL is generated from the current hostname, silo name, and provider name
                according to a standard format.
              </span>
            </div>
          }
          required
          control={form.control}
          disabled={generateUrl}
          copyable
        />
        <Checkbox checked={generateUrl} onChange={(e) => setGenerateUrl(e.target.checked)}>
          Use standard ACS URL
        </Checkbox>
      </div>
      <TextField
        name="sloUrl"
        label="Single Logout (SLO) URL"
        description="Service provider endpoint for log out requests"
        required
        control={form.control}
      />

      <FormDivider />

      <SideModal.Heading>Request signing</SideModal.Heading>
      {/* We don't bother validating that you have both of these or neither even
          though the API requires that because we are going to change the API to
          always require both, at which point these become simple `required` fields */}
      <FileField
        id="public-cert-file-input"
        name="signingKeypair.publicCert"
        description="DER-encoded X.509 certificate"
        label="Public certificate"
        control={form.control}
      />
      <FileField
        id="private-key-file-input"
        name="signingKeypair.privateKey"
        description="DER-encoded private key"
        label="Private key"
        control={form.control}
      />

      <FormDivider />

      <SideModal.Heading>Identity provider</SideModal.Heading>
      {/* TODO: help text */}
      <TextField name="idpEntityId" label="Entity ID" required control={form.control} />
      <TextField
        name="groupAttributeName"
        label="Group attribute name"
        description="Name of the SAML attribute in the IdP response listing the user’s groups"
        control={form.control}
      />
      <MetadataSourceField control={form.control} />
    </SideModalForm>
  )
}
