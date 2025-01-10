/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { createColumnHelper } from '@tanstack/react-table'
import { useCallback, useMemo } from 'react'
import { Outlet, useNavigate, type LoaderFunctionArgs } from 'react-router'

import { Networking16Icon, Networking24Icon } from '@oxide/design-system/icons/react'

import {
  apiq,
  apiQueryClient,
  getListQFn,
  queryClient,
  useApiMutation,
  usePrefetchedQuery,
  type RouteDestination,
  type RouterRoute,
  type RouteTarget,
} from '~/api'
import { DocsPopover } from '~/components/DocsPopover'
import { HL } from '~/components/HL'
import { MoreActionsMenu } from '~/components/MoreActionsMenu'
import { routeFormMessage } from '~/forms/vpc-router-route-common'
import { getVpcRouterSelector, useVpcRouterSelector } from '~/hooks/use-params'
import { confirmAction } from '~/stores/confirm-action'
import { addToast } from '~/stores/toast'
import { TypeValueCell } from '~/table/cells/TypeValueCell'
import { useColsWithActions, type MenuAction } from '~/table/columns/action-col'
import { useQueryTable } from '~/table/QueryTable'
import { Badge } from '~/ui/lib/Badge'
import { CreateButton, CreateLink } from '~/ui/lib/CreateButton'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { PropertiesTable } from '~/ui/lib/PropertiesTable'
import { TableControls, TableTitle } from '~/ui/lib/Table'
import { docLinks } from '~/util/links'
import { pb } from '~/util/path-builder'
import type * as PP from '~/util/path-params'

const routerView = ({ project, vpc, router }: PP.VpcRouter) =>
  apiq('vpcRouterView', { path: { router }, query: { vpc, project } })

const routeList = (query: PP.VpcRouter) => getListQFn('vpcRouterRouteList', { query })

export async function loader({ params }: LoaderFunctionArgs) {
  const routerSelector = getVpcRouterSelector(params)
  await Promise.all([
    queryClient.prefetchQuery(routerView(routerSelector)),
    queryClient.prefetchQuery(routeList(routerSelector).optionsFn()),
  ])
  return null
}

const routeTypes = {
  drop: 'Drop',
  ip: 'IP',
  ip_net: 'IP network',
  instance: 'Instance',
  internet_gateway: 'Gateway',
  subnet: 'VPC subnet',
  vpc: 'VPC',
}

// All will have a type and a value except `Drop`, which only has a type
const RouterRouteTypeValueBadge = ({
  type,
  value,
}: {
  type: (RouteDestination | RouteTarget)['type']
  value?: string
}) => {
  return value ? (
    <TypeValueCell key={`${type}|${value}`} type={routeTypes[type]} value={value} />
  ) : (
    <Badge>{routeTypes[type]}</Badge>
  )
}

