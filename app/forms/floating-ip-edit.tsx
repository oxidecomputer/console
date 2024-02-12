/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useNavigate, type LoaderFunctionArgs } from 'react-router-dom'

import { apiQueryClient, usePrefetchedApiQuery } from '@oxide/api'
import {
  FormDivider,
  Networking16Icon,
  PropertiesTable,
  ResourceLabel,
  Truncate,
} from '@oxide/ui'
import { formatDateTime } from '@oxide/util'

import { DescriptionField, NameField, SideModalForm } from 'app/components/form'
import { getFloatingIpSelector, useFloatingIpSelector, useForm } from 'app/hooks'
import { pb } from 'app/util/path-builder'

// ROUGH EDGE: Trying to get this working, in sidebar
// This is copied off of the Image edit form, but it's not working yet

EditFloatingIpSideModalForm.loader = async ({ params }: LoaderFunctionArgs) => {
  const { project, floatingIp } = getFloatingIpSelector(params)
  await Promise.all([
    apiQueryClient.prefetchQuery('floatingIpView', {
      path: { floatingIp },
      query: { project },
    }),
    apiQueryClient.prefetchQuery('instanceList', {
      query: { project },
    }),
  ])
  return null
}

export function EditFloatingIpSideModalForm() {
  const { project, floatingIp: floatingIpName } = useFloatingIpSelector()
  const { data: floatingIp } = usePrefetchedApiQuery('floatingIpView', {
    path: { floatingIp: floatingIpName },
    query: { project },
  })

  const dismissLink = pb.floatingIps({ project })
  const navigate = useNavigate()
  const form = useForm({ defaultValues: floatingIp })

  return (
    <SideModalForm
      id="edit-floating-ip-form"
      form={form}
      title="Floating IP"
      onDismiss={() => navigate(dismissLink)}
      subtitle={
        <ResourceLabel>
          <Networking16Icon /> {floatingIp.name}
        </ResourceLabel>
      }
      // TODO: pass actual error when this form is hooked up
      submitError={null}
    >
      <PropertiesTable>
        <PropertiesTable.Row label="Name">{floatingIp.name}</PropertiesTable.Row>
        <PropertiesTable.Row label="ID">
          <Truncate text={floatingIp.id} maxLength={32} hasCopyButton />
        </PropertiesTable.Row>
        <PropertiesTable.Row label="IP">{floatingIp.ip}</PropertiesTable.Row>
        <PropertiesTable.Row label="Created">
          {formatDateTime(floatingIp.timeCreated)}
        </PropertiesTable.Row>
      </PropertiesTable>

      {/* TODO: Add a dropdown for attaching to an instance */}

      <NameField name="name" control={form.control} disabled />
      <DescriptionField name="description" control={form.control} required disabled />
      <FormDivider />
    </SideModalForm>
  )
}
