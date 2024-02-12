/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useNavigate, type LoaderFunctionArgs } from 'react-router-dom'

import {
  apiQueryClient,
  useApiMutation,
  useApiQueryClient,
  usePrefetchedApiQuery,
} from '@oxide/api'
import {
  Listbox,
  Networking16Icon,
  PropertiesTable,
  ResourceLabel,
  Truncate,
} from '@oxide/ui'
import { formatDateTime } from '@oxide/util'

import { SideModalForm } from 'app/components/form'
import { getFloatingIpSelector, useFloatingIpSelector, useForm } from 'app/hooks'
import { addToast } from 'app/stores/toast'
import { pb } from 'app/util/path-builder'

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
    apiQueryClient.prefetchQuery('floatingIpList', {
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
  const { data: instances } = usePrefetchedApiQuery('instanceList', {
    query: { project },
  })
  const { data: floatingIps } = usePrefetchedApiQuery('floatingIpList', {
    query: { project },
  })
  console.log(instances, floatingIps)

  const dismissLink = pb.floatingIps({ project })
  const navigate = useNavigate()
  const form = useForm({ defaultValues: { instanceId: floatingIp.instanceId } })
  const onDismiss = () => navigate(dismissLink)

  const queryClient = useApiQueryClient()

  const updateAttachment = useApiMutation('floatingIpAttach', {
    onSuccess() {
      addToast({ content: 'Floating IP attached' })
      queryClient.invalidateQueries('floatingIpView')
      queryClient.invalidateQueries('floatingIpList')
      onDismiss()
    },
  })

  return (
    <SideModalForm
      id="edit-floating-ip-form"
      form={form}
      title="Floating IP"
      onSubmit={(values) => {
        updateAttachment.mutate({
          path: { floatingIp: floatingIpName },
          query: { project },
          body: {
            kind: 'instance',
            parent: values.instanceId,
          },
        })
      }}
      submitLabel="Attach"
      onDismiss={onDismiss}
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
        <PropertiesTable.Row label="Attached Instance">
          <>{instances.items.find((i) => i.id === floatingIp.instanceId)?.name || '–'}</>
        </PropertiesTable.Row>
        <PropertiesTable.Row label="Created">
          {formatDateTime(floatingIp.timeCreated)}
        </PropertiesTable.Row>
      </PropertiesTable>

      <Listbox
        name="instanceId"
        items={instances.items.map((i) => ({ value: i.id, label: i.name }))}
        label="Instance"
        onChange={(e) => {
          form.setValue('instanceId', e)
        }}
        selected={form.watch('instanceId')}
      />
    </SideModalForm>
  )
}
