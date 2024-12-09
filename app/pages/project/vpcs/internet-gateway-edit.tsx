/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useNavigate, type LoaderFunctionArgs } from 'react-router-dom'

import { Gateway16Icon } from '@oxide/design-system/icons/react'

import { apiQueryClient, getListQFn, queryClient, usePrefetchedApiQuery } from '~/api'
import { SideModalForm } from '~/components/form/SideModalForm'
import { getInternetGatewaySelector, useInternetGatewaySelector } from '~/hooks/use-params'
import { DescriptionCell } from '~/table/cells/DescriptionCell'
import { IpPoolCell } from '~/table/cells/IpPoolCell'
import { CopyableIp } from '~/ui/lib/CopyableIp'
import { FormDivider } from '~/ui/lib/Divider'
import { Message } from '~/ui/lib/Message'
import { PropertiesTable } from '~/ui/lib/PropertiesTable'
import { ResourceLabel, SideModal } from '~/ui/lib/SideModal'
import { pb } from '~/util/path-builder'
import type * as PP from '~/util/path-params'

const gatewayIpPoolList = (query: PP.VpcInternetGateway) =>
  getListQFn('internetGatewayIpPoolList', { query })
const gatewayIpAddressList = (query: PP.VpcInternetGateway) =>
  getListQFn('internetGatewayIpAddressList', { query })

EditInternetGatewayForm.loader = async function ({ params }: LoaderFunctionArgs) {
  const { project, vpc, gateway } = getInternetGatewaySelector(params)
  await Promise.all([
    apiQueryClient.prefetchQuery('internetGatewayView', {
      query: { project, vpc },
      path: { gateway },
    }),
    // apiQueryClient.prefetchQuery('internetGatewayIpAddressList', { query }),
    queryClient.prefetchQuery(gatewayIpPoolList({ project, vpc, gateway }).optionsFn()),
    queryClient.prefetchQuery(gatewayIpAddressList({ project, vpc, gateway }).optionsFn()),
  ])
  return null
}

export function EditInternetGatewayForm() {
  const navigate = useNavigate()
  const { project, vpc, gateway } = useInternetGatewaySelector()
  const onDismiss = () => navigate(pb.vpcInternetGateways({ project, vpc }))
  const { data: internetGateway } = usePrefetchedApiQuery('internetGatewayView', {
    query: { project, vpc },
    path: { gateway },
  })
  const { data: { items: gatewayIpPools } = {} } = useQuery(
    gatewayIpPoolList({ project, vpc, gateway }).optionsFn()
  )
  const { data: { items: gatewayIpAddresses } = {} } = useQuery(
    gatewayIpAddressList({ project, vpc, gateway }).optionsFn()
  )

  const form = useForm({})

  const hasAttachedPool = gatewayIpPools && gatewayIpPools.length > 0
  return (
    <SideModalForm
      title="Internet Gateway"
      formType="edit"
      resourceName="Internet Gateway"
      onDismiss={onDismiss}
      subtitle={
        <ResourceLabel>
          <Gateway16Icon /> {internetGateway.name}
        </ResourceLabel>
      }
      form={form}
      // TODO: pass actual error when this form is hooked up
      submitError={null}
      loading={false}
    >
      <PropertiesTable key={internetGateway.id}>
        <PropertiesTable.Row label="Name">{internetGateway.name}</PropertiesTable.Row>
        <PropertiesTable.Row label="Description">
          <DescriptionCell text={internetGateway.description} />
        </PropertiesTable.Row>
      </PropertiesTable>
      <Message
        variant="info"
        className="text-balance"
        content={
          <>
            This is a read-only copy of this internet gateway. Use the CLI to create and
            update internet gateways. More functionality for internet gateways will be
            included in future releases of the Oxide console.
          </>
        }
      />
      <FormDivider />
      <div className="flex flex-col gap-2">
        <SideModal.Heading>
          Internet Gateway IP Address
          {gatewayIpAddresses && gatewayIpAddresses.length > 1 ? 'es' : ''}
        </SideModal.Heading>
        {gatewayIpAddresses && gatewayIpAddresses.length > 0 ? (
          gatewayIpAddresses.map((gatewayIpAddress) => (
            <PropertiesTable key={gatewayIpAddress.id}>
              <PropertiesTable.Row label="Name">
                {gatewayIpAddress.name}
              </PropertiesTable.Row>
              <PropertiesTable.Row label="Description">
                <DescriptionCell text={gatewayIpAddress.description} />
              </PropertiesTable.Row>
              <PropertiesTable.Row label="IP Address">
                <CopyableIp ip={gatewayIpAddress.address} />
              </PropertiesTable.Row>
            </PropertiesTable>
          ))
        ) : (
          <div className="mt-2">
            {'This internet gateway does not have any specific IP addresses attached. '}
            {hasAttachedPool
              ? 'It will use an address from the attached IP pool.'
              : 'Use the CLI to attach an IP Pool or specify an IP address to use with this gateway.'}
          </div>
        )}
      </div>

      <FormDivider />

      <div className="flex flex-col gap-2">
        <SideModal.Heading>
          Internet Gateway IP Pool
          {gatewayIpPools && gatewayIpPools.length > 1 ? 's' : ''}
        </SideModal.Heading>
        {hasAttachedPool ? (
          gatewayIpPools.map((gatewayIpPool) => (
            <PropertiesTable key={gatewayIpPool.id}>
              <PropertiesTable.Row label="Name">{gatewayIpPool.name}</PropertiesTable.Row>
              <PropertiesTable.Row label="Description">
                <DescriptionCell text={gatewayIpPool.description} />
              </PropertiesTable.Row>
              <PropertiesTable.Row label="IP Address">
                <IpPoolCell ipPoolId={gatewayIpPool.ipPoolId} />
              </PropertiesTable.Row>
            </PropertiesTable>
          ))
        ) : (
          <div className="mt-2">
            This internet gateway does not have any IP pools attached.
          </div>
        )}
      </div>
      {/* insert routes that are associated with this gateway */}
    </SideModalForm>
  )
}
