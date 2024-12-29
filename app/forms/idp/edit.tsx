/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useForm } from 'react-hook-form'
import { useNavigate, type LoaderFunctionArgs } from 'react-router'

import { apiQueryClient, usePrefetchedApiQuery } from '@oxide/api'
import { Access16Icon } from '@oxide/design-system/icons/react'

import { DescriptionField } from '~/components/form/fields/DescriptionField'
import { NameField } from '~/components/form/fields/NameField'
import { TextField } from '~/components/form/fields/TextField'
import { SideModalForm } from '~/components/form/SideModalForm'
import { getIdpSelector, useIdpSelector } from '~/hooks/use-params'
import { FormDivider } from '~/ui/lib/Divider'
import { PropertiesTable } from '~/ui/lib/PropertiesTable'
import { ResourceLabel, SideModal } from '~/ui/lib/SideModal'
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
      formType="edit"
      resourceName="identity provider"
      title="Identity provider"
      onDismiss={onDismiss}
      subtitle={
        <ResourceLabel>
          <Access16Icon /> {idp.name}
        </ResourceLabel>
      }
      // TODO: pass actual error when this form is hooked up
      submitError={null}
      loading={false}
    >
      <PropertiesTable>
        <PropertiesTable.IdRow id={idp.id} />
        <PropertiesTable.DateRow date={idp.timeCreated} label="Created" />
        <PropertiesTable.DateRow date={idp.timeModified} label="Updated" />
      </PropertiesTable>

      <NameField name="name" control={form.control} disabled />
      <DescriptionField name="description" control={form.control} required disabled />
      <TextField
        name="technicalContactEmail"
        label="Technical contact email"
        required
        control={form.control}
        disabled
        copyable
      />

      <FormDivider />

      <SideModal.Heading>Service provider</SideModal.Heading>
      {/* TODO: help text */}
      <TextField
        name="spClientId"
        label="Service provider client ID"
        required
        control={form.control}
        disabled
      />
      <TextField
        name="acsUrl"
        label="ACS URL"
        description="Service provider endpoint for the IdP to send the SAML response"
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

      <FormDivider />

      <SideModal.Heading>Identity provider</SideModal.Heading>
      {/* TODO: help text */}
      <TextField
        name="idpEntityId"
        label="Entity ID"
        required
        control={form.control}
        disabled
      />
      <TextField
        name="groupAttributeName"
        label="Group attribute name"
        description="Name of the SAML attribute in the IdP response listing the user’s groups"
        required
        control={form.control}
        disabled
      />
    </SideModalForm>
  )
}
