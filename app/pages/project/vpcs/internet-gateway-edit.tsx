/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { useQuery } from '@tanstack/react-query'
import { getCoreRowModel } from '@tanstack/react-table'
import { Link, useNavigate } from 'react-router'

import { Gateway16Icon } from '@oxide/design-system/icons/react'

import { api, q, queryClient, usePrefetchedQuery } from '~/api'
import { ReadOnlySideModalForm } from '~/components/form/ReadOnlySideModalForm'
import { titleCrumb } from '~/hooks/use-crumbs'
import { useInternetGatewaySelector } from '~/hooks/use-params'
import { IpPoolCell } from '~/table/cells/IpPoolCell'
import { createColumnHelper } from '~/table/column-helper'
import { Table } from '~/table/Table'
import { useTable } from '~/table/use-table'
import { CopyableIp } from '~/ui/lib/CopyableIp'
import { FormDivider } from '~/ui/lib/Divider'
import { Message } from '~/ui/lib/Message'
import { SideModalFormDocs } from '~/ui/lib/ModalLinks'
import { PropertiesTable } from '~/ui/lib/PropertiesTable'
import { ResourceLabel, SideModal } from '~/ui/lib/SideModal'
import { docLinks } from '~/util/links'
import { pb } from '~/util/path-builder'
import type * as PP from '~/util/path-params'

import type { Route } from './+types/internet-gateway-edit'
import {
  gatewayIpAddressList,
  gatewayIpPoolList,
  routeList,
  routerList,
  useGatewayRoutes,
} from './gateway-data'

export const handle = titleCrumb('Edit Internet Gateway')

type GatewayRouteRow = { id: string; router: string; routerPath: string; route: string }

const colHelper = createColumnHelper<GatewayRouteRow>()

const routeColumns = [
  colHelper.accessor('router', {
    header: 'Router',
    meta: { width: 'flex', tdClassName: 'bg-raise!' },
    cell: (info) => (
      <Link to={info.row.original.routerPath} className="link-with-underline text-sans-md">
        {info.getValue()}
      </Link>
    ),
  }),
  colHelper.accessor('route', {
    header: 'Route',
    meta: { width: 'flex', tdClassName: 'bg-raise!' },
  }),
]

function GatewayRoutesTable({ project, vpc, gateway }: PP.VpcInternetGateway) {
  const matchingRoutes = useGatewayRoutes({ project, vpc, gateway })
  const rows = (matchingRoutes ?? []).map(([router, route]) => ({
    id: route.id,
    router,
    routerPath: pb.vpcRouter({ project, vpc, router }),
    route: route.name,
  }))
  const table = useTable({
    id: 'internet-gateway-routes',
    columns: routeColumns,
    data: rows,
    getCoreRowModel: getCoreRowModel(),
  })

  if (matchingRoutes?.length === 0) {
    return <div className="mt-2">No VPC router routes target this gateway.</div>
  }
  return <Table table={table} />
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const { project, vpc, gateway } = params
  await Promise.all([
    queryClient.prefetchQuery(
      q(api.internetGatewayView, {
        query: { project, vpc },
        path: { gateway },
      })
    ),
    queryClient.prefetchQuery(gatewayIpPoolList({ project, vpc, gateway }).optionsFn()),
    queryClient.prefetchQuery(gatewayIpAddressList({ project, vpc, gateway }).optionsFn()),
    ...(await queryClient.fetchQuery(routerList({ project, vpc }).optionsFn())).items.map(
      (router) =>
        queryClient.prefetchQuery(
          routeList({ project, vpc, router: router.name }).optionsFn()
        )
    ),
  ] satisfies Promise<unknown>[])
  return null
}

export default function EditInternetGatewayForm() {
  const navigate = useNavigate()
  const { project, vpc, gateway } = useInternetGatewaySelector()
  const onDismiss = () => navigate(pb.vpcInternetGateways({ project, vpc }))
  const { data: internetGateway } = usePrefetchedQuery(
    q(api.internetGatewayView, {
      query: { project, vpc },
      path: { gateway },
    })
  )
  const { data: { items: gatewayIpPools } = {} } = useQuery(
    gatewayIpPoolList({ project, vpc, gateway }).optionsFn()
  )
  const { data: { items: gatewayIpAddresses } = {} } = useQuery(
    gatewayIpAddressList({ project, vpc, gateway }).optionsFn()
  )

  const hasAttachedPool = gatewayIpPools && gatewayIpPools.length > 0

  return (
    <ReadOnlySideModalForm
      title="Internet gateway"
      onDismiss={onDismiss}
      subtitle={
        <ResourceLabel>
          <Gateway16Icon /> {internetGateway.name}
        </ResourceLabel>
      }
    >
      <Message
        variant="info"
        content="Gateways can only be modified through the CLI or API."
      />
      <PropertiesTable key={internetGateway.id}>
        <PropertiesTable.IdRow id={internetGateway.id} />
        <PropertiesTable.Row label="Name">{internetGateway.name}</PropertiesTable.Row>
        <PropertiesTable.DescriptionRow description={internetGateway.description} />
      </PropertiesTable>
      <FormDivider />

      <div className="flex flex-col gap-3">
        <SideModal.Heading>
          Internet gateway IP address
          {gatewayIpAddresses && gatewayIpAddresses.length > 1 ? 'es' : ''}
        </SideModal.Heading>
        {gatewayIpAddresses && gatewayIpAddresses.length > 0 ? (
          gatewayIpAddresses.map((gatewayIpAddress) => (
            <PropertiesTable key={gatewayIpAddress.id}>
              <PropertiesTable.Row label="Name">
                {gatewayIpAddress.name}
              </PropertiesTable.Row>
              <PropertiesTable.DescriptionRow description={gatewayIpAddress.description} />
              <PropertiesTable.Row label="IP Address">
                <CopyableIp ip={gatewayIpAddress.address} />
              </PropertiesTable.Row>
            </PropertiesTable>
          ))
        ) : (
          <div className="mt-2">
            {'This internet gateway does not have any IP addresses attached. '}
            {hasAttachedPool
              ? 'It will use an address from the attached IP pool.'
              : 'Attach an IP pool or IP address via the CLI or API.'}
          </div>
        )}
      </div>

      <FormDivider />

      <div className="flex flex-col gap-3">
        <SideModal.Heading>
          Internet gateway IP pool
          {gatewayIpPools && gatewayIpPools.length > 1 ? 's' : ''}
        </SideModal.Heading>
        {hasAttachedPool ? (
          gatewayIpPools.map((gatewayIpPool) => (
            <PropertiesTable key={gatewayIpPool.id}>
              <PropertiesTable.Row label="Name">{gatewayIpPool.name}</PropertiesTable.Row>
              <PropertiesTable.DescriptionRow description={gatewayIpPool.description} />
              <PropertiesTable.Row label="IP Pool Name">
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

      <FormDivider />

      <div className="flex flex-col gap-3">
        <SideModal.Heading>Routes targeting this gateway</SideModal.Heading>
        <GatewayRoutesTable project={project} vpc={vpc} gateway={gateway} />
      </div>

      <SideModalFormDocs docs={[docLinks.gateways]} />
    </ReadOnlySideModalForm>
  )
}
