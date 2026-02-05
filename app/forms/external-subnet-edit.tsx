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
  getListQFn,
  q,
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
import { EmptyCell } from '~/table/cells/EmptyCell'
import { InstanceLinkCell } from '~/table/cells/InstanceLinkCell'
import { PropertiesTable } from '~/ui/lib/PropertiesTable'
import { ALL_ISH } from '~/util/consts'
import { pb } from '~/util/path-builder'

const externalSubnetView = ({
  project,
  externalSubnet,
}: {
  project: string
  externalSubnet: string
}) =>
  q(api.externalSubnetView, {
    path: { externalSubnet },
    query: { project },
  })

const instanceList = (project: string) =>
  getListQFn(api.instanceList, { query: { project, limit: ALL_ISH } })

export async function clientLoader({ params }: LoaderFunctionArgs) {
  const selector = getExternalSubnetSelector(params)
  await Promise.all([
    queryClient.fetchQuery(externalSubnetView(selector)),
    queryClient.fetchQuery(instanceList(selector.project).optionsFn()),
  ])
  return null
}

export const handle = titleCrumb('Edit External Subnet')

export default function EditExternalSubnetSideModalForm() {
  const navigate = useNavigate()

  const subnetSelector = useExternalSubnetSelector()
  const onDismiss = () => navigate(pb.externalSubnets({ project: subnetSelector.project }))

  const { data: subnet } = usePrefetchedQuery(externalSubnetView(subnetSelector))
  const { data: instances } = usePrefetchedQuery(
    instanceList(subnetSelector.project).optionsFn()
  )
  const instanceName = instances.items.find((i) => i.id === subnet.instanceId)?.name

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
        <PropertiesTable.Row label="Instance">
          {instanceName ? (
            <InstanceLinkCell instanceId={subnet.instanceId} />
          ) : (
            <EmptyCell />
          )}
        </PropertiesTable.Row>
      </PropertiesTable>
      <NameField name="name" control={form.control} />
      <DescriptionField name="description" control={form.control} />
    </SideModalForm>
  )
}
