/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { createColumnHelper } from '@tanstack/react-table'
import { useCallback, useMemo } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'

import {
  apiQueryClient,
  useApiMutation,
  useApiQueryClient,
  usePrefetchedApiQuery,
  type Silo,
} from '@oxide/api'
import { Cloud16Icon, Cloud24Icon } from '@oxide/design-system/icons/react'

import { DocsPopover } from '~/components/DocsPopover'
import { HLs } from '~/components/HL'
import { useQuickActions } from '~/hooks/use-quick-actions'
import { confirmDelete } from '~/stores/confirm-delete'
import { addToast } from '~/stores/toast'
import { BooleanCell } from '~/table/cells/BooleanCell'
import { makeLinkCell } from '~/table/cells/LinkCell'
import { useColsWithActions, type MenuAction } from '~/table/columns/action-col'
import { Columns } from '~/table/columns/common'
import { PAGE_SIZE, useQueryTable } from '~/table/QueryTable'
import { Badge } from '~/ui/lib/Badge'
import { CreateLink } from '~/ui/lib/CreateButton'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { TableActions } from '~/ui/lib/Table'
import { docLinks } from '~/util/links'
import { pb } from '~/util/path-builder'

const EmptyState = () => (
  <EmptyMessage
    icon={<Cloud24Icon />}
    title="No silos"
    body="Create a silo to see it here"
    buttonText="New silo"
    buttonTo={pb.silosNew()}
  />
)

const colHelper = createColumnHelper<Silo>()
const staticCols = [
  colHelper.accessor('name', {
    cell: (info) => makeLinkCell((name) => pb.silo({ silo: name }))(info),
  }),
  colHelper.accessor('description', Columns.description),
  colHelper.accessor('discoverable', {
    cell: (info) => <BooleanCell isTrue={info.getValue()} />,
  }),
  colHelper.accessor((silo) => silo.identityMode, {
    header: 'Identity mode',
    cell: (info) => <Badge>{info.getValue().replace('_', ' ')}</Badge>,
  }),
  colHelper.accessor('timeCreated', Columns.timeCreated),
]

SilosPage.loader = async () => {
  await apiQueryClient.prefetchQuery('siloList', { query: { limit: PAGE_SIZE } })
  return null
}

export function SilosPage() {
  const navigate = useNavigate()

  const { Table } = useQueryTable('siloList', {})
  const queryClient = useApiQueryClient()

  const { data: silos } = usePrefetchedApiQuery('siloList', {
    query: { limit: PAGE_SIZE },
  })

  const { mutateAsync: deleteSilo } = useApiMutation('siloDelete', {
    onSuccess(silo, { path }) {
      queryClient.invalidateQueries('siloList')
      addToast(<>Silo <HLs>{path.silo}</HLs> deleted</>) // prettier-ignore
    },
  })

  const makeActions = useCallback(
    (silo: Silo): MenuAction[] => [
      {
        label: 'Delete',
        onActivate: confirmDelete({
          doDelete: () => deleteSilo({ path: { silo: silo.name } }),
          label: silo.name,
        }),
      },
    ],
    [deleteSilo]
  )

  useQuickActions(
    useMemo(
      () => [
        { value: 'New silo', onSelect: () => navigate(pb.silosNew()) },
        ...silos.items.map((o) => ({
          value: o.name,
          onSelect: () => navigate(pb.silo({ silo: o.name })),
          navGroup: 'Silo detail',
        })),
      ],
      [navigate, silos]
    )
  )

  const columns = useColsWithActions(staticCols, makeActions)

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Cloud24Icon />}>Silos</PageTitle>
        <DocsPopover
          heading="silos"
          icon={<Cloud16Icon />}
          summary="Silos provide strict tenancy separation between groups of users. Each silo has its own resource limits and access policies as well as its own subdomain for the web console and API."
          links={[docLinks.systemSilo]}
        />
      </PageHeader>
      <TableActions>
        <CreateLink to={pb.silosNew()}>New silo</CreateLink>
      </TableActions>
      <Table columns={columns} emptyState={<EmptyState />} />
      <Outlet />
    </>
  )
}
