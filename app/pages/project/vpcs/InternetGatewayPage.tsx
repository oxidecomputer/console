/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useCallback, useMemo } from 'react'
import { Outlet, useNavigate, type LoaderFunctionArgs } from 'react-router'

import { Gateway16Icon, Gateway24Icon } from '@oxide/design-system/icons/react'

import {
  api,
  getListQFn,
  q,
  queryClient,
  useApiMutation,
  usePrefetchedQuery,
  type InternetGatewayIpAddress,
  type InternetGatewayIpPool,
} from '~/api'
import { CopyIdItem } from '~/components/CopyIdItem'
import { DocsPopover } from '~/components/DocsPopover'
import { HL } from '~/components/HL'
import { MoreActionsMenu } from '~/components/MoreActionsMenu'
import { makeCrumb } from '~/hooks/use-crumbs'
import { getInternetGatewaySelector, useInternetGatewaySelector } from '~/hooks/use-params'
import { useQuickActions } from '~/hooks/use-quick-actions'
import { confirmAction } from '~/stores/confirm-action'
import { confirmDelete } from '~/stores/confirm-delete'
import { addToast } from '~/stores/toast'
import { IpPoolCell, ipPoolErrorsAllowedQuery } from '~/table/cells/IpPoolCell'
import { LinkCell } from '~/table/cells/LinkCell'
import { useColsWithActions, type MenuAction } from '~/table/columns/action-col'
import { Columns } from '~/table/columns/common'
import { Table } from '~/table/Table'
import { CardBlock } from '~/ui/lib/CardBlock'
import { CopyableIp } from '~/ui/lib/CopyableIp'
import { CreateLink } from '~/ui/lib/CreateButton'
import { Divider } from '~/ui/lib/Divider'
import * as DropdownMenu from '~/ui/lib/DropdownMenu'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { PropertiesTable } from '~/ui/lib/PropertiesTable'
import { TableEmptyBox } from '~/ui/lib/Table'
import { ALL_ISH } from '~/util/consts'
import { docLinks } from '~/util/links'
import { pb } from '~/util/path-builder'
import type * as PP from '~/util/path-params'

import {
  gatewayIpAddressList,
  gatewayIpPoolList,
  routeList,
  routerList,
  useGatewayRoutes,
} from './gateway-data'

export const handle = makeCrumb((p) => p.gateway!)

const gatewayView = ({ project, vpc, gateway }: PP.VpcInternetGateway) =>
  q(api.internetGatewayView, { path: { gateway }, query: { project, vpc } })

const siloIpPoolList = getListQFn(api.ipPoolList, { query: { limit: ALL_ISH } })

