/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { createColumnHelper } from '@tanstack/react-table'
import { useCallback } from 'react'
import { Outlet, useNavigate } from 'react-router'

import {
  api,
  getListQFn,
  q,
  queryClient,
  useApiMutation,
  type SupportBundleInfo,
} from '@oxide/api'
import { Logs16Icon, Logs24Icon } from '@oxide/design-system/icons/react'

import { DocsPopover } from '~/components/DocsPopover'
import { HL } from '~/components/HL'
import { SupportBundleStateBadge } from '~/components/StateBadge'
import { makeCrumb } from '~/hooks/use-crumbs'
import { useQuickActions } from '~/hooks/use-quick-actions'
import { confirmDelete } from '~/stores/confirm-delete'
import { addToast } from '~/stores/toast'
import { DescriptionCell } from '~/table/cells/DescriptionCell'
import { useColsWithActions, type MenuAction } from '~/table/columns/action-col'
import { Columns } from '~/table/columns/common'
import { useQueryTable } from '~/table/QueryTable'
import { CreateLink } from '~/ui/lib/CreateButton'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { TableActions } from '~/ui/lib/Table'
import { TipIcon } from '~/ui/lib/TipIcon'
import { truncate, Truncate } from '~/ui/lib/Truncate'
import { docLinks } from '~/util/links'
import { pb } from '~/util/path-builder'
import { bundleDownloadUrl, triggerDownload } from '~/util/support-bundle'

const EmptyState = () => (
  <EmptyMessage
    icon={<Logs24Icon />}
    title="No support bundles"
    body="Create a support bundle to see it here"
    buttonText="New support bundle"
    buttonTo={pb.supportBundlesNew()}
  />
)

const StateCell = ({ bundle }: { bundle: SupportBundleInfo }) => (
  <div className="flex items-center gap-1.5">
    <SupportBundleStateBadge state={bundle.state} />
    {bundle.reasonForFailure && <TipIcon>{bundle.reasonForFailure}</TipIcon>}
  </div>
)

const colHelper = createColumnHelper<SupportBundleInfo>()

const staticColumns = [
  colHelper.accessor('id', {
    header: 'ID',
    cell: (info) => (
      <Truncate text={info.getValue()} maxLength={14} position="middle" hasCopyButton />
    ),
  }),
  colHelper.accessor('state', {
    cell: (info) => <StateCell bundle={info.row.original} />,
  }),
  colHelper.accessor('userComment', {
    header: 'Comment',
    cell: (info) => <DescriptionCell text={info.getValue() ?? undefined} />,
  }),
  colHelper.accessor('reasonForCreation', {
    header: 'Reason',
    cell: (info) => <DescriptionCell text={info.getValue()} />,
  }),
  colHelper.accessor('timeCreated', Columns.timeCreated),
]

const SEC = 1000 // ms
const POLL_INTERVAL = 10 * SEC

const bundleList = getListQFn(
  api.supportBundleList,
  { query: { sortBy: 'time_and_id_descending' } },
  {
    refetchInterval: ({ state: { data } }) =>
      data?.items.some((b) => b.state === 'collecting' || b.state === 'destroying')
        ? POLL_INTERVAL
        : false,
  }
)

export async function clientLoader() {
  await queryClient.prefetchQuery(bundleList.optionsFn())
  return null
}

// path is needed because the crumb attaches to a pathless route, whose
// pathname is /system/
export const handle = makeCrumb('Support Bundles', pb.supportBundles())

export default function SupportBundlesPage() {
  const navigate = useNavigate()

  const { mutateAsync: deleteBundle } = useApiMutation(api.supportBundleDelete, {
    onSuccess(_data, variables) {
      queryClient.invalidateEndpoint('supportBundleList')
      // "deleting" rather than "deleted" because the bundle sits in state
      // 'destroying' until a background task frees its backing storage
      // prettier-ignore
      addToast(<>Deleting support bundle <HL>{truncate(variables.path.bundleId, 14, 'middle')}</HL></>)
    },
  })

  const makeActions = useCallback(
    (bundle: SupportBundleInfo): MenuAction[] => [
      {
        label: 'Download',
        onActivate() {
          triggerDownload(bundleDownloadUrl(bundle.id), `support-bundle-${bundle.id}.zip`)
        },
        disabled:
          bundle.state !== 'active' &&
          'Only bundles that have completed collection can be downloaded',
      },
      {
        label: 'Edit comment',
        onActivate() {
          const bundleView = q(api.supportBundleView, {
            path: { bundleId: bundle.id },
          })
          queryClient.setQueryData(bundleView.queryKey, bundle)
          navigate(pb.supportBundleEdit({ bundleId: bundle.id }))
        },
      },
      {
        label: 'Delete',
        onActivate: confirmDelete({
          doDelete: () => deleteBundle({ path: { bundleId: bundle.id } }),
          label: truncate(bundle.id, 14, 'middle'),
          resourceKind: 'support bundle',
          extraContent:
            bundle.state === 'collecting'
              ? 'This bundle is still being collected. Deleting it will cancel collection.'
              : undefined,
        }),
        disabled: bundle.state === 'destroying' && 'Bundle is already being destroyed',
      },
    ],
    [deleteBundle, navigate]
  )

  const columns = useColsWithActions(staticColumns, makeActions)
  const { table } = useQueryTable({
    query: bundleList,
    columns,
    emptyState: <EmptyState />,
  })

  useQuickActions(
    () => [
      {
        value: 'New support bundle',
        navGroup: 'Actions',
        action: pb.supportBundlesNew(),
      },
    ],
    []
  )

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Logs24Icon />}>Support Bundles</PageTitle>
        <DocsPopover
          heading="support bundles"
          icon={<Logs16Icon />}
          summary="Support bundles capture diagnostic data from the rack to share with Oxide Support."
          links={[docLinks.supportBundles]}
        />
      </PageHeader>
      <TableActions>
        <CreateLink to={pb.supportBundlesNew()}>New Support Bundle</CreateLink>
      </TableActions>
      {table}
      <Outlet />
    </>
  )
}
