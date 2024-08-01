/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { createColumnHelper } from '@tanstack/react-table'
import { useCallback, useMemo } from 'react'
import type { LoaderFunctionArgs } from 'react-router-dom'

import { Networking16Icon, Networking24Icon } from '@oxide/design-system/icons/react'

import {
  apiQueryClient,
  usePrefetchedApiQuery,
  type RouteDestination,
  type RouterRoute,
  type RouteTarget,
} from '~/api'
import { DocsPopover } from '~/components/DocsPopover'
import { HL } from '~/components/HL'
import { MoreActionsMenu } from '~/components/MoreActionsMenu'
import { getVpcRouterSelector, useVpcRouterSelector } from '~/hooks'
import { confirmAction } from '~/stores/confirm-action'
import { EmptyCell } from '~/table/cells/EmptyCell'
import { TypeValueCell } from '~/table/cells/TypeValueCell'
import { useColsWithActions, type MenuAction } from '~/table/columns/action-col'
import { useQueryTable } from '~/table/QueryTable'
import { Badge } from '~/ui/lib/Badge'
import { CreateLink } from '~/ui/lib/CreateButton'
import { DateTime } from '~/ui/lib/DateTime'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { PropertiesTable } from '~/ui/lib/PropertiesTable'
import { docLinks } from '~/util/links'
import { pb } from '~/util/path-builder'

RouterRoutePage.loader = async function ({ params }: LoaderFunctionArgs) {
  const { project, vpc, router } = getVpcRouterSelector(params)
  console.log('loader')
  console.log({ project, vpc, router })
  await Promise.all([
    apiQueryClient.prefetchQuery('vpcRouterView', {
      path: { router },
      query: { project, vpc },
    }),
    apiQueryClient.prefetchQuery('vpcRouterRouteList', { query: { project, router, vpc } }),
  ])
  return null
}

const RouterRouteTypeValueBadge = ({
  targetOrDestination,
}: {
  // typed this way because of RouteTarget's `{ type: 'drop' }`
  targetOrDestination: RouteDestination | (Omit<RouteTarget, 'value'> & { value?: string })
}) => {
  const { type, value } = targetOrDestination
  return value ? (
    <TypeValueCell key={`${type}|value`} type={type} value={value} />
  ) : (
    <Badge>{type}</Badge>
  )
}

export function RouterRoutePage() {
  const { project, vpc, router } = useVpcRouterSelector()
  const { data: routerData } = usePrefetchedApiQuery('vpcRouterView', {
    path: { router },
    query: { project, vpc },
  })
  // probably don't need to both set routerRoutes and use useQueryTable
  const { data: routerRoutes } = usePrefetchedApiQuery('vpcRouterRouteList', {
    query: { project, router, vpc },
  })
  console.log({ routerRoutes })

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
  const { Table } = useQueryTable('vpcRouterRouteList', { query: { project, router, vpc } })

  const emptyState = (
    <EmptyMessage
      icon={<Networking24Icon />}
      title="No router routes"
      body="Add a route to see it here"
      buttonText="Add route"
      buttonTo=""
      // TODO: "add route" button
      // buttonTo={pb.ipPoolRangeAdd({ pool })}
    />
  )

  const routerRoutesColHelper = createColumnHelper<RouterRoute>()

  const routerRoutesStaticCols = [
    routerRoutesColHelper.accessor('name', { header: 'Name' }),
    routerRoutesColHelper.accessor('kind', { header: 'Kind' }),
    routerRoutesColHelper.accessor('target', {
      header: 'Target',
      cell: (info) => <RouterRouteTypeValueBadge targetOrDestination={info.getValue()} />,
    }),
    routerRoutesColHelper.accessor('destination', {
      header: 'Destination',
      cell: (info) => <RouterRouteTypeValueBadge targetOrDestination={info.getValue()} />,
    }),
  ]

  const makeRangeActions = useCallback(
    ({ name }: RouterRoute): MenuAction[] => [
      {
        label: 'Delete',
        className: 'destructive',
        onActivate: () =>
          confirmAction({
            doAction: () => {
              // remove route
              console.log('remove route')
              // removeRange.mutateAsync({
              //   path: { pool },
              //   body: range,
              // }),
              return Promise.resolve()
            },
            errorTitle: 'Could not remove route',
            modalTitle: 'Confirm remove route',
            modalContent: (
              <p>
                Are you sure you want to remove route <HL>{name}</HL>?
              </p>
            ),
            actionType: 'danger',
          }),
      },
    ],
    []
  )
  const columns = useColsWithActions(routerRoutesStaticCols, makeRangeActions)

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Networking24Icon />}>{router}</PageTitle>
        <div className="inline-flex gap-2">
          <DocsPopover
            heading="Routers"
            icon={<Networking16Icon />}
            summary="Routers summary copy TK"
            links={[docLinks.routers]}
          />
          <MoreActionsMenu label="Instance actions" actions={actions} />
        </div>
      </PageHeader>
      <PropertiesTable.Group className="-mt-8 mb-16">
        <PropertiesTable>
          <PropertiesTable.Row label="Description">
            {routerData.description || <EmptyCell />}
          </PropertiesTable.Row>
          <PropertiesTable.Row label="Kind">{routerData.kind}</PropertiesTable.Row>
        </PropertiesTable>
        <PropertiesTable>
          <PropertiesTable.Row label="Created">
            <DateTime date={routerData.timeCreated} />
          </PropertiesTable.Row>
          <PropertiesTable.Row label="Last Modified">
            <DateTime date={routerData.timeModified} />
          </PropertiesTable.Row>
        </PropertiesTable>
      </PropertiesTable.Group>
      <div className="mb-3 flex justify-end">
        <CreateLink to={pb.vpcRouterRoutesNew({ project, vpc, router })}>
          New route
        </CreateLink>
      </div>
      <Table columns={columns} emptyState={emptyState} />
    </>
  )
}
