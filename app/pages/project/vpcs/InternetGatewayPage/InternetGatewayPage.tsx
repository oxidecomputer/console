/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { useQuery } from '@tanstack/react-query'
import { useNavigate, type LoaderFunctionArgs } from 'react-router-dom'

import { apiQueryClient, getListQFn, queryClient, usePrefetchedApiQuery } from '~/api'
import { getInternetGatewaySelector, useInternetGatewaySelector } from '~/hooks/use-params'
import { DescriptionCell } from '~/table/cells/DescriptionCell'
import { EmptyCell } from '~/table/cells/EmptyCell'
import { IpPoolCell } from '~/table/cells/IpPoolCell'
import { Button } from '~/ui/lib/Button'
import { CopyableIp } from '~/ui/lib/CopyableIp'
import { Message } from '~/ui/lib/Message'
import { PropertiesTable } from '~/ui/lib/PropertiesTable'
import { SideModal } from '~/ui/lib/SideModal'
import { pb } from '~/util/path-builder'

type GatewayParams = { project: string; vpc: string; gateway: string }

const gatewayIpPoolList = (query: GatewayParams) =>
  getListQFn('internetGatewayIpPoolList', { query })
const gatewayIpAddressList = (query: GatewayParams) =>
  getListQFn('internetGatewayIpAddressList', { query })

InternetGatewayPage.loader = async function ({ params }: LoaderFunctionArgs) {
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

export function InternetGatewayPage() {
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

  return (
    <SideModal title={internetGateway.name} onDismiss={onDismiss} isOpen>
      <SideModal.Body>
        <div className="flex flex-col gap-6">
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
          <PropertiesTable key={internetGateway.id}>
            <PropertiesTable.Row label="Name">{internetGateway.name}</PropertiesTable.Row>
            <PropertiesTable.Row label="Description">
              <DescriptionCell text={internetGateway.description} />
            </PropertiesTable.Row>
            {/* insert routes that are associated with this gateway */}
          </PropertiesTable>
          <div>
            <SideModal.Heading title="Internet Gateway" className="mb-2">
              Internet Gateway IP Address
            </SideModal.Heading>
            <div className="flex flex-col gap-4">
              {gatewayIpAddresses ? (
                gatewayIpAddresses.map((gatewayAddress) => (
                  <PropertiesTable key={gatewayAddress.id}>
                    <PropertiesTable.Row label="Name">
                      {gatewayAddress.name}
                    </PropertiesTable.Row>
                    <PropertiesTable.Row label="Description">
                      <DescriptionCell text={gatewayAddress.description} />
                    </PropertiesTable.Row>
                    <PropertiesTable.Row label="IP Address">
                      <CopyableIp ip={gatewayAddress.address} />
                    </PropertiesTable.Row>
                  </PropertiesTable>
                ))
              ) : (
                <EmptyCell />
              )}
            </div>
          </div>
          <div>
            <SideModal.Heading title="Internet Gateway" className="mb-2">
              Internet Gateway IP Pool
              {gatewayIpPools && gatewayIpPools.length > 1 ? 's' : ''}
            </SideModal.Heading>
            <div className="flex flex-col gap-4">
              {gatewayIpPools ? (
                gatewayIpPools.map((gatewayPool) => (
                  <PropertiesTable key={gatewayPool.id}>
                    <PropertiesTable.Row label="Name">
                      {gatewayPool.name}
                    </PropertiesTable.Row>
                    <PropertiesTable.Row label="Description">
                      <DescriptionCell text={gatewayPool.description} />
                    </PropertiesTable.Row>
                    <PropertiesTable.Row label="IP Pool">
                      <IpPoolCell ipPoolId={gatewayPool.ipPoolId} />
                    </PropertiesTable.Row>
                  </PropertiesTable>
                ))
              ) : (
                <EmptyCell />
              )}
            </div>
          </div>
        </div>
      </SideModal.Body>
      <SideModal.Footer>
        <Button variant="ghost" onClick={onDismiss}>
          Close
        </Button>
      </SideModal.Footer>
    </SideModal>
  )
}
