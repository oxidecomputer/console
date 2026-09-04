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
import { useNavigate } from 'react-router'

import {
  api,
  getListQFn,
  q,
  queryClient,
  useApiMutation,
  type AlertReceiver,
} from '@oxide/api'
import { Webhooks24Icon } from '@oxide/design-system/icons/react'

import { AlertClassBadge } from '~/components/AlertClassBadge'
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
    title="No webhook receivers"
    body="Create a webhook receiver to see it here"
    buttonText="New webhook receiver"
    buttonTo={pb.alertReceiversNew()}
  />
)

const colHelper = createColumnHelper<AlertReceiver>()

const staticColumns = [
  colHelper.accessor('name', {
    cell: makeLinkCell((receiver) => pb.alertReceiver({ receiver })),
  }),
  colHelper.accessor('subscriptions', {
    header: 'Subscriptions',
    cell: (info) => (
      <ListPlusCell tooltipTitle="Other subscriptions">
        {info.getValue().map((sub) => (
          <AlertClassBadge key={sub}>{sub}</AlertClassBadge>
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

// this handle is on a pathless layout route, so its pathname is the parent's,
// /system/alerting, which redirects. give the crumb an explicit path so it
// links straight to the list instead
export const handle = makeCrumb('Receivers', pb.alertReceivers())

export default function AlertReceiversTab() {
  const navigate = useNavigate()

  const { mutateAsync: deleteReceiver } = useApiMutation(api.alertReceiverDelete, {
    onSuccess(_data, variables) {
      queryClient.invalidateEndpoint('alertReceiverList')
      // prettier-ignore
      addToast(<>Webhook receiver <HL>{variables.path.receiver}</HL> deleted</>)
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
          resourceKind: 'webhook receiver',
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
        value: 'New webhook receiver',
        navGroup: 'Actions',
        action: pb.alertReceiversNew(),
      },
      ...(allReceivers?.items || []).map((r) => ({
        value: r.name,
        action: pb.alertReceiver({ receiver: r.name }),
        navGroup: 'Go to webhook receiver',
      })),
    ],
    [allReceivers]
  )

  return (
    <>
      {/* webhook receivers are the only kind of alert receiver for now, so the
          button names that kind while the tab itself stays generic */}
      <TableActions>
        <CreateLink to={pb.alertReceiversNew()}>New webhook receiver</CreateLink>
      </TableActions>
      {table}
    </>
  )
}