export async function clientLoader({ params }: LoaderFunctionArgs) {
  const selector = getInternetGatewaySelector(params)
  const { project, vpc } = selector
  await Promise.all([
    queryClient.prefetchQuery(gatewayView(selector)),
    queryClient.prefetchQuery(gatewayIpPoolList(selector).optionsFn()),
    queryClient.prefetchQuery(gatewayIpAddressList(selector).optionsFn()),
    ...(await queryClient.fetchQuery(routerList({ project, vpc }).optionsFn())).items.map(
      (router) =>
        queryClient.prefetchQuery(
          routeList({ project, vpc, router: router.name }).optionsFn()
        )
    ),
    queryClient.fetchQuery(siloIpPoolList.optionsFn()).then((pools) => {
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

const poolColHelper = createColumnHelper<InternetGatewayIpPool>()
const addressColHelper = createColumnHelper<InternetGatewayIpAddress>()

type GatewayRoute = { router: string; route: string }
const routeColHelper = createColumnHelper<GatewayRoute>()

export default function InternetGatewayPage() {
  const { project, vpc, gateway } = useInternetGatewaySelector()
  const navigate = useNavigate()
  const { data: gatewayData } = usePrefetchedQuery(gatewayView({ project, vpc, gateway }))
  const { data: gatewayIpPools } = usePrefetchedQuery(
    gatewayIpPoolList({ project, vpc, gateway }).optionsFn()
  )
  const { data: gatewayIpAddresses } = usePrefetchedQuery(
    gatewayIpAddressList({ project, vpc, gateway }).optionsFn()
  )
  const matchingRoutes = useGatewayRoutes({ project, vpc, gateway })

  const { mutateAsync: deleteGateway } = useApiMutation(api.internetGatewayDelete, {
    onSuccess() {
      navigate(pb.vpcInternetGateways({ project, vpc }))
      queryClient.invalidateEndpoint('internetGatewayList')
      // prettier-ignore
      addToast(<>Internet gateway <HL>{gateway}</HL> deleted</>)
    },
  })

  const { mutateAsync: detachPool } = useApiMutation(api.internetGatewayIpPoolDelete, {
    onSuccess(_data, variables) {
      queryClient.invalidateEndpoint('internetGatewayIpPoolList')
      // prettier-ignore
      addToast(<>IP pool <HL>{variables.path.pool}</HL> detached</>)
    },
  })

  const { mutateAsync: detachAddress } = useApiMutation(
    api.internetGatewayIpAddressDelete,
    {
      onSuccess(_data, variables) {
        queryClient.invalidateEndpoint('internetGatewayIpAddressList')
        // prettier-ignore
        addToast(<>IP address <HL>{variables.path.address}</HL> detached</>)
      },
    }
  )

  const makePoolActions = useCallback(
    (pool: InternetGatewayIpPool): MenuAction[] => [
      {
        label: 'Detach',
        className: 'destructive',
        onActivate: () =>
          confirmAction({
            doAction: () =>
              detachPool({
                path: { pool: pool.name },
                query: { project, vpc, gateway },
              }),
            errorTitle: 'Could not detach IP pool',
            modalTitle: 'Detach IP pool',
            modalContent: (
              <p>
                Are you sure you want to detach IP pool <HL>{pool.name}</HL> from gateway{' '}
                <HL>{gateway}</HL>?
              </p>
            ),
            actionType: 'danger',
          }),
      },
    ],
    [detachPool, project, vpc, gateway]
  )

  const makeAddressActions = useCallback(
    (address: InternetGatewayIpAddress): MenuAction[] => [
      {
        label: 'Detach',
        className: 'destructive',
        onActivate: () =>
          confirmAction({
            doAction: () =>
              detachAddress({
                path: { address: address.name },
                query: { project, vpc, gateway },
              }),
            errorTitle: 'Could not detach IP address',
            modalTitle: 'Detach IP address',
            modalContent: (
              <p>
                Are you sure you want to detach IP address <HL>{address.name}</HL> from
                gateway <HL>{gateway}</HL>?
              </p>
            ),
            actionType: 'danger',
          }),
      },
    ],
    [detachAddress, project, vpc, gateway]
  )

  const poolsTable = useReactTable({
    columns: useColsWithActions(
      [
        poolColHelper.accessor('name', {}),
        poolColHelper.accessor('description', Columns.description),
        poolColHelper.accessor('ipPoolId', {
          header: 'IP pool',
          cell: (info) => <IpPoolCell ipPoolId={info.getValue()} />,
        }),
        poolColHelper.accessor('timeCreated', Columns.timeCreated),
      ],
      makePoolActions
    ),
    data: gatewayIpPools.items,
    getCoreRowModel: getCoreRowModel(),
  })

  const addressesTable = useReactTable({
    columns: useColsWithActions(
      [
        addressColHelper.accessor('name', {}),
        addressColHelper.accessor('description', Columns.description),
        addressColHelper.accessor('address', {
          cell: (info) => <CopyableIp ip={info.getValue()} isLinked={false} />,
        }),
        addressColHelper.accessor('timeCreated', Columns.timeCreated),
      ],
      makeAddressActions
    ),
    data: gatewayIpAddresses.items,
    getCoreRowModel: getCoreRowModel(),
  })

  const routesData = useMemo(
    () => (matchingRoutes || []).map(([router, route]) => ({ router, route: route.name })),
    [matchingRoutes]
  )
  const routesTable = useReactTable({
    columns: useMemo(
      () => [
        routeColHelper.accessor('router', {
          header: 'Router',
          cell: (info) => (
            <LinkCell to={pb.vpcRouter({ project, vpc, router: info.getValue() })}>
              {info.getValue()}
            </LinkCell>
          ),
        }),
        routeColHelper.accessor('route', { header: 'Route' }),
      ],
      [project, vpc]
    ),
    data: routesData,
    getCoreRowModel: getCoreRowModel(),
  })

  useQuickActions(
    () => [
      {
        value: 'Attach IP pool',
        navGroup: 'Actions',
        action: pb.vpcInternetGatewayIpPoolsNew({ project, vpc, gateway }),
      },
      {
        value: 'Attach IP address',
        navGroup: 'Actions',
        action: pb.vpcInternetGatewayIpAddressesNew({ project, vpc, gateway }),
      },
    ],
    [project, vpc, gateway]
  )

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Gateway24Icon />}>{gateway}</PageTitle>
        <div className="inline-flex gap-2">
          <DocsPopover
            heading="internet gateways"
            icon={<Gateway16Icon />}
            summary="An internet gateway connects a VPC to the internet, using addresses from an attached IP pool or an attached IP address."
            links={[docLinks.gateways]}
          />
          <MoreActionsMenu label="Internet gateway actions">
            <CopyIdItem id={gatewayData.id} />
            <DropdownMenu.Item
              label="Delete"
              onSelect={confirmDelete({
                doDelete: () =>
                  deleteGateway({
                    path: { gateway },
                    query: { project, vpc, cascade: true },
                  }),
                label: gateway,
                resourceKind: 'internet gateway',
                extraContent:
                  'Any attached IP pools and IP addresses will be detached, and routes targeting this gateway will be deleted.',
              })}
              className="destructive"
            />
          </MoreActionsMenu>
        </div>
      </PageHeader>
      <PropertiesTable columns={2} className="-mt-8 mb-8">
        <PropertiesTable.DescriptionRow description={gatewayData.description} />
        <PropertiesTable.IdRow id={gatewayData.id} />
        <PropertiesTable.DateRow date={gatewayData.timeCreated} label="Created" />
        <PropertiesTable.DateRow date={gatewayData.timeModified} label="Last Modified" />
      </PropertiesTable>
      <Divider className="my-8" />
      <div className="space-y-5">
        <CardBlock>
          <CardBlock.Header
            title="IP pools"
            titleId="ip-pools-label"
            description="Traffic through this gateway uses an address from an attached pool"
          >
            <CreateLink to={pb.vpcInternetGatewayIpPoolsNew({ project, vpc, gateway })}>
              Attach IP pool
            </CreateLink>
          </CardBlock.Header>
          <CardBlock.Body>
            {gatewayIpPools.items.length > 0 ? (
              <Table
                aria-labelledby="ip-pools-label"
                table={poolsTable}
                className="table-inline"
              />
            ) : (
              <TableEmptyBox border={false}>
                <EmptyMessage
                  title="No IP pools attached"
                  body="Attach an IP pool to see it here"
                  buttonText="Attach IP pool"
                  buttonTo={pb.vpcInternetGatewayIpPoolsNew({ project, vpc, gateway })}
                />
              </TableEmptyBox>
            )}
          </CardBlock.Body>
        </CardBlock>

        <CardBlock>
          <CardBlock.Header
            title="IP addresses"
            titleId="ip-addresses-label"
            description="Specific addresses used by traffic through this gateway"
          >
            <CreateLink to={pb.vpcInternetGatewayIpAddressesNew({ project, vpc, gateway })}>
              Attach IP address
            </CreateLink>
          </CardBlock.Header>
          <CardBlock.Body>
            {gatewayIpAddresses.items.length > 0 ? (
              <Table
                aria-labelledby="ip-addresses-label"
                table={addressesTable}
                className="table-inline"
              />
            ) : (
              <TableEmptyBox border={false}>
                <EmptyMessage
                  title="No IP addresses attached"
                  body="Attach an IP address to see it here"
                  buttonText="Attach IP address"
                  buttonTo={pb.vpcInternetGatewayIpAddressesNew({
                    project,
                    vpc,
                    gateway,
                  })}
                />
              </TableEmptyBox>
            )}
          </CardBlock.Body>
        </CardBlock>

        <CardBlock>
          <CardBlock.Header
            title="Routes"
            titleId="routes-label"
            description="VPC router routes targeting this gateway"
          />
          <CardBlock.Body>
            {routesData.length > 0 ? (
              <Table
                aria-labelledby="routes-label"
                table={routesTable}
                className="table-inline"
              />
            ) : (
              <TableEmptyBox border={false}>
                <EmptyMessage
                  title="No routes"
                  body="No VPC router routes target this gateway"
                />
              </TableEmptyBox>
            )}
          </CardBlock.Body>
        </CardBlock>
      </div>
      <Outlet />
    </>
  )
}
