/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useForm } from 'react-hook-form'
import { Link, useNavigate, type LoaderFunctionArgs } from 'react-router-dom'

import {
  apiq,
  getListQFn,
  queryClient,
  useApiMutation,
  usePrefetchedApiQuery,
  usePrefetchedQuery,
} from '@oxide/api'

import { DescriptionField } from '~/components/form/fields/DescriptionField'
import { NameField } from '~/components/form/fields/NameField'
import { SideModalForm } from '~/components/form/SideModalForm'
import { HL } from '~/components/HL'
import { getFloatingIpSelector, useFloatingIpSelector } from '~/hooks/use-params'
import { addToast } from '~/stores/toast'
import { EmptyCell } from '~/table/cells/EmptyCell'
import { IpPoolCell } from '~/table/cells/IpPoolCell'
import { CopyableIp } from '~/ui/lib/CopyableIp'
import { PropertiesTable } from '~/ui/lib/PropertiesTable'
import { ALL_ISH } from '~/util/consts'
import type * as PP from '~/util/path-params'
import { pb } from 'app/util/path-builder'

const floatingIpView = ({ project, floatingIp }: PP.FloatingIp) =>
  apiq('floatingIpView', { path: { floatingIp }, query: { project } })
const instanceList = (project: string) =>
  getListQFn('instanceList', { query: { project, limit: ALL_ISH } })

EditFloatingIpSideModalForm.loader = async ({ params }: LoaderFunctionArgs) => {
  const selector = getFloatingIpSelector(params)
  await Promise.all([
    queryClient.fetchQuery(floatingIpView(selector)),
    queryClient.fetchQuery(instanceList(selector.project).optionsFn()),
  ])
  return null
}

export function EditFloatingIpSideModalForm() {
  const navigate = useNavigate()

  const floatingIpSelector = useFloatingIpSelector()

  const onDismiss = () => navigate(pb.floatingIps({ project: floatingIpSelector.project }))

  const { data: floatingIp } = usePrefetchedApiQuery('floatingIpView', {
    path: { floatingIp: floatingIpSelector.floatingIp },
    query: { project: floatingIpSelector.project },
  })
  const { name, description, ip, ipPoolId, instanceId } = floatingIp

  const { data: instances } = usePrefetchedQuery(
    instanceList(floatingIpSelector.project).optionsFn()
  )
  const instanceName = instances.items.find((i) => i.id === instanceId)?.name

  const editFloatingIp = useApiMutation('floatingIpUpdate', {
    onSuccess(_floatingIp) {
      queryClient.invalidateEndpoint('floatingIpList')
      addToast(<>Floating IP <HL>{_floatingIp.name}</HL> updated</>) // prettier-ignore
      onDismiss()
    },
  })

  const form = useForm({ defaultValues: { name, description } })
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
        <PropertiesTable.Row label="IP Address">
          <CopyableIp ip={ip} isLinked={false} />
        </PropertiesTable.Row>
        <PropertiesTable.Row label="IP Pool">
          <IpPoolCell ipPoolId={ipPoolId} />
        </PropertiesTable.Row>
        <PropertiesTable.Row label="Instance">
          {instanceName ? (
            <Link
              to={pb.instanceNetworking({
                project: floatingIpSelector.project,
                instance: instanceName,
              })}
              className="link-with-underline group text-sans-md"
            >
              {instanceName}
            </Link>
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
