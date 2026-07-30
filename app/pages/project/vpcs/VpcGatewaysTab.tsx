/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { useQuery } from '@tanstack/react-query'
import { createColumnHelper } from '@tanstack/react-table'
import { useCallback, useMemo } from 'react'
import { Outlet, type LoaderFunctionArgs } from 'react-router'

import { api, getListQFn, queryClient, useApiMutation, type InternetGateway } from '~/api'
import { HL } from '~/components/HL'
import { ListPlusOverflow } from '~/components/ListPlusCell'
import { getVpcSelector, useVpcSelector } from '~/hooks/use-params'
import { useQuickActions } from '~/hooks/use-quick-actions'
import { addToast } from '~/stores/toast'
import { EmptyCell } from '~/table/cells/EmptyCell'
import { IpPoolCell, ipPoolErrorsAllowedQuery } from '~/table/cells/IpPoolCell'
import { LinkCell, makeLinkCell } from '~/table/cells/LinkCell'
import { useColsWithActions, type MenuAction } from '~/table/columns/action-col'
import { Columns } from '~/table/columns/common'
import { useQueryTable } from '~/table/QueryTable'
import { CopyableIp } from '~/ui/lib/CopyableIp'
import { CreateLink } from '~/ui/lib/CreateButton'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { TipIcon } from '~/ui/lib/TipIcon'
import { ALL_ISH } from '~/util/consts'
import { pb } from '~/util/path-builder'
import type * as PP from '~/util/path-params'

import {
  gatewayIpAddressList,
  gatewayIpPoolList,
  routeList,
  routerList,
  useGatewayRoutes,
} from './gateway-data'
import { confirmDeleteGateway } from './gateway-delete'

export const handle = { crumb: 'Internet Gateways' }

const gatewayList = ({ project, vpc }: PP.Vpc) =>
  getListQFn(api.internetGatewayList, { query: { project, vpc, limit: ALL_ISH } })
const projectIpPoolList = getListQFn(api.ipPoolList, {
  query: { limit: ALL_ISH },
})

const IpAddressCell = (gatewaySelector: PP.VpcInternetGateway) => {
  const { data: addresses } = useQuery(gatewayIpAddressList(gatewaySelector).optionsFn())
  const address = addresses?.items[0]
  if (!address) return <EmptyCell />
  return <CopyableIp ip={address.address} isLinked={false} />
}

// plain pool name for the +N tooltip, where IpPoolCell's interactive button
// wouldn't be usable
const IpPoolName = ({ ipPoolId }: { ipPoolId: string }) => {
  const { data: result } = useQuery(ipPoolErrorsAllowedQuery(ipPoolId))
  if (!result || result.type === 'error') return null
  return <div>{result.data.name}</div>
}

const GatewayIpPoolCell = (gatewaySelector: PP.VpcInternetGateway) => {
  const { data: pools } = useQuery(gatewayIpPoolList(gatewaySelector).optionsFn())
  const [first, ...rest] = pools?.items || []
  if (!first) return <EmptyCell />
  return (
    <div className="flex items-center gap-1">
      <IpPoolCell ipPoolId={first.ipPoolId} />
      <ListPlusOverflow tooltipTitle="Other IP pools">
        {rest.map((pool) => (
          <IpPoolName key={pool.id} ipPoolId={pool.ipPoolId} />
        ))}
      </ListPlusOverflow>
    </div>
  )
}

const GatewayRoutes = ({ project, vpc, gateway }: PP.VpcInternetGateway) => {
  const matchingRoutes = useGatewayRoutes({ project, vpc, gateway })
  const to = pb.vpcInternetGateway({ project, vpc, gateway })
  if (!matchingRoutes?.length) return <EmptyCell />
  return <LinkCell to={to}>{matchingRoutes.length}</LinkCell>
}

const colHelper = createColumnHelper<InternetGateway>()

