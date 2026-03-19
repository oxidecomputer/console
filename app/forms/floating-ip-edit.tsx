/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useForm } from 'react-hook-form'
import { useNavigate, type LoaderFunctionArgs } from 'react-router'

import {
  api,
  q,
  qErrorsAllowed,
  queryClient,
  useApiMutation,
  usePrefetchedQuery,
} from '@oxide/api'

import { DescriptionField } from '~/components/form/fields/DescriptionField'
import { NameField } from '~/components/form/fields/NameField'
import { SideModalForm } from '~/components/form/SideModalForm'
import { HL } from '~/components/HL'
import { titleCrumb } from '~/hooks/use-crumbs'
import { getFloatingIpSelector, useFloatingIpSelector } from '~/hooks/use-params'
import { addToast } from '~/stores/toast'
import { InstanceLink } from '~/table/cells/InstanceLinkCell'
import { IpPoolCell } from '~/table/cells/IpPoolCell'
import { CopyableIp } from '~/ui/lib/CopyableIp'
import { SideModalFormDocs } from '~/ui/lib/ModalLinks'
import { PropertiesTable } from '~/ui/lib/PropertiesTable'
import { docLinks } from '~/util/links'
import { pb } from '~/util/path-builder'
import type * as PP from '~/util/path-params'

const floatingIpView = ({ project, floatingIp }: PP.FloatingIp) =>
  q(api.floatingIpView, { path: { floatingIp }, query: { project } })

export async function clientLoader({ params }: LoaderFunctionArgs) {
  const selector = getFloatingIpSelector(params)
  const fip = await queryClient.fetchQuery(floatingIpView(selector))
  await Promise.all([
    queryClient.prefetchQuery(
      // ip pool cell uses errors allowed, so we have to do that here to match
      qErrorsAllowed(
        api.ipPoolView,
        { path: { pool: fip.ipPoolId } },
        {
          errorsExpected: {
            explanation: 'the referenced IP pool may have been deleted.',
            statusCode: 404,
          },
        }
      )
    ),
    fip.instanceId
      ? queryClient.prefetchQuery(
          q(api.instanceView, { path: { instance: fip.instanceId } })
        )
      : null,
  ])
  return null
}

export const handle = titleCrumb('Edit Floating IP')

export default function EditFloatingIpSideModalForm() {
  const navigate = useNavigate()

  const floatingIpSelector = useFloatingIpSelector()

  const onDismiss = () => navigate(pb.floatingIps({ project: floatingIpSelector.project }))

  const { data: floatingIp } = usePrefetchedQuery(floatingIpView(floatingIpSelector))

  const editFloatingIp = useApiMutation(api.floatingIpUpdate, {
    onSuccess(_floatingIp) {
      queryClient.invalidateEndpoint('floatingIpList')
      // prettier-ignore
      addToast(<>Floating IP <HL>{_floatingIp.name}</HL> updated</>)
      onDismiss()
    },
  })

  const form = useForm({ defaultValues: floatingIp })
  return (
    <SideModalForm
      form={form}
      formType="edit"
      resourceName="floating IP"
      onDismiss={onDismiss}
      onSubmit={({ name, description }) => {
        editFloatingIp.mutate({
          path: { floatingIp: floatingIpSelector.floatingIp },
          query: { project: floatingIpSelector.project },
          body: { name, description },
        })
      }}
      loading={editFloatingIp.isPending}
      submitError={editFloatingIp.error}
    >
      <PropertiesTable>
        <PropertiesTable.IdRow id={floatingIp.id} />
        <PropertiesTable.DateRow label="Created" date={floatingIp.timeCreated} />
        <PropertiesTable.DateRow label="Updated" date={floatingIp.timeModified} />
        <PropertiesTable.Row label="IP Address">
          <CopyableIp ip={floatingIp.ip} isLinked={false} />
        </PropertiesTable.Row>
        <PropertiesTable.Row label="IP Pool">
          <IpPoolCell ipPoolId={floatingIp.ipPoolId} />
        </PropertiesTable.Row>
        <PropertiesTable.Row label="Instance">
          <InstanceLink instanceId={floatingIp.instanceId} tab="networking" />
        </PropertiesTable.Row>
      </PropertiesTable>
      <NameField name="name" control={form.control} />
      <DescriptionField name="description" control={form.control} />
      <SideModalFormDocs docs={[docLinks.floatingIps]} />
    </SideModalForm>
  )
}
