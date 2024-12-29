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

import {
  apiQueryClient,
  getListQFn,
  queryClient,
  useApiMutation,
  type VpcRouter,
} from '@oxide/api'

import { HL } from '~/components/HL'
import { routeFormMessage } from '~/forms/vpc-router-route-common'
import { getVpcSelector, useVpcSelector } from '~/hooks/use-params'
import { confirmDelete } from '~/stores/confirm-delete'
import { addToast } from '~/stores/toast'
import { makeLinkCell } from '~/table/cells/LinkCell'
import { useColsWithActions, type MenuAction } from '~/table/columns/action-col'
import { Columns } from '~/table/columns/common'
import { useQueryTable } from '~/table/QueryTable'
import { CreateLink } from '~/ui/lib/CreateButton'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { pb } from '~/util/path-builder'
import type * as PP from '~/util/path-params'

const colHelper = createColumnHelper<VpcRouter>()

const vpcRouterList = (query: PP.Vpc) => getListQFn('vpcRouterList', { query })

export async function loader({ params }: LoaderFunctionArgs) {
  const { project, vpc } = getVpcSelector(params)
  await queryClient.prefetchQuery(vpcRouterList({ project, vpc }).optionsFn())
  return null
}

Component.displayName = 'VpcRoutersTab'
export function Component() {
  const vpcSelector = useVpcSelector()
  const navigate = useNavigate()
  const { project, vpc } = vpcSelector

  const emptyState = (
    <EmptyMessage
      title="No VPC routers"
      body="Create a router to see it here"
      buttonText="New router"
      buttonTo={pb.vpcRoutersNew({ project, vpc })}
    />
  )

  const staticColumns = useMemo(
    () => [
      colHelper.accessor('name', {
        cell: makeLinkCell((router) => pb.vpcRouter({ ...vpcSelector, router })),
      }),
      colHelper.accessor('description', Columns.description),
      colHelper.accessor('timeCreated', Columns.timeCreated),
    ],
    [vpcSelector]
  )

  const { mutateAsync: deleteRouter } = useApiMutation('vpcRouterDelete', {
    onSuccess(_data, variables) {
      apiQueryClient.invalidateQueries('vpcRouterList')
      addToast(<>Router <HL>{variables.path.router}</HL> deleted</>) // prettier-ignore
    },
  })

  const makeActions = useCallback(
    (router: VpcRouter): MenuAction[] => [
      {
        label: 'Edit',
        onActivate: () => {
          // the edit view has its own loader, but we can make the modal open
          // instantaneously by preloading the fetch result
          apiQueryClient.setQueryData(
            'vpcRouterView',
            { path: { router: router.name } },
            router
          )
          navigate(pb.vpcRouterEdit({ project, vpc, router: router.name }))
        },
      },
      {
        label: 'Delete',
        className: 'destructive',
        onActivate: confirmDelete({
          doDelete: () =>
            deleteRouter({
              path: { router: router.name },
              query: { project, vpc },
            }),
          extraContent: 'This will also delete any routes belonging to this router.',
          label: router.name,
        }),
        disabled: router.kind === 'system' && routeFormMessage.noDeletingSystemRouters,
      },
    ],
    [deleteRouter, project, vpc, navigate]
  )

  const columns = useColsWithActions(staticColumns, makeActions)
  const { table } = useQueryTable({
    query: vpcRouterList({ project, vpc }),
    columns,
    emptyState,
  })

  return (
    <>
      <div className="mb-3 flex justify-end space-x-2">
        <CreateLink to={pb.vpcRoutersNew({ project, vpc })}>New router</CreateLink>
      </div>
      {table}
      <Outlet />
    </>
  )
}