export async function clientLoader({ params }: LoaderFunctionArgs) {
  const { project, vpc } = getVpcSelector(params)
  const [gateways, routers] = await Promise.all([
    queryClient.fetchQuery(gatewayList({ project, vpc }).optionsFn()),
    queryClient.fetchQuery(routerList({ project, vpc }).optionsFn()),
  ])

  await Promise.all([
    ...gateways.items.flatMap((gateway: InternetGateway) => [
      queryClient.fetchQuery(
        gatewayIpAddressList({ project, vpc, gateway: gateway.name }).optionsFn()
      ),
      queryClient.fetchQuery(
        gatewayIpPoolList({ project, vpc, gateway: gateway.name }).optionsFn()
      ),
    ]),
    ...routers.items.map((router) =>
      queryClient.fetchQuery(routeList({ project, vpc, router: router.name }).optionsFn())
    ),
    queryClient.fetchQuery(projectIpPoolList.optionsFn()).then((pools) => {
      for (const pool of pools.items) {
        // IpPoolCell uses the errors-allowed query shape, so seed that exact
        // cache entry instead of the normal ipPoolView query.
        const { queryKey } = ipPoolErrorsAllowedQuery(pool.id)
        queryClient.setQueryData(queryKey, { type: 'success', data: pool })
      }
    }),
  ] satisfies Promise<unknown>[])

  return null
}

export const AttachedIpAddressHeader = () => (
  <>
    Attached IP Address
    <TipIcon className="ml-1.5">
      Internet gateways without an IP address attached will use an address from the attached
      IP pool
    </TipIcon>
  </>
)

export default function VpcInternetGatewaysTab() {
  const { project, vpc } = useVpcSelector()

  const emptyState = (
    <EmptyMessage
      title="No internet gateways"
      body="Create an internet gateway to see it here"
      buttonText="New internet gateway"
      buttonTo={pb.vpcInternetGatewaysNew({ project, vpc })}
    />
  )

  const { mutateAsync: deleteGateway } = useApiMutation(api.internetGatewayDelete, {
    onSuccess(_data, variables) {
      queryClient.invalidateEndpoint('internetGatewayList')
      // prettier-ignore
      addToast(<>Internet gateway <HL>{variables.path.gateway}</HL> deleted</>)
    },
  })

  const makeActions = useCallback(
    (gateway: InternetGateway): MenuAction[] => [
      {
        label: 'Delete',
        className: 'destructive',
        onActivate: confirmDeleteGateway({
          project,
          vpc,
          gateway: gateway.name,
          deleteGateway,
        }),
      },
    ],
    [deleteGateway, project, vpc]
  )

  const staticColumns = useMemo(
    () => [
      colHelper.accessor('name', {
        cell: makeLinkCell((gateway) => pb.vpcInternetGateway({ project, vpc, gateway })),
      }),
      colHelper.accessor('description', Columns.description),
      colHelper.accessor('name', {
        // ID needed to avoid key collision with other name column
        id: 'ip-pool',
        header: 'Attached IP Pool',
        cell: (info) => (
          <GatewayIpPoolCell project={project} vpc={vpc} gateway={info.getValue()} />
        ),
      }),
      colHelper.accessor('name', {
        // ID needed to avoid key collision with other name column
        id: 'ip-address',
        header: AttachedIpAddressHeader,
        cell: (info) => (
          <IpAddressCell project={project} vpc={vpc} gateway={info.getValue()} />
        ),
      }),
      colHelper.accessor('name', {
        // ID needed to avoid key collision with other name column
        id: 'routes',
        header: 'Routes',
        cell: (info) => (
          <GatewayRoutes project={project} vpc={vpc} gateway={info.getValue()} />
        ),
      }),
      colHelper.accessor('timeCreated', Columns.timeCreated),
    ],
    [project, vpc]
  )

  const columns = useColsWithActions(staticColumns, makeActions)

  const { table } = useQueryTable({
    query: gatewayList({ project, vpc }),
    columns,
    emptyState,
  })

  useQuickActions(
    () => [
      {
        value: 'New internet gateway',
        navGroup: 'Actions',
        action: pb.vpcInternetGatewaysNew({ project, vpc }),
      },
    ],
    [project, vpc]
  )

  return (
    <>
      <div className="mb-3 flex justify-end space-x-2">
        <CreateLink to={pb.vpcInternetGatewaysNew({ project, vpc })}>
          New internet gateway
        </CreateLink>
      </div>
      {table}
      <Outlet />
    </>
  )
}
