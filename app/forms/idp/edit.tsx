/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useForm } from 'react-hook-form'
import type { LoaderFunctionArgs } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import invariant from 'tiny-invariant'

import { apiQueryClient, useApiQuery } from '@oxide/api'
import { Access16Icon, PropertiesTable, ResourceLabel, Truncate } from '@oxide/ui'
import { formatDateTime } from '@oxide/util'

import { DescriptionField, NameField, SideModalForm, TextField } from 'app/components/form'
import { getIdpSelector, useIdpSelector } from 'app/hooks'
import { pb } from 'app/util/path-builder'

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
  const { data: idp } = useApiQuery('samlIdentityProviderView', {
    path: { provider },
    query: { silo },
  })
  invariant(idp, 'IdP was not prefetched in loader')

  const navigate = useNavigate()
  const onDismiss = () => navigate(pb.silo({ silo }))

  const form = useForm({ mode: 'all', defaultValues: idp })

  return (
    <SideModalForm
      id="edit-idp-form"
      form={form}
      title="Identity provider"
      onDismiss={onDismiss}
      subtitle={
        <ResourceLabel>
          <Access16Icon /> {idp.name}
        </ResourceLabel>
      }
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
        helpText="Service provider endpoint for the IdP to send the SAML response"
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
        helpText="Service provider endpoint for log out requests"
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
            helpText="Name of SAML attribute where we can find a comma-separated list of names of groups the user belongs to"
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