Component.displayName = 'RouterPage'
export function Component() {
  const { project, vpc, router } = useVpcRouterSelector()
  const { data: routerData } = usePrefetchedQuery(routerView({ project, vpc, router }))

  const { mutateAsync: deleteRouterRoute } = useApiMutation('vpcRouterRouteDelete', {
    onSuccess() {
      apiQueryClient.invalidateQueries('vpcRouterRouteList')
      // We only have the ID, so will show a generic confirmation message
      addToast({ content: 'Route deleted' })
    },
  })

  const actions = useMemo(
    () => [
      {
        label: 'Copy ID',
        onActivate() {
          window.navigator.clipboard.writeText(routerData.id || '')
        },
      },
    ],
    [routerData]
  )

  const emptyState = (
    <EmptyMessage
      icon={<Networking24Icon />}
      title="No routes"
      body="Add a route to see it here"
      buttonText="Add route"
      buttonTo={pb.vpcRouterRoutesNew({ project, vpc, router })}
    />
  )
  const navigate = useNavigate()

  const routerRoutesColHelper = createColumnHelper<RouterRoute>()

  const routerRoutesStaticCols = [
    routerRoutesColHelper.accessor('name', { header: 'Name' }),
    routerRoutesColHelper.accessor('kind', {
      header: 'Kind',
      cell: (info) => <Badge color="neutral">{info.getValue().replace('_', ' ')}</Badge>,
    }),
    routerRoutesColHelper.accessor('destination', {
      header: 'Destination',
      cell: (info) => <RouterRouteTypeValueBadge {...info.getValue()} />,
    }),
    routerRoutesColHelper.accessor('target', {
      header: 'Target',
      cell: (info) => <RouterRouteTypeValueBadge {...info.getValue()} />,
    }),
  ]

  const makeRangeActions = useCallback(
    (routerRoute: RouterRoute): MenuAction[] => [
      {
        label: 'Edit',
        onActivate: () => {
          // the edit view has its own loader, but we can make the modal open
          // instantaneously by preloading the fetch result
          apiQueryClient.setQueryData(
            'vpcRouterRouteView',
            { path: { route: routerRoute.name }, query: { project, vpc, router } },
            routerRoute
          )
          navigate(pb.vpcRouterRouteEdit({ project, vpc, router, route: routerRoute.name }))
        },
        disabled:
          routerRoute.kind === 'vpc_subnet' && routeFormMessage.vpcSubnetNotModifiable,
      },
      {
        label: 'Delete',
        className: 'destructive',
        onActivate: () =>
          confirmAction({
            doAction: () => deleteRouterRoute({ path: { route: routerRoute.id } }),
            errorTitle: 'Could not remove route',
            modalTitle: 'Confirm remove route',
            modalContent: (
              <p>
                Are you sure you want to delete route <HL>{routerRoute.name}</HL>?
              </p>
            ),
            actionType: 'danger',
          }),
        disabled:
          routerData.kind === 'system' && routeFormMessage.noDeletingRoutesOnSystemRouter,
      },
    ],
    [navigate, project, vpc, router, deleteRouterRoute, routerData]
  )
  const columns = useColsWithActions(routerRoutesStaticCols, makeRangeActions)
  const { table } = useQueryTable({
    query: routeList({ project, vpc, router }),
    columns,
    emptyState,
  })
  // user-provided routes cannot be added to a system router
  // https://github.com/oxidecomputer/omicron/blob/914f5fd7d51f9b060dcc0382a30b607e25df49b2/nexus/src/app/vpc_router.rs#L201-L205
  const canCreateNewRoute = routerData.kind === 'custom'

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Networking24Icon />}>{router}</PageTitle>
        <div className="inline-flex gap-2">
          <DocsPopover
            heading="Routers"
            icon={<Networking16Icon />}
            summary="Routers are collections of routes that direct traffic between VPCs and their subnets."
            links={[docLinks.routers]}
          />
          <MoreActionsMenu label="Router actions" actions={actions} />
        </div>
      </PageHeader>
      <PropertiesTable.Group className="-mt-8 mb-16">
        <PropertiesTable>
          <PropertiesTable.DescriptionRow description={routerData.description} />
          <PropertiesTable.Row label="Kind">
            <Badge color="neutral">{routerData.kind}</Badge>
          </PropertiesTable.Row>
        </PropertiesTable>
        <PropertiesTable>
          <PropertiesTable.DateRow date={routerData.timeCreated} label="Created" />
          <PropertiesTable.DateRow date={routerData.timeModified} label="Last Modified" />
        </PropertiesTable>
      </PropertiesTable.Group>
      <TableControls className="mb-3">
        <TableTitle>Routes</TableTitle>
        {canCreateNewRoute ? (
          <CreateLink to={pb.vpcRouterRoutesNew({ project, vpc, router })}>
            New route
          </CreateLink>
        ) : (
          <CreateButton
            disabled
            disabledReason={routeFormMessage.noNewRoutesOnSystemRouter}
          >
            New route
          </CreateButton>
        )}
      </TableControls>
      {table}
      <Outlet />
    </>
  )
}
