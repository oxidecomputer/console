/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { useQuery } from '@tanstack/react-query'
import { createColumnHelper } from '@tanstack/react-table'
import { useCallback } from 'react'
import { Outlet, useNavigate } from 'react-router'

import {
  api,
  getListQFn,
  q,
  queryClient,
  useApiMutation,
  type AlertReceiver,
} from '@oxide/api'
import { Webhooks24Icon } from '@oxide/design-system/icons/react'
import { Badge } from '@oxide/design-system/ui'

import { HL } from '~/components/HL'
import { ListPlusCell } from '~/components/ListPlusCell'
import { makeCrumb } from '~/hooks/use-crumbs'
import { useQuickActions } from '~/hooks/use-quick-actions'
import { confirmDelete } from '~/stores/confirm-delete'
import { addToast } from '~/stores/toast'
import { makeLinkCell } from '~/table/cells/LinkCell'
import { useColsWithActions, type MenuAction } from '~/table/columns/action-col'
import { Columns } from '~/table/columns/common'
import { useQueryTable } from '~/table/QueryTable'
import { CreateLink } from '~/ui/lib/CreateButton'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { TableActions } from '~/ui/lib/Table'
import { ALL_ISH } from '~/util/consts'
import { pb } from '~/util/path-builder'

const EmptyState = () => (
  <EmptyMessage
    icon={<Webhooks24Icon />}
    title="No webhooks"
    body="Create a webhook to see it here"
    buttonText="New webhook"
    buttonTo={pb.alertReceiversNew()}
  />
)

const colHelper = createColumnHelper<AlertReceiver>()

const staticColumns = [
  colHelper.accessor('name', {
    cell: makeLinkCell((receiver) => pb.alertReceiver({ receiver })),
  }),
  colHelper.accessor('subscriptions', {
    header: 'Events',
    cell: (info) => (
      <ListPlusCell tooltipTitle="Other events">
        {info.getValue().map((sub) => (
          <Badge key={sub} color="neutral">
            {sub}
          </Badge>
        ))}
      </ListPlusCell>
    ),
  }),
  colHelper.accessor('description', Columns.description),
  colHelper.accessor('timeCreated', Columns.timeCreated),
]

const receiverList = getListQFn(api.alertReceiverList, {})

export async function clientLoader() {
  await queryClient.prefetchQuery(receiverList.optionsFn())
  return null
}

// this handle is on a pathless layout route, so its pathname is /system. give
// the crumb an explicit path so it links to the list instead
export const handle = makeCrumb('Receivers', pb.alertReceivers())

export default function AlertReceiversTab() {
  const navigate = useNavigate()

  const { mutateAsync: deleteReceiver } = useApiMutation(api.alertReceiverDelete, {
    onSuccess(_data, variables) {
      queryClient.invalidateEndpoint('alertReceiverList')
      // prettier-ignore
      addToast(<>Webhook <HL>{variables.path.receiver}</HL> deleted</>)
    },
  })

  const makeActions = useCallback(
    (receiver: AlertReceiver): MenuAction[] => [
      {
        label: 'Edit',
        onActivate: () => {
          // the edit view has its own loader, but we can make the modal open
          // instantaneously by preloading the fetch result
          const receiverView = q(api.alertReceiverView, {
            path: { receiver: receiver.name },
          })
          queryClient.setQueryData(receiverView.queryKey, receiver)
          navigate(pb.alertReceiverEdit({ receiver: receiver.name }))
        },
      },
      {
        label: 'Delete',
        onActivate: confirmDelete({
          doDelete: () => deleteReceiver({ path: { receiver: receiver.name } }),
          label: receiver.name,
          resourceKind: 'webhook',
          extraContent: 'Its delivery history will also be deleted.',
        }),
      },
    ],
    [deleteReceiver, navigate]
  )

  const columns = useColsWithActions(staticColumns, makeActions)
  const { table } = useQueryTable({
    query: receiverList,
    columns,
    emptyState: <EmptyState />,
  })

  const { data: allReceivers } = useQuery(
    q(api.alertReceiverList, { query: { limit: ALL_ISH } })
  )

  useQuickActions(
    () => [
      {
        value: 'New webhook',
        navGroup: 'Actions',
        action: pb.alertReceiversNew(),
      },
      ...(allReceivers?.items || []).map((r) => ({
        value: r.name,
        action: pb.alertReceiver({ receiver: r.name }),
        navGroup: 'Go to webhook',
      })),
    ],
    [allReceivers]
  )

  return (
    <>
      {/* webhooks are the only kind of alert receiver for now, so the tab says
          webhook everywhere while the tab itself is called Receivers */}
      <TableActions>
        <CreateLink to={pb.alertReceiversNew()}>New webhook</CreateLink>
      </TableActions>
      {table}
      <Outlet />
    </>
  )
}
