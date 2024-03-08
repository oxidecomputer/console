/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useNavigate, type LoaderFunctionArgs } from 'react-router-dom'

import { apiQueryClient, usePrefetchedApiQuery } from '@oxide/api'
import { Access16Icon } from '@oxide/design-system/icons/react'

import { DescriptionField } from '~/components/form/fields/DescriptionField'
import { NameField } from '~/components/form/fields/NameField'
import { TextField } from '~/components/form/fields/TextField'
import { SideModalForm } from '~/components/form/SideModalForm'
import { getIdpSelector, useForm, useIdpSelector } from '~/hooks'
import { PropertiesTable } from '~/ui/lib/PropertiesTable'
import { ResourceLabel } from '~/ui/lib/SideModal'
import { Truncate } from '~/ui/lib/Truncate'
import { formatDateTime } from '~/util/date'
import { pb } from '~/util/path-builder'

EditIdpSideModalForm.loader = async ({ params }: LoaderFunctionArgs) => {
  const { silo, provider } = getIdpSelector(params)
  await apiQueryClient.prefetchQuery('samlIdentityProviderView', {
    path: { provider },
    query: { silo },
  })
  return null
}

export function EditIdpSideModalForm() {
  const { silo, provider } = useIdpSelector()
  const { data: idp } = usePrefetchedApiQuery('samlIdentityProviderView', {
    path: { provider },
    query: { silo },
  })

  const navigate = useNavigate()
  const onDismiss = () => navigate(pb.silo({ silo }))

  const form = useForm({ defaultValues: idp })

  return (
    <SideModalForm
      form={form}
      resourceName="identity provider"
      formType="edit"
      onDismiss={onDismiss}
      subtitle={
        <ResourceLabel>
          <Access16Icon /> {idp.name}
        </ResourceLabel>
      }
      // TODO: pass actual error when this form is hooked up
      submitError={null}
    >
      <PropertiesTable>
        <PropertiesTable.Row label="ID">
          <Truncate text={idp.id} maxLength={32} hasCopyButton />
        </PropertiesTable.Row>
        <PropertiesTable.Row label="Created">
          {formatDateTime(idp.timeCreated)}
        </PropertiesTable.Row>
        <PropertiesTable.Row label="Updated">
          {formatDateTime(idp.timeModified)}
        </PropertiesTable.Row>
      </PropertiesTable>

      <NameField name="name" control={form.control} disabled />
      <DescriptionField name="description" control={form.control} required disabled />
      <TextField
        name="acsUrl"
        label="ACS URL"
        description="Service provider endpoint for the IdP to send the SAML response"
        required
        control={form.control}
        disabled
      />
      {/* TODO: help text */}
      <TextField
        name="idpEntityId"
        label="Entity ID"
        required
        control={form.control}
        disabled
      />
      <TextField
        name="sloUrl"
        label="Single Logout (SLO) URL"
        description="Service provider endpoint for log out requests"
        required
        control={form.control}
        disabled
      />
      {/* TODO: help text */}
      <TextField
        name="spClientId"
        label="Service provider client ID"
        required
        control={form.control}
        disabled
      />
      {/* TODO: add group attribute name when it is added to the API
          <TextField
            name="groupAttributeName"
            label="Group attribute name"
            description="Name of SAML attribute where we can find a comma-separated list of names of groups the user belongs to"
            control={form.control}
            disabled
          /> */}
      {/* TODO: Email field, probably */}
      <TextField
        name="technicalContactEmail"
        label="Technical contact email"
        required
        control={form.control}
        disabled
      />
    </SideModalForm>
  )
}
