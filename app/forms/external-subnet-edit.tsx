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
import { getExternalSubnetSelector, useExternalSubnetSelector } from '~/hooks/use-params'
import { addToast } from '~/stores/toast'
import { InstanceLink } from '~/table/cells/InstanceLinkCell'
import { SubnetPoolCell } from '~/table/cells/SubnetPoolCell'
import { SideModalFormDocs } from '~/ui/lib/ModalLinks'
import { PropertiesTable } from '~/ui/lib/PropertiesTable'
import { docLinks } from '~/util/links'
import { pb } from '~/util/path-builder'
import type * as PP from '~/util/path-params'

const externalSubnetView = ({ project, externalSubnet }: PP.ExternalSubnet) =>
  q(api.externalSubnetView, {
    path: { externalSubnet },
    query: { project },
  })

export async function clientLoader({ params }: LoaderFunctionArgs) {
  const selector = getExternalSubnetSelector(params)
  const subnet = await queryClient.fetchQuery(externalSubnetView(selector))
  await Promise.all([
    queryClient.prefetchQuery(
      // subnet pool cell uses errors allowed, so we have to do that here to match
      qErrorsAllowed(
        api.subnetPoolView,
        { path: { pool: subnet.subnetPoolId } },
        {
          errorsExpected: {
            explanation: 'the referenced subnet pool may have been deleted.',
            statusCode: 404,
          },
        }
      )
    ),
    subnet.instanceId
      ? queryClient.prefetchQuery(
          q(api.instanceView, { path: { instance: subnet.instanceId } })
        )
      : null,
  ])
  return null
}

export const handle = titleCrumb('Edit External Subnet')

export default function EditExternalSubnetSideModalForm() {
  const navigate = useNavigate()

  const subnetSelector = useExternalSubnetSelector()
  const onDismiss = () => navigate(pb.externalSubnets({ project: subnetSelector.project }))

  const { data: subnet } = usePrefetchedQuery(externalSubnetView(subnetSelector))

  const editExternalSubnet = useApiMutation(api.externalSubnetUpdate, {
    onSuccess(updated) {
      queryClient.invalidateEndpoint('externalSubnetList')
      // prettier-ignore
      addToast(<>External subnet <HL>{updated.name}</HL> updated</>)
      onDismiss()
    },
  })

  const form = useForm({ defaultValues: subnet })
  return (
    <SideModalForm
      form={form}
      formType="edit"
      resourceName="external subnet"
      onDismiss={onDismiss}
      onSubmit={({ name, description }) => {
        editExternalSubnet.mutate({
          path: { externalSubnet: subnetSelector.externalSubnet },
          query: { project: subnetSelector.project },
          body: { name, description },
        })
      }}
      loading={editExternalSubnet.isPending}
      submitError={editExternalSubnet.error}
    >
      <PropertiesTable>
        <PropertiesTable.IdRow id={subnet.id} />
        <PropertiesTable.DateRow label="Created" date={subnet.timeCreated} />
        <PropertiesTable.DateRow label="Updated" date={subnet.timeModified} />
        <PropertiesTable.Row label="Subnet">{subnet.subnet}</PropertiesTable.Row>
        <PropertiesTable.Row label="Subnet Pool">
          <SubnetPoolCell subnetPoolId={subnet.subnetPoolId} />
        </PropertiesTable.Row>
        <PropertiesTable.Row label="Instance">
          <InstanceLink instanceId={subnet.instanceId} tab="networking" />
        </PropertiesTable.Row>
      </PropertiesTable>
      <NameField name="name" control={form.control} />
      <DescriptionField name="description" control={form.control} />
      <SideModalFormDocs docs={[docLinks.externalSubnets]} />
    </SideModalForm>
  )
}
